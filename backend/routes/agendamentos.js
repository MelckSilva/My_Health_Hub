const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/auth');

// ─── Listar agendamentos do usuário logado ────────────────────
router.get('/', auth, async (req, res) => {
  const id    = req.user.id;
  const tipo  = req.user.tipo_usuario;

  try {
    let query, params;

    if (tipo === 'cliente') {
      query = `
        SELECT
          a.id_agendamento AS id,
          a.data_hora, a.status, a.duracao, a.observacoes, a.forma_pagamento,
          s.titulo        AS service,
          s.preco,
          u.nome          AS profName,
          u.id_usuario    AS profId
        FROM Agendamento a
        JOIN Servico s ON s.id_servico   = a.id_servico
        JOIN Usuario u ON u.id_usuario   = s.id_profissional
        WHERE a.id_usuario = ?
        ORDER BY a.data_hora DESC
      `;
      params = [id];
    } else {
      // profissional vê os agendamentos dos seus serviços
      query = `
        SELECT
          a.id_agendamento AS id,
          a.data_hora, a.status, a.duracao, a.observacoes, a.forma_pagamento,
          s.titulo        AS service,
          s.preco,
          u.nome          AS clientName,
          u.id_usuario    AS clientId
        FROM Agendamento a
        JOIN Servico s ON s.id_servico  = a.id_servico
        JOIN Usuario u ON u.id_usuario  = a.id_usuario
        WHERE s.id_profissional = ?
        ORDER BY a.data_hora DESC
      `;
      params = [id];
    }

    const [rows] = await db.execute(query, params);

    // Formata para o frontend
    const result = rows.map(r => ({
      ...r,
      date: r.data_hora ? r.data_hora.toISOString().split('T')[0] : null,
      time: r.data_hora ? r.data_hora.toISOString().split('T')[1].slice(0,5) : null,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

// ─── Criar agendamento ────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  if (req.user.tipo_usuario !== 'cliente') {
    return res.status(403).json({ error: 'Apenas clientes podem agendar' });
  }

  const { id_servico, data_hora, duracao, observacoes, forma_pagamento } = req.body;

  if (!id_servico || !data_hora) {
    return res.status(400).json({ error: 'Serviço e data são obrigatórios' });
  }

  try {
    // Verifica se horário já está ocupado para esse profissional
    const [[svc]] = await db.execute(
      'SELECT id_profissional FROM Servico WHERE id_servico = ?', [id_servico]
    );
    if (!svc) return res.status(404).json({ error: 'Serviço não encontrado' });

    const [conflict] = await db.execute(`
      SELECT a.id_agendamento FROM Agendamento a
      JOIN Servico s ON s.id_servico = a.id_servico
      WHERE s.id_profissional = ?
        AND a.data_hora = ?
        AND a.status IN ('pendente','confirmado')
    `, [svc.id_profissional, data_hora]);

    if (conflict.length) {
      return res.status(409).json({ error: 'Horário indisponível' });
    }

    const [result] = await db.execute(
      `INSERT INTO Agendamento (id_usuario, id_servico, data_hora, status, duracao, observacoes, forma_pagamento)
       VALUES (?, ?, ?, 'pendente', ?, ?, ?)`,
      [req.user.id, id_servico, data_hora, duracao || 60, observacoes || null, forma_pagamento || null]
    );

    res.status(201).json({ id: result.insertId, status: 'pendente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});

// ─── Atualizar status ─────────────────────────────────────────
router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  const validStatus = ['pendente','confirmado','cancelado','concluido'];

  if (!validStatus.includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }

  try {
    const [[appt]] = await db.execute(`
      SELECT a.id_agendamento, a.id_usuario, s.id_profissional
      FROM Agendamento a
      JOIN Servico s ON s.id_servico = a.id_servico
      WHERE a.id_agendamento = ?
    `, [req.params.id]);

    if (!appt) return res.status(404).json({ error: 'Agendamento não encontrado' });

    const isOwner = req.user.id === appt.id_usuario || req.user.id === appt.id_profissional;
    if (!isOwner) return res.status(403).json({ error: 'Sem permissão' });

    await db.execute(
      'UPDATE Agendamento SET status = ? WHERE id_agendamento = ?',
      [status, req.params.id]
    );

    res.json({ ok: true, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar agendamento' });
  }
});

module.exports = router;
