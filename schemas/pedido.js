const mongoose = require("mongoose");
const RestError = require("../rest-error");
const Schema = mongoose.Schema;

const preparacionSchema = require("./preparacion");

const pedidoSchema = new Schema({
  local: {
    type: Schema.Types.ObjectId,
    ref: "Local",
  },
  fecha: Date,
  usuario: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
  },
  preparaciones: [
    {
      preparacion: {
        type: Schema.Types.ObjectId,
        ref: "Preparacion",
      },
      cantidad: {
        min: [1, "Cantidad mínima 1"],
        required: [true, "requerido"],
        type: Number,
      },
    },
  ],
  aclaraciones: {
    type: String,
    maxlength: [100, "máximo 100 caracteres"],
  },
  estado: {
    required: [true, "requerido"],
    type: String,
    uppercase: true,
    enum: {
      values: ["PREPARANDO", "ENVIANDO", "ENTREGADO"],
      message: "Estado no válido, se espera Preparando, Enviando o Entregando",
    },
    fecha: {
      type: Date,
    },
  },
});

pedidoSchema.pre("save", function (next) {
  this.fecha = Date.now();
  next();
});

module.exports = pedidoSchema;
