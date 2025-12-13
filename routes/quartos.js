const express = require("express");
const router = express.Router();
const pool = require("../db");

// LISTAR TODOS OS QUARTOS
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM quartos ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar quartos" });
  }
});

// BUSCAR QUARTO POR ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM quartos WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Quarto não encontrado" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar quarto" });
  }
});

// CRIAR QUARTO
router.post("/", async (req, res) => {
  const { numero, tipo, diaria, status } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO quartos (numero, tipo, diaria, status) VALUES ($1, $2, $3, $4) RETURNING *",
      [numero, tipo, diaria, status || "livre"]
    );

    res.status(201).json({
      mensagem: "Quarto criado com sucesso",
      quarto: result.rows[0],
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ erro: "Erro ao criar quarto" });
  }
});

// ATUALIZAR QUARTO
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { numero, tipo, diaria, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE quartos 
       SET numero=$1, tipo=$2, diaria=$3, status=$4 
       WHERE id=$5 RETURNING *`,
      [numero, tipo, diaria, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Quarto não encontrado" });
    }

    res.json({
      mensagem: "Quarto atualizado com sucesso",
      quarto: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao atualizar quarto" });
  }
});

// REMOVER QUARTO
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM quartos WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Quarto não encontrado" });
    }

    res.json({ mensagem: "Quarto removido com sucesso" });
  } catch (err) {
    res.status(500).json({ erro: "A exclusão do quarto so é permitido se ele não tiver vinculado ao um reservar. Delete a reserva caso queiro deletar o quarto" });
  }
});

module.exports = router;
