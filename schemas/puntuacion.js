const mongoose = require("mongoose");
const RestError = require("../rest-error");
const Schema = mongoose.Schema;


const puntuacionSchema = new Schema({
  fecha: { type: Date },
  puntuacion: {
    type: Number,
    max: [10, "Puntuación máxima 10"],
    min: [1, "Puntuación mínima 1"],
    required: [true, "requerido"],
  },
  usuario: { 
    type: Schema.Types.ObjectId, 
    ref: "Usuario" 
  }
});

puntuacionSchema.pre("save", function (next) {
  next();
});

module.exports = puntuacionSchema;
