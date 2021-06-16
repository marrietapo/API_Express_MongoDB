const mongoose = require("mongoose");
const RestError = require("../rest-error");
const Schema = mongoose.Schema;

const comentarioSchema = new Schema({
  usuario: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
  },
  comentario: {
    type: String,
    required: [true, "requerido"],
    maxlength: [300, "máximo 300 caracteres"],
  },
  fecha: {
    type: Date,
  },
});

comentarioSchema.pre("save", function (next) {
  this.fecha = Date.now();
  next();
});

module.exports = comentarioSchema;
