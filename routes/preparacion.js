const mongoose = require("mongoose");
const express = require("express");
const Router = express.Router();
const RestError = require("../rest-error");
const { ReplSet } = require("mongodb");

const Preparacion = mongoose.model(
  "Preparacion",
  require("../schemas/preparacion")
);

Router.post("/preparaciones", function (req, res, next) {
  Pr = new Preparacion(req.body);

  Pr.save(function (err, doc) {
    if (err) {
      //evalua errores en base de datos
      if (err.code == 11000) {
        next(new RestError(err.message, 409));
      } else {
        errores = {};
        for (atributo in err.errors) {
          className = err.errors[atributo].constructor.name;
          if ("ValidationError" != className) {
            errores[atributo] = err.errors[atributo].message;
          }
        }
        next(new RestError(errores, 400));
      }
    } else {
      res.json(doc);
    }
  });
});

//OBTIENE TODAS LAS PREPARACIONES POr LOCAL
Router.get("/preparaciones", function (req, res, next) {
  Query = Preparacion.find({ local: req.query.local });
  Query.populate({
    path: "local",
    model: "Local",
    select: "nombre tiempo_de_entrega costo_envio -_id",
  });
  Query.populate({
    path: "puntuaciones",
    model: "Puntuacion",
    select: "-_id",
    populate: {
      path: "usuario",
      model: "Usuario",
      select: "email nombre -_id",
    },
  });
  Query.populate({
    path: "comentarios",
    model: "Comentario",
    select: "-_id",
    populate: {
      path: "usuario",
      model: "Usuario",
      select: "email nombre -_id",
    },
  });
  Query.exec(function (err, preparaciones) {
    if (!err) {
      var puntaje = 0;
      var listado=[];
      preparaciones.forEach((pre) => {
        pre.puntuaciones.forEach((pun) => {
          puntaje = puntaje+pun.puntuacion;
        });
        puntaje=puntaje/pre.puntuaciones.length;
        var item ={
          preparacion: pre,
          puntuacion:puntaje,
        }
        listado.push(item);
      });

      res.json(listado);
    } else {
      next(new RestError(err.message, 500));
    }
  });
});

//OBTENER PREPaRACIONES POR ID
Router.get("/preparaciones/:id", function (req, res, next) {
  const id = req.params.id;
  Query = Preparacion.findById(id);
  Query.exec(function (err, preparacion) {
    if (!err) {
      if (preparacion) {
        res.json(preparacion);
      } else {
        next(new RestError("recurso no encontrado", 404));
      }
    } else {
      next(new RestError(err.message, 500));
    }
  });
});

module.exports = Router;
