const mongoose = require("mongoose");
const express = require("express");
const Router = express.Router();
const RestError = require("../rest-error");
const { ReplSet } = require("mongodb");

const Pedido = mongoose.model("Pedido", require("../schemas/pedido"));
const Local = mongoose.model("Local", require("../schemas/local"));
const Preparacion = mongoose.model(
  "Preparacion",
  require("../schemas/preparacion")
);


//REALIZAR PEDIDOS
Router.post("/pedidos", function (req, res, next) {
  Ped = new Pedido(req.body);
  Query = Local.findById(req.body.local);
  Query.exec(function (err, loc) {
    if (!err) {
      if (estaAbierto(loc.horario.abre, loc.horario.cierra)) {
        Ped.save(function (err, doc) {
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

            console.log(doc);
            var subtotal = 0;
            var total = 0;
            req.body.preparaciones.forEach((element) => {
              Query = Preparacion.findById(element.preparacion, 'costo -_id');
              Query.exec(function (err, prep) {
                if (!err) {

                 total = total + element.cantidad * prep.costo;
                } else {
                  next(new RestError(err.message, 500));
                }
              });
            })

            var respuesta = {
              pedido: doc,
              total: total,
            };
            res.json(respuesta);
          }
        });
      } else {
        next(new RestError("El local se encuentra cerrado", 400));
      }
    } else {
      next(new RestError(err.message, 500));
    }
  });
});


//PARA OBTENER UN PEDIDO POR ID
Router.get("/pedidos/:id", function (req, res, next) {
  const id = req.params.id;
  Query = Pedido.findById(id);
  Query.populate("local", "nombre");
  Query.populate("usuario", "-password");
  Query.populate({
    path: "puntuaciones",
    populate: {
      path: "preparacion",
      model: "Preparacion",
      select: "-_id -puntuaciones -comentarios",
    },
  });
  Query.exec(function (err, pedido) {
    if (!err) {
      if (pedido) {
        res.json(pedido);
      } else {
        next(new RestError("Recurso no encontrado", 404));
      }
    } else {
      next(new RestError(err.message, 500));
    }
  });
});


//Evalua si un local se encuentra abierto
function estaAbierto(apertura, cierre) {
  var horarioConsulta = new Date(1970,1,1,new Date().getHours() - 3,new Date().getMinutes());
  var horarioApertura = new Date(1970,1,1,apertura.getHours(),apertura.getMinutes());
  var horarioCierre = new Date(1970,1,1,cierre.getHours(),cierre.getMinutes());
  return horarioConsulta >= horarioApertura && horarioConsulta < horarioCierre;
}

module.exports = Router;
