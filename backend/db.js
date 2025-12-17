const { Pool } = require("pg");

const db = new Pool({
  host: "localhost",
  user: "postgres",
  password: "1234",
  database: "hotel_registros",
  port: 5432,
});

module.exports = db;