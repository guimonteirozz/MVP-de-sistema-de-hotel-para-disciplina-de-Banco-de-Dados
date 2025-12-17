const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());


const hospdeRoute = require("./routes/hospedes.js");
app.use("/hospedes", hospdeRoute);

const quartoRoute = require("./routes/quartos.js");
app.use("/quartos", quartoRoute);

const reservaRoute = require("./routes/reservas.js");
app.use("/reservas", reservaRoute);

app.use(express.static(path.join(__dirname, "..", "public")));

const PORT = 3000
app.listen(PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${PORT}`);
});
