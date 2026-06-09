CREATE DATABASE IF NOT EXISTS bd_myhealthhub;
USE bd_myhealthhub;

CREATE TABLE Usuario (
    id_usuario        INT AUTO_INCREMENT PRIMARY KEY,
    nome              VARCHAR(100)  NOT NULL,
    email             VARCHAR(100)  NOT NULL UNIQUE,
    senha             VARCHAR(255)  NOT NULL,
    telefone          VARCHAR(20)   NOT NULL UNIQUE,
    data_nascimento   DATE          NOT NULL,
    cpf               VARCHAR(14)   NOT NULL UNIQUE,
    tipo_usuario      ENUM('cliente', 'profissional') NOT NULL
);

CREATE TABLE Perfil_Cliente (
    id_perfil_cliente       INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario              INT          NOT NULL UNIQUE,
    objetivo                VARCHAR(100),
    nivel                   VARCHAR(20),
    preferencia_atendimento VARCHAR(20),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Dados_Fisicos (
    id_dados    INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario  INT   NOT NULL,
    peso        FLOAT,
    altura      FLOAT,
    data  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Perfil_Profissional (
    id_perfil_profissional  INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario              INT  NOT NULL UNIQUE,
    cref                    VARCHAR(50) NOT NULL,
    descricao               TEXT,
    metodologia             TEXT,
    formacao                TEXT,
    certificados            TEXT,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Especialidade (
    id_especialidade    INT AUTO_INCREMENT PRIMARY KEY,
    nome_especialidade  VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Profissional_Especialidade (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    id_profissional         INT NOT NULL,   -- aponta para Usuario (tipo = 'profissional')
    id_especialidade        INT NOT NULL,
    UNIQUE (id_profissional, id_especialidade),
    FOREIGN KEY (id_profissional)  REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_especialidade) REFERENCES Especialidade(id_especialidade)
);

CREATE TABLE Servico (
    id_servico      INT AUTO_INCREMENT PRIMARY KEY,
    id_profissional INT            NOT NULL,
    titulo          VARCHAR(100)   NOT NULL,
    descricao       TEXT,
    preco           DECIMAL(10,2)  NOT NULL,
    tipo            VARCHAR(20),
    categoria       VARCHAR(50),
    FOREIGN KEY (id_profissional) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Agendamento (
    id_agendamento  INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario      INT          NOT NULL,
    id_servico      INT          NOT NULL,
    data_hora       DATETIME     NOT NULL,
    status          ENUM('pendente','confirmado','cancelado','concluido') DEFAULT 'pendente',
    duracao         INT,                    -- duração em minutos
    observacoes     TEXT,
    forma_pagamento ENUM('cartao','pix','dinheiro'),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_servico) REFERENCES Servico(id_servico)
);

CREATE TABLE Avaliacao (
    id_avaliacao    INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario      INT  NOT NULL,
    id_profissional INT  NOT NULL,
    id_agendamento  INT,                    -- opcional
    nota            INT  CHECK (nota BETWEEN 1 AND 5),
    comentario      TEXT,
    data_avaliacao  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario)      REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_profissional) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_agendamento)  REFERENCES Agendamento(id_agendamento)
);

CREATE TABLE Conversa (
    id_conversa     INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario      INT       NOT NULL,
    id_profissional INT       NOT NULL,
    criada_em       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_usuario, id_profissional),
    FOREIGN KEY (id_usuario)      REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_profissional) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Mensagem (
    id_mensagem  INT AUTO_INCREMENT PRIMARY KEY,
    id_conversa  INT       NOT NULL,
    id_remetente INT       NOT NULL,        
    mensagem     TEXT      NOT NULL,
    enviada_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_conversa)  REFERENCES Conversa(id_conversa),
    FOREIGN KEY (id_remetente) REFERENCES Usuario(id_usuario)
);


INSERT INTO Usuario (nome, email, senha, telefone, data_nascimento, cpf, tipo_usuario)
VALUES
    ('Andrey',        'andrey@gmail.com',  '123098', '14991137290', '2005-10-05', '482.048.188-65', 'cliente'),
    ('Personal João', 'joao@email.com',    '123',    '14991230001', '1990-03-15', '111.222.333-44', 'profissional');


INSERT INTO Perfil_Cliente (id_usuario, objetivo, nivel, preferencia_atendimento)
VALUES (1, 'Perder peso', 'iniciante', 'presencial');


INSERT INTO Dados_Fisicos (id_usuario, peso, altura, data)
VALUES (1, 80.5, 1.75, '2026-04-01');


INSERT INTO Perfil_Profissional (id_usuario, cref, descricao, metodologia)
VALUES (2, 'CREF 123456-G/SP', 'Especialista em emagrecimento', 'Treinos funcionais');


INSERT INTO Especialidade (nome_especialidade)
VALUES ('Musculação'), ('Funcional'), ('Emagrecimento');

INSERT INTO Profissional_Especialidade (id_profissional, id_especialidade)
VALUES (2, 1), (2, 3);


INSERT INTO Servico (id_profissional, titulo, descricao, preco, tipo, categoria)
VALUES (2, 'Treino Personalizado', 'Treino individualizado 1h', 100.00, 'presencial', 'musculacao');


INSERT INTO Agendamento (id_usuario, id_servico, data_hora, status, duracao, forma_pagamento)
VALUES (1, 1, '2026-04-20 10:00:00', 'confirmado', 60, 'pix');


INSERT INTO Avaliacao (id_usuario, id_profissional, id_agendamento, nota, comentario)
VALUES (1, 2, 1, 5, 'Excelente profissional!');


INSERT INTO Conversa (id_usuario, id_profissional)
VALUES (1, 2);

INSERT INTO Mensagem (id_conversa, id_remetente, mensagem)
VALUES (1, 1, 'Olá, gostaria de contratar seu serviço');

SELECT
    u.nome                  AS cliente,
    p.nome                  AS profissional,
    s.titulo                AS servico,
    a.data_hora,
    a.status,
    a.duracao               AS duracao_min,
    a.forma_pagamento
FROM Agendamento a
JOIN Usuario  u ON a.id_usuario      = u.id_usuario
JOIN Servico  s ON a.id_servico      = s.id_servico
JOIN Usuario  p ON s.id_profissional = p.id_usuario;
