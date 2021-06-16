const mongoose = require("mongoose");
const RestError = require("../rest-error");
const Schema = mongoose.Schema;

const comentarioSchema = require("./comentario");
const puntuacionSchema = require("./puntuacion");

const preparacionSchema = new Schema({
  local: {
    type: Schema.Types.ObjectId,
    ref: "Local",
  },
  nombre: {
    type: String,
    maxlength: [100, "Máximo 100 caracteres"],
    required: [true, "Nombre requerido"],
  },
  descripcion: {
    type: String,
    maxlength: [300, "Máximo 300 caracteres"],
    required: [true, "Dirección requerida"],
  },
  costo: {
    type: Number,
    required: [true, "costo requerido"],
  },
  puntuaciones: [puntuacionSchema],
  comentarios: [comentarioSchema],
});

preparacionSchema.pre("save", function (next) {
  next();
});

module.exports = preparacionSchema;
