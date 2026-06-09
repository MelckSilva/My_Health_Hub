const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/auth');

// ─── Listar profissionais (com filtro e busca) ────────────────
router.get('/', async (req, res) => {
  const { search = '', especialidade = '' } = req.query;

  try {
    let query = `
      SELECT
        u.id_usuario        AS id,
        u.nome              AS name,
        pp.cref,
        pp.descricao        AS bio,
        pp.metodologia,
        COALESCE(AVG(av.nota), 0)   AS rating,
        COUNT(DISTINCT av.id_avaliacao) AS reviews,
        MIN(s.preco)        AS price,
        GROUP_CONCAT(DISTINCT e.nome_especialidade) AS tags
      FROM Usuario u
      JOIN Perfil_Profissional pp ON pp.id_usuario = u.id_usuario
      LEFT JOIN Avaliacao av      ON av.id_profissional = u.id_usuario
      LEFT JOIN Servico s         ON s.id_profissional  = u.id_usuario
      LEFT JOIN Profissional_Especialidade pe ON pe.id_profissional = u.id_usuario
      LEFT JOIN Especialidade e   ON e.id_especialidade = pe.id_especialidade
      WHERE u.tipo_usuario = 'profissional'
    `;

    const params = [];

    if (search) {
      query += ` AND (u.nome LIKE ? OR e.nome_especialidade LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (especialidade) {
      query += ` AND e.nome_especialidade = ?`;
      params.push(especialidade);
    }

    query += ' GROUP BY u.id_usuario ORDER BY rating DESC';

    const [rows] = await db.execute(query, params);

    const result = rows.map(r => ({
      ...r,
      rating:   parseFloat(r.rating).toFixed(1),
      tags:     r.tags ? r.tags.split(',') : [],
      initials: r.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase(),
      specialty: 'Educador(a) Físico(a)',
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar profissionais' });
  }
});

// ─── Detalhe de um profissional ───────────────────────────────
router.get('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    // Dados principais
    const [[prof]] = await db.execute(`
      SELECT u.id_usuario AS id, u.nome AS name, pp.cref, pp.descricao AS bio,
             pp.metodologia, pp.formacao, pp.certificados,
             COALESCE(AVG(av.nota), 0) AS rating,
             COUNT(DISTINCT av.id_avaliacao) AS reviews
      FROM Usuario u
      JOIN Perfil_Profissional pp ON pp.id_usuario = u.id_usuario
      LEFT JOIN Avaliacao av ON av.id_profissional = u.id_usuario
      WHERE u.id_usuario = ? AND u.tipo_usuario = 'profissional'
      GROUP BY u.id_usuario
    `, [id]);

    if (!prof) return res.status(404).json({ error: 'Profissional não encontrado' });

    // Especialidades
    const [especialidades] = await db.execute(`
      SELECT e.nome_especialidade AS nome
      FROM Profissional_Especialidade pe
      JOIN Especialidade e ON e.id_especialidade = pe.id_especialidade
      WHERE pe.id_profissional = ?
    `, [id]);

    // Serviços
    const [servicos] = await db.execute(
      'SELECT * FROM Servico WHERE id_profissional = ?', [id]
    );

    // Avaliações
    const [avaliacoes] = await db.execute(`
      SELECT av.nota, av.comentario, av.data_avaliacao, u.nome AS cliente
      FROM Avaliacao av
      JOIN Usuario u ON u.id_usuario = av.id_usuario
      WHERE av.id_profissional = ?
      ORDER BY av.data_avaliacao DESC
      LIMIT 10
    `, [id]);

    res.json({
      ...prof,
      rating:       parseFloat(prof.rating).toFixed(1),
      initials:     prof.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase(),
      tags:         especialidades.map(e => e.nome),
      services:     servicos,
      avaliacoes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar profissional' });
  }
});

// ─── Avaliar profissional ─────────────────────────────────────
router.post('/:id/avaliar', auth, async (req, res) => {
  const { nota, comentario, id_agendamento } = req.body;
  const id_profissional = req.params.id;
  const id_usuario = req.user.id;

  if (!nota || nota < 1 || nota > 5) {
    return res.status(400).json({ error: 'Nota deve ser entre 1 e 5' });
  }

  try {
    await db.execute(
      `INSERT INTO Avaliacao (id_usuario, id_profissional, id_agendamento, nota, comentario)
       VALUES (?, ?, ?, ?, ?)`,
      [id_usuario, id_profissional, id_agendamento || null, nota, comentario || null]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar avaliação' });
  }
});

module.exports = router;
