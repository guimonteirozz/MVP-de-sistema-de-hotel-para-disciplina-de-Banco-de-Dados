// routes/hospedes.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /hospedes - listar todos
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, nome, cpf, telefone, email FROM hospedes ORDER BY id"
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro GET /hospedes", err);
    res.status(500).json({ erro: "Erro ao listar hóspedes" });
  }
});

// GET /hospedes - pegar por id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      "SELECT id, nome, cpf, telefone, email FROM hospedes WHERE id = $1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ erro: "Hóspede não encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Erro GET /hospedes/:id", err);
    res.status(500).json({ erro: "Erro ao buscar hóspede" });
  }
});

// POST /hospedes - criar
router.post("/", async (req, res) => {
  const { nome, cpf, telefone, email } = req.body;
  if (!nome || !cpf || !telefone || !email) {
    return res
      .status(400)
      .json({ erro: "Campos obrigatórios: nome, cpf, telefone, email" });
  }

  try {
    const sql =
      "INSERT INTO hospedes (nome, cpf, telefone, email) VALUES ($1, $2, $3, $4) RETURNING id, nome, cpf, telefone, email";
    const { rows } = await pool.query(sql, [nome, cpf, telefone, email]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Erro POST /hospedes", err);
    // detectar violação de unique (cpf/email)
    if (err.code === "23505") {
      return res.status(409).json({ erro: "CPF ou email já cadastrado" });
    }
    res.status(500).json({ erro: "Erro ao criar hóspede" });
  }
});

// PUT /hospedes/:id - atualizar
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, cpf, telefone, email } = req.body;
  if (!nome || !cpf || !telefone || !email) {
    return res
      .status(400)
      .json({ erro: "Campos obrigatórios: nome, telefone, email" });
  }

  try {
    const sql =
      "UPDATE hospedes SET nome = $1,  cpf = $2, telefone = $3, email = $4 WHERE id = $5 RETURNING id, nome, cpf, telefone, email";
    const { rows } = await pool.query(sql, [nome, cpf, telefone, email, id]);
    if (rows.length === 0)
      return res.status(404).json({ erro: "Hóspede não encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Erro PUT /hospedes/:id", err);
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ erro: "Email já cadastrado por outro hóspede" });
    }
    res.status(500).json({ erro: "Erro ao atualizar hóspede" });
  }
});

// REMOVER HÓSPEDE
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar se existe reserva vinculada ao hóspede
    const check = await pool.query(
      "SELECT id FROM reservas WHERE id_hospede = $1 LIMIT 1",
      [id]
    );

    if (check.rows.length > 0) {
      return res.status(403).json({
        erro:
          "A exclusão do hóspede só é permitida se ele não tiver uma reserva vinculada. Delete a reserva primeiro."
      });
    }

    // Tentar remover
    const result = await pool.query(
      "DELETE FROM hospedes WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Hóspede não encontrado" });
    }

    res.json({ mensagem: "Hóspede removido com sucesso" });
  } catch (err) {
    console.error("Erro DELETE /hospedes/:id", err);
    res.status(500).json({
      erro:
        "Erro interno ao tentar remover hóspede"
    });
  }
});



module.exports = router;