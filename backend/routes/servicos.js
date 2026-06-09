const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/auth');

// ─── Listar todos os serviços ─────────────────────────────────
router.get('/', async (req, res) => {
  const { search = '', categoria = '' } = req.query;

  try {
    let query = `
      SELECT s.*, u.nome AS profissional_nome
      FROM Servico s
      JOIN Usuario u ON u.id_usuario = s.id_profissional
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (s.titulo LIKE ? OR s.categoria LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    if (categoria) {
      query += ` AND s.categoria = ?`;
      params.push(categoria);
    }

    query += ' ORDER BY s.preco ASC';

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

// ─── Criar serviço (profissional autenticado) ─────────────────
router.post('/', auth, async (req, res) => {
  if (req.user.tipo_usuario !== 'profissional') {
    return res.status(403).json({ error: 'Apenas profissionais podem criar serviços' });
  }

  const { titulo, descricao, preco, tipo, categoria } = req.body;
  if (!titulo || !preco) {
    return res.status(400).json({ error: 'Título e preço são obrigatórios' });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO Servico (id_profissional, titulo, descricao, preco, tipo, categoria)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, titulo, descricao || null, preco, tipo || null, categoria || null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar serviço' });
  }
});

// ─── Editar serviço ───────────────────────────────────────────
router.put('/:id', auth, async (req, res) => {
  const { titulo, descricao, preco, tipo, categoria } = req.body;

  try {
    const [[svc]] = await db.execute(
      'SELECT id_profissional FROM Servico WHERE id_servico = ?', [req.params.id]
    );
    if (!svc) return res.status(404).json({ error: 'Serviço não encontrado' });
    if (svc.id_profissional !== req.user.id) return res.status(403).json({ error: 'Sem permissão' });

    await db.execute(
      `UPDATE Servico SET titulo=?, descricao=?, preco=?, tipo=?, categoria=? WHERE id_servico=?`,
      [titulo, descricao, preco, tipo, categoria, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar serviço' });
  }
});

module.exports = router;
