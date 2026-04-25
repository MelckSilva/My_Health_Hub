# My Health Hub - Gerenciamento de Educadores Físicos

O **My Health Hub** é um ecossistema digital desenvolvido como um marketplace de serviços de saúde. A plataforma visa conectar profissionais de educação física a clientes de forma simplificada, permitindo a busca, comparação e contratação de serviços em um ambiente seguro e centralizado.

## 📝 Definição do Problema
Atualmente, profissionais da saúde e clientes enfrentam dificuldades na centralização de serviços, agendamentos e acompanhamento profissional. O My Health Hub resolve isso ao oferecer uma interface onde o usuário pode encontrar especialistas e gerenciar suas contratações de forma direta.

## 🚀 Tecnologias e Ferramentas
O projeto utiliza uma stack focada em integração e robustez para garantir o fluxo de dados entre profissionais e usuários:

> ⚠️ **Observação:** Como o projeto ainda está em fase de desenvolvimento, as tecnologias utilizadas podem sofrer alterações ao longo do processo.

* **Backend:** FastAPI (Python) para construção de uma API de alto desempenho.
* **Frontend:** Interface Web para interação entre as áreas pública, do usuário e administrativa.
* **Banco de Dados:** MySQL para a modelagem relacional de entidades como Usuários, Profissionais e Agendamentos.
* **Documentação de API:** Swagger para teste de rotas e validação de integração.

## ✨ Principais Funcionalidades
* **Marketplace de Serviços:** Listagem de profissionais com perfis detalhados e avaliações.
* **Sistema de Agendamento:** Controle de horários e contratação de serviços de forma digital.
* **Área do Profissional:** Gerenciamento de serviços oferecidos e visualização de agendamentos.
* **Chat Interno:** Canal de comunicação direta entre o cliente e o educador físico.
* **Sistema de Avaliação:** Feedback estruturado sobre os serviços prestados.

## 🏗️ Arquitetura do Sistema
O sistema foi projetado com foco na modularidade das rotas e na consistência dos dados:

* **Client-side:** Interface voltada para três níveis de acesso: Público, Usuário e Administrativo.
* **Server-side:** Backend em FastAPI que processa as requisições e regras de negócio.
* **Persistence:** Banco de dados relacional MySQL gerenciando entidades complexas e seus relacionamentos (DER).

## 📂 Estrutura do Repositório
```text
my-health-hub/
├── frontend/             
├── backend/              
├── database/             
├── docs/                 
├── .env.example          
├── .gitignore            
└── README.md             
```
## 👥 Equipe

**Integrantes:**
- Andrey Henrique Galbino Silva  
- Carlos Eduardo Rodrigues Silva  
- Carlos Eduardo Spacca Lopes  
- Daniel Lucarelli Cerri  
- Melck Silva de Oliveira Nascimento  
- Murilo Moretto Marques  

**Orientador:** Prof. Elvio  

---

## 🎓 Contexto Acadêmico

**Projeto de Extensão:** Fábrica de Software: Desenvolvimento de Websites, Aplicativos e Jogos  
**Instituição:** Universidade Sagrado Coração (Unisagrado)  

Este projeto visa aplicar conhecimentos técnicos em uma solução real de impacto social e profissional.