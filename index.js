const express = require("express");
const app = express();
const mongoose = require("mongoose");
const RestError = require("./rest-error");
const usuario = require("./routes/usuario");
const local = require("./routes/local");
const pedido = require("./routes/pedido");
const preparacion = require("./routes/preparacion");
const mispedidos = require("./routes/mispedidos");
const login = require("./routes/login");

require("dotenv").config();

const uri = 'mongodb+srv://marrieta:myPassword@pdp.f4dvu.mongodb.net/ODSS?retryWrites=true&w=majority';
//const uri = process.env.MONGODB_URI;
//const uri = "mongodb://localhost:27017/ODSS";
const options = { useNewUrlParser: true, useUnifiedTopology: true };

//Evento
mongoose.connect(uri, options).catch((error) => {
  console.log("Hubo un error de conexion", error.message);
});

//const conn = mongoose.connection;
mongoose.connection.on("error", (error) => {
  console.log("Hubo un error de conexion", error.message);
});


const jwt = require("jsonwebtoken");
const authorize = function (req, res, next) {
  if ("/login" == req.path || ("/usuarios"== req.path && "POST" == req.method)) {
    next();
    return;
  }
  //recibimos el token enviado por header.
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    next(new RestError("unauthorized", 401));
    return;
  }
  //envio Authorization: Bearer 1234
  const token = authHeader.split(" ")[1];
  if (!token) {
    next(new RestError("unauthorized", 401));
    return;
  }
  jwt.verify(token, process.env.TOKEN_SECRET, function (err, usr) {
    if (err) {
      next(new RestError(err.message, 401));
      return;
    }
    //agregamos el usuario a instancia de request para
    //tenerlo disponible en requests subsiguientes.
    req.user = usr;
    next();
  });
};

app.use(express.json());
app.use(authorize);
app.use(usuario);
app.use(local);
app.use(mispedidos);
app.use(pedido);
app.use(preparacion);
app.use(login);

app.use((err, req, res, next) => {
  res.status(err instanceof RestError ? err.status : 500);
  res.json({ error: err.message });
});

app.listen(process.env.PORT, function () {
  console.log(`Conectado a ${process.env.PORT}`);
});
