require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();

app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true,
}));
app.use(express.json());

// ─── Rotas ────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/profissionais', require('./routes/profissionais'));
app.use('/api/servicos',      require('./routes/servicos'));
app.use('/api/agendamentos',  require('./routes/agendamentos'));

// ─── Health check ─────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ ok: true }));

// ─── Erro genérico ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno no servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API rodando em http://localhost:${PORT}`));
