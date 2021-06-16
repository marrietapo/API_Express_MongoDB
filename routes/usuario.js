const mongoose = require("mongoose");
const express = require("express");
const Router = express.Router();
const RestError = require("../rest-error");
const { ReplSet } = require("mongodb");
const crypto = require("crypto");

const Usuario = mongoose.model("Usuario", require("../schemas/usuario"));


//REGISTRAR USUARIO
Router.post("/usuarios", function (req, res, next) {
  Us = new Usuario(req.body);
  Us.password = crypto.createHash("sha256").update(req.body.password).digest("hex");
  Us.save(function (err, doc) {
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

//Obtiene todos los usuarios
Router.get("/usuarios", function (req, res, next) {
  let queryParams = {};
  Query = Usuario.find(queryParams);
  Query.exec(function (err, usuarios) {
    if (!err) {
      res.json(usuarios);
    }
  });
});

//Obtiene usuario por ID
Router.get("/usuarios/:id", function (req, res, next) {
  const id = req.params.id;
  Query = Usuario.findById(id);
  Query.exec(function (err, usuario) {
    if (!err) {
      if (usuario) {
        res.json(usuario);
      } else {
        next(new RestError("Recurso no encontrado", 404));
      }
    } else {
      next(new RestError(err.message, 500));
    }
  });
});


//Modificación de usuario
Router.put("/usuarios/:id", function (req, res, next) {
  const id = req.params.id;
  const options = { new: true, runValidators: true };
  Usuario.findByIdAndUpdate(id, req.body, options, function (err, usuario) {
    if (!err) {
      if (usuario) {
        res.json(usuario);
      } else {
        next(new RestError("recurso no encontrado", 404));
      }
    } else {
      errores = {};
      for (atributo in err.errors) {
        errores[atributo] = err.errors[atributo].message;
      }
      next(new RestError(errores, 400));
    }
  });
});




module.exports = Router;
