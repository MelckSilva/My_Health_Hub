# My Health Hub

Plataforma de saúde e bem-estar — conecta clientes a profissionais de educação física.

---

## Estrutura do projeto

```
myhealthhub/
├── index.html              ← página principal (SPA)
├── css/
│   └── style.css
├── js/
│   └── app.js              ← toda lógica do frontend
└── backend/
    ├── server.js           ← servidor Express
    ├── db.js               ← conexão MySQL
    ├── .env                ← variáveis de ambiente (edite aqui)
    ├── package.json
    ├── middleware/
    │   └── auth.js         ← verificação JWT
    └── routes/
        ├── auth.js         ← POST /api/auth/login | register | GET /me
        ├── profissionais.js ← GET /api/profissionais | /:id | POST /:id/avaliar
        ├── servicos.js     ← GET /api/servicos | POST | PUT /:id
        └── agendamentos.js ← GET /api/agendamentos | POST | PATCH /:id/status
```

---

## Como rodar

### 1. Banco de dados
Importe o script SQL no MySQL Workbench ou terminal:
```bash
mysql -u root -p < bd_myhealthhub.sql
```

### 2. Backend
```bash
cd backend
npm install
# edite o arquivo .env com sua senha do MySQL
node server.js
# ou com hot-reload:
npm run dev
```
A API sobe em http://localhost:3000

### 3. Frontend
Abra o `index.html` com o **Live Server** do VS Code (porta 5500).

---

## Rotas da API

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/register | Cadastro (cliente ou profissional) |
| POST | /api/auth/login | Login → retorna JWT |
| GET | /api/auth/me | Perfil do usuário logado |
| GET | /api/profissionais | Lista profissionais (busca/filtro) |
| GET | /api/profissionais/:id | Detalhe + serviços + avaliações |
| POST | /api/profissionais/:id/avaliar | Avaliar profissional |
| GET | /api/servicos | Lista serviços |
| POST | /api/servicos | Criar serviço (profissional) |
| PUT | /api/servicos/:id | Editar serviço |
| GET | /api/agendamentos | Agendamentos do usuário logado |
| POST | /api/agendamentos | Criar agendamento |
| PATCH | /api/agendamentos/:id/status | Atualizar status |

---

## Tecnologias

- **Frontend:** HTML, CSS, JavaScript vanilla
- **Backend:** Node.js + Express
- **Banco:** MySQL (mysql2)
- **Auth:** JWT + bcrypt
