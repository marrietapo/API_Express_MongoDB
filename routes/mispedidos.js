const mongoose = require("mongoose");
const express = require("express");
const Router = express.Router();
const RestError = require("../rest-error");
const { ReplSet } = require("mongodb");


const Pedidos = mongoose.model("Pedidos", require("../schemas/pedido"));

//Mis pedidos
Router.get("/mispedidos", function (req, res, next) {

  Query = Pedidos.find({ usuario: req.query.usuario });
  Query.sort({ fecha: 1 });
  Query.populate("local", "nombre");
  Query.populate("usuario", "-password");
  Query.populate({
    path: "preparaciones",
    populate: {
      path: "preparacion",
      model: "Preparacion",
      select: "-_id -puntuaciones -comentarios",
    },
  });
  Query.exec(function (err, pedidos) {
    if (!err) {
      res.json(pedidos);
    } else {
      next(new RestError(err.message, 500));
    }
  });
});

module.exports = Router;
