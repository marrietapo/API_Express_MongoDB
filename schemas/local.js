const mongoose = require("mongoose");
const RestError = require("../rest-error");
const Schema = mongoose.Schema;

const comentarioSchema = require("./comentario");
const puntuacionSchema = require("./puntuacion");

const localSchema = new Schema({
  nombre: {
    type: String,
    maxlength: [100, "Máximo 100 caracteres"],
    required: [true, "Nombre requerido"],
  },
  direccion: {
    type: String,
    maxlength: [300, "Máximo 300 caracteres"],
    required: [true, "Dirección requerida"],
  },
  geolocalizacion: {
    latitud: {
      type: Number,
      required: [true, "requerido"],
    },
    longitud: {
      type: Number,
      required: [true, "requerido"],
    },
  },
  puntuaciones: [puntuacionSchema],
  comentarios: [comentarioSchema],
  tiempo_de_entrega: {
    type: Number,
    min: [0, "Tiempo de entrega no válido"],
    required: [true, "Tiempo de entrega requerido"],
  },
  costo_envio: {
    type: Number,
    min: [0, "Costo de envío no válido"],
    required: [true, "Costo de envio requerido"],
  },
  categorias: [
    {
      required: [true, "Categoría requerida"],
      type: String,
      enum: {
        values: ["HAMBURGUESAS", "CHIVITOS", "PIZZAS"],
        message: "Estado no válido, se espera Hamburguesas, Chivitos o Pizzas",
      },
    },
  ],
  horario: {
    abre: Date,
    cierra: Date,
  },
});

localSchema.pre("save", function (next) {
  next();
});



module.exports = localSchema;
