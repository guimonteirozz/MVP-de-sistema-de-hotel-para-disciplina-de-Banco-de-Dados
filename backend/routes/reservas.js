const express = require("express");
const router = express.Router();
const pool = require("../db");

// Função para calcular dias entre datas
function calcularDias(dataEntrada, dataSaida) {
  const entrada = new Date(dataEntrada);
  const saida = new Date(dataSaida);

  const diff = saida.getTime() - entrada.getTime();
  return diff / (1000 * 60 * 60 * 24);
}

/* ============================
   GET - Listar todas as reservas
============================ */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.id_hospede, h.nome AS nome_hospede,
             r.id_quarto, q.numero AS numero_quarto,
             r.data_entrada, r.data_saida, r.valor_total
      FROM reservas r
      JOIN hospedes h ON r.id_hospede = h.id
      JOIN quartos q ON r.id_quarto = q.id
      ORDER BY r.id;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Erro GET /reservas", err);
    res.status(500).json({ erro: "Erro ao listar reservas" });
  }
});

/* ============================
   GET - Buscar reserva por ID
============================ */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT r.id, r.id_hospede, h.nome AS nome_hospede,
             r.id_quarto, q.numero AS numero_quarto,
             r.data_entrada, r.data_saida, r.valor_total
      FROM reservas r
      JOIN hospedes h ON r.id_hospede = h.id
      JOIN quartos q ON r.id_quarto = q.id
      WHERE r.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Reserva não encontrada" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar reserva" });
  }
});

/* ============================
   POST - Criar reserva
============================ */
router.post("/", async (req, res) => {
  const { id_hospede, id_quarto, data_entrada, data_saida } = req.body;

  if (!id_hospede || !id_quarto || !data_entrada || !data_saida) {
    return res.status(400).json({
      erro: "Campos obrigatórios: id_hospede, id_quarto, data_entrada, data_saida"
    });
  }

  try {
    // Verificar se hóspede existe
    const hospede = await pool.query("SELECT id FROM hospedes WHERE id = $1", [id_hospede]);
    if (hospede.rows.length === 0) {
      return res.status(404).json({ erro: "Hóspede não encontrado" });
    }

    // Verificar se quarto existe
    const quarto = await pool.query("SELECT * FROM quartos WHERE id = $1", [id_quarto]);
    if (quarto.rows.length === 0) {
      return res.status(404).json({ erro: "Quarto não encontrado" });
    }

    // Verificar se o quarto está livre no período
    const conflito = await pool.query(
      `
      SELECT * FROM reservas
      WHERE id_quarto = $1
      AND data_saida > $2
      AND data_entrada < $3
      `,
      [id_quarto, data_entrada, data_saida]
    );

    if (conflito.rows.length > 0) {
      return res.status(409).json({
        erro: "O quarto já está reservado neste período"
      });
    }

    // Calcular dias e valor total
    const dias = calcularDias(data_entrada, data_saida);
    const valor_total = dias * quarto.rows[0].preco;

    // Criar reserva
    const insert = await pool.query(
      `
      INSERT INTO reservas (id_hospede, id_quarto, data_entrada, data_saida, valor_total)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [id_hospede, id_quarto, data_entrada, data_saida, valor_total]
    );

    // Atualiza status do quarto para ocupado
    await pool.query("UPDATE quartos SET status = 'ocupado' WHERE id = $1", [id_quarto]);

    res.status(201).json(insert.rows[0]);

  } catch (err) {
    console.error("Erro POST /reservas", err);
    res.status(500).json({ erro: "Erro ao criar reserva" });
  }
});

/* ============================
   DELETE - Cancelar reserva
============================ */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const reserva = await pool.query("SELECT id_quarto FROM reservas WHERE id = $1", [id]);

    if (reserva.rows.length === 0) {
      return res.status(404).json({ erro: "Reserva não encontrada" });
    }

    const idQuarto = reserva.rows[0].id_quarto;

    // Remover reserva
    await pool.query("DELETE FROM reservas WHERE id = $1", [id]);

    // Liberar o quarto
    await pool.query("UPDATE quartos SET status = 'livre' WHERE id = $1", [idQuarto]);

    res.json({ mensagem: "Reserva cancelada e quarto liberado" });

  } catch (err) {
    console.error("Erro DELETE /reservas/:id", err);
    res.status(500).json({ erro: "Erro ao deletar reserva" });
  }
});

module.exports = router;
