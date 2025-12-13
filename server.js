// server.js - Servidor inicial

const express = require("express");
const app = express();

app.use(express.json());

const hospedesRoutes = require("./routes/hospedes");
app.use("/hospedes", hospedesRoutes);

const quartosRoutes = require("./routes/quartos");
app.use("/quartos", quartosRoutes);

const reservasRoutes = require("./routes/reservas");
app.use("/reservas", reservasRoutes);

app.use(express.static(__dirname + "/public"));

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});
