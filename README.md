# 🏋️ My Health Hub

Marketplace de serviços de saúde que conecta profissionais de educação física a clientes, permitindo busca, comparação e contratação de serviços em um ambiente centralizado.

> ⚠️ **Projeto em desenvolvimento ativo** — estrutura e tecnologias podem sofrer alterações.

**Projeto de Extensão:** Fábrica de Software: Desenvolvimento de Websites, Aplicativos e Jogos  
**Instituição:** Universidade Sagrado Coração (Unisagrado) · Bauru - SP

---

## Funcionalidades Planejadas

- **Marketplace de profissionais** — listagem com perfis detalhados, especialidades e avaliações
- **Sistema de agendamento** — controle de horários e contratação de serviços
- **Área do profissional** — gerenciamento de serviços e visualização de agendamentos
- **Chat interno** — comunicação direta entre cliente e educador físico
- **Sistema de avaliação** — feedback estruturado sobre serviços prestados

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Backend | FastAPI (Python) |
| Frontend | HTML, CSS, JavaScript |
| Banco de Dados | MySQL |
| ORM | SQLAlchemy |
| Validação | Pydantic |
| Autenticação | JWT (python-jose) + bcrypt |
| Documentação de API | Swagger (integrado ao FastAPI) |

---

## Estrutura do Repositório

```
my-health-hub/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── database.py       # Conexão e sessão SQLAlchemy
│   │   │   └── security.py       # Autenticação JWT
│   │   ├── models/               # Entidades do banco (SQLAlchemy)
│   │   │   ├── user.py
│   │   │   ├── professional.py
│   │   │   ├── service.py
│   │   │   └── appointment.py
│   │   ├── schemas/              # Validação de dados (Pydantic)
│   │   ├── routers/              # Endpoints da API
│   │   ├── crud/                 # Operações com o banco
│   │   └── main.py               # Ponto de entrada da API
│   └── requirements.txt
│
├── frontend/
│   ├── assets/
│   ├── css/
│   ├── js/
│   └── pages/
│
├── database/                     # Scripts SQL
├── docs/                         # Documentação técnica
├── .env.example
├── .gitignore
└── README.md
```

---

## Instalação e Execução

### Pré-requisitos

- Python 3.10+
- MySQL Server
- pip

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/my-health-hub.git
cd my-health-hub
```

### 2. Configurar o ambiente virtual

```bash
cd backend

# Linux/macOS
python3 -m venv venv && source venv/bin/activate

# Windows
python -m venv venv && venv\Scripts\activate
```

### 3. Instalar dependências

```bash
pip install -r requirements.txt
```

### 4. Configurar variáveis de ambiente

Crie um arquivo `.env` dentro de `backend/` com base no `.env.example`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=my_health_hub
```

### 5. Executar a API

```bash
uvicorn app.main:app --reload
```

A API estará disponível em `http://localhost:8000`.  
A documentação interativa (Swagger) em `http://localhost:8000/docs`.

---

## Endpoints Disponíveis

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Health check da API |
| GET | `/users/` | Listar usuários |
| GET | `/professionals/` | Listar profissionais |
| GET | `/services/` | Listar serviços |
| GET | `/appointments/` | Listar agendamentos |
| — | `/auth/` | Autenticação *(em desenvolvimento)* |

---

## Status do Projeto

| Componente | Status |
|---|---|
| Estrutura do backend | ✅ Concluído |
| Modelos e schemas | ✅ Concluído |
| Rotas de listagem | ✅ Concluído |
| CRUD completo | 🔄 Em desenvolvimento |
| Autenticação JWT | 🔄 Em desenvolvimento |
| Frontend | 🔄 Em desenvolvimento |
| Schema SQL | 🔄 Em desenvolvimento |
| Testes | ⏳ Pendente |

---

## Equipe

| Nome |
|---|
| Andrey Henrique Galbino Silva |
| Carlos Eduardo Rodrigues Silva |
| Carlos Eduardo Spacca Lopes |
| Daniel Lucarelli Cerri |
| Melck Silva de Oliveira Nascimento |
| Murilo Moretto Marques |

**Orientador:** Prof. Elvio
