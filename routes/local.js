const mongoose = require("mongoose");
const express = require("express");
const Router = express.Router();
const RestError = require("../rest-error");
const { ReplSet } = require("mongodb");

const Local = mongoose.model("Local", require("../schemas/local"));

Router.post("/locales", function (req, res, next) {
  Loc = new Local(req.body);

  Loc.save(function (err, doc) {
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


//DEVUELVE TODOS LOS LOCALES y SU INFO
Router.get("/locales", function (req, res, next) {
  Query = Local.find({});
  Query.sort({ nombre: 1 });
  Query.populate({
    path: "puntuaciones",
    select: "-_id",
    populate: {
      path: "usuario",
      model: "Usuario",
      select: "email -_id",
    },
  });
  Query.populate({
    path: "comentarios",
    model: "Comentario",
    options: { sort: { fecha: "desc" } },
    //pretende ordenar la seleccion pero no ordena nada
    populate: {
      path: "usuario",
      model: "Usuario",
      select: "email -_id",
    },
  });
  Query.exec(function (err, locales) {
    if (!err) {
      //geolocalizacion de la consulta
      let lat2 = req.query.latitud;
      let lon2 = req.query.longitud;
      var listado = [];
      locales.forEach((element) => {
        //obtener distancia del dispositivo al local
        let lat1 = element.geolocalizacion.latitud;
        let lon1 = element.geolocalizacion.longitud;
        var distancia = obtenerDistanciaKilometros(lat1, lon1, lat2, lon2);

        //obtener estado del local
        var estado = "CERRADO";
        if (estaAbierto(element.horario.abre, element.horario.cierra)) {
          estado = "ABIERTO";
        }

        //calcular puntuaciones
        var puntaje = obtenerPuntaje(element.puntuaciones);
        //cargar nueva lista
        var item = {
          local: element,
          distancia: distancia,
          estado: estado,
          puntuacion: puntaje,
        };
        listado.push(item);
      });
      res.json(listado);
    }
  });
});

//DEVUELVE TODOS LOS LOCALES ABIERTOS
Router.get("/locales/abiertos", function (req, res, next) {
  Query = Local.find({});
  Query.sort({ nombre: 1 });
  Query.populate({
    path: "puntuaciones",
    select: "-_id",
    populate: {
      path: "usuario",
      model: "Usuario",
      select: "email -_id",
    },
  });
  Query.populate({
    path: "comentarios",
    model: "Comentario",
    options: { sort: { fecha: "desc" } },
    //pretende ordenar la seleccion pero no ordena nada
    populate: {
      path: "usuario",
      model: "Usuario",
      select: "email -_id",
    },
  });
  Query.exec(function (err, locales) {
    if (!err) {
      //geolocalizacion de la consulta
      let lat2 = req.query.latitud;
      let lon2 = req.query.longitud;
      var listado = [];
      locales.forEach((element) => {
        if (estaAbierto(element.horario.abre, element.horario.cierra)) {
          estado = "ABIERTO";
          //obtener distancia del dispositivo al local
          let lat1 = element.geolocalizacion.latitud;
          let lon1 = element.geolocalizacion.longitud;
          var distancia = obtenerDistanciaKilometros(lat1, lon1, lat2, lon2);

          //obtener estado del local

          //calcular puntuaciones
          var puntaje = obtenerPuntaje(element.puntuaciones);
          //cargar nueva lista
          var item = {
            local: element,
            distancia: distancia,
            estado: estado,
            puntuacion: puntaje,
          };
          listado.push(item);
        }
      });
      res.json(listado);
    }
  });
});


//LOCALES POR TAG
Router.get("/locales/categorias", function (req, res, next) {
  
  var tagsSolicitadas = req.body.tags;
  
  Query = Local.find({categorias: {"$all" : tagsSolicitadas}});
  Query.sort({ nombre: 1 });
  Query.populate({
    path: "puntuaciones",
    select: "-_id",
    populate: {
      path: "usuario",
      model: "Usuario",
      select: "email -_id",
    },
  });
  Query.populate({
    path: "comentarios",
    model: "Comentario",
    options: { sort: { fecha: "desc" } },
    //pretende ordenar la seleccion pero no ordena nada
    populate: {
      path: "usuario",
      model: "Usuario",
      select: "email -_id",
    },
  });
  Query.exec(function (err, locales) {
    if (!err) {
      //geolocalizacion de la consulta
      let lat2 = req.query.latitud;
      let lon2 = req.query.longitud;
      var listado = [];
      locales.forEach((element) => {
        //obtener distancia del dispositivo al local
        let lat1 = element.geolocalizacion.latitud;
        let lon1 = element.geolocalizacion.longitud;
        var distancia = obtenerDistanciaKilometros(lat1, lon1, lat2, lon2);

        //obtener estado del local
        var estado = "CERRADO";
        if (estaAbierto(element.horario.abre, element.horario.cierra)) {
          estado = "ABIERTO";
        }
        //calcular puntuaciones
        var puntaje = obtenerPuntaje(element.puntuaciones);
        //cargar nueva lista
        var item = {
          local: element,
          distancia: distancia,
          estado: estado,
          puntuacion: puntaje,
        };
        listado.push(item);
      });
      res.json(listado);
    }
  });
});




//OBTIENE LOCAL POR ID
Router.get("/locales/:id", function (req, res, next) {
  const id = req.params.id;
  Query = Local.findById(id);
  Query.exec(function (err, local) {
    if (!err) {
      if (local) {
        res.json(local);
      } else {
        next(new RestError("recurso no encontrado", 404));
      }
    } else {
      next(new RestError(err.message, 500));
    }
  });
});



Router.put("/locales/:id", function (req, res, next) {
  const id = req.params.id;
  const options = { new: true, runValidators: true };
  Local.findById(id, req.body, options, function (err, local) {
    if (!err) {
      if (local) {
        local.comentarios.push({
          comentario: req.body.comentario,
          usuario: req.body.usuario,
        });
        Local.save();
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



//devuelve puntaje promedio
function obtenerPuntaje(listaPuntajes) {
  var suma = 0;
  listaPuntajes.forEach((element) => {
    suma += element.puntuacion;
  });
  return suma / listaPuntajes.length;
}


// calcula la distancia en kilómetros entre dos puntos
function obtenerDistanciaKilometros(lat1, lon1, lat2, lon2) {
  rad = function (x) {
    return (x * Math.PI) / 180;
  };
  var R = 6378.137; //Radio de la tierra en km
  var dLat = rad(lat2 - lat1);
  var dLong = rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(lat1)) *
      Math.cos(rad(lat2)) *
      Math.sin(dLong / 2) *
      Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d.toFixed(3); //Retorna tres decimales
}

//funcion que evalúa si un local está abierto
function estaAbierto(apertura, cierre) {
  var horarioConsulta = new Date(
    1970,
    1,
    1,
    new Date().getHours() - 3, //correccion horaria #chanchada
    new Date().getMinutes()
  );
  var horarioApertura = new Date(
    1970,
    1,
    1,
    apertura.getHours(),
    apertura.getMinutes()
  );
  var horarioCierre = new Date(
    1970,
    1,
    1,
    cierre.getHours(),
    cierre.getMinutes()
  );
  return horarioConsulta >= horarioApertura && horarioConsulta < horarioCierre;
}

module.exports = Router;
