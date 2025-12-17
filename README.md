# 🏨 Sistema de Hotel – MVP Acadêmico

Projeto desenvolvido para a disciplina de **Banco de Dados**, com o objetivo de aplicar na prática os conceitos de modelagem relacional e operações CRUD.

---

## 📌 Objetivo do Projeto

Criar um **MVP (Produto Mínimo Viável)** de um sistema de hotel, focado no **banco de dados**, não sendo necessário um sistema completo, mas funcional para demonstração acadêmica.

---

## 🗄️ Arquitetura do Banco de Dados

O banco de dados é composto por três entidades principais:

### 👤 Hóspedes
- Armazena informações dos clientes do hotel.
- Campos principais: `id`, `nome`, `cpf`, `telefone`, `email`.

### 🛏️ Quartos
- Representa os quartos disponíveis no hotel.
- Campos principais: `id`, `numero`, `tipo`, `diaria`, `status`.

### 📅 Reservas
- Relaciona hóspedes e quartos.
- Campos principais: `id`, `id_hospede`, `id_quarto`, `data_entrada`, `data_saida`, `valor_total`.

---

## 🔗 Relacionamentos

- Um **hóspede** pode ter várias **reservas**.
- Um **quarto** pode estar em várias **reservas**, em períodos diferentes.
- A tabela **reservas** utiliza **chaves estrangeiras** e garante integridade referencial.

---

## 🔑 Chaves e Restrições

- **Chaves primárias** (`PRIMARY KEY`) em todas as tabelas.
- **Chaves estrangeiras** (`FOREIGN KEY`) na tabela reservas.
- Campos obrigatórios com `NOT NULL`.
- Campos únicos (`UNIQUE`) para CPF, email e número do quarto.
- Uso de `SERIAL` para auto incremento.

---

## ⚙️ Tecnologias Utilizadas

- **PostgreSQL** – Banco de dados relacional
- **Node.js + Express** – Backend
- **HTML, CSS e JavaScript** – Frontend
- **Bootstrap** – Interface
- **Reveal.js** – Slides da apresentação
- **Git & GitHub** – Versionamento

---

## 🔄 Funcionalidades (CRUD)

O sistema permite:
- Criar, listar, atualizar e remover **hóspedes**
- Criar, listar, atualizar e remover **quartos**
- Criar, listar e remover **reservas**
