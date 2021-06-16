const mongoose = require("mongoose");
const RestError = require("../rest-error");
const Schema = mongoose.Schema;


const usuarioSchema = new Schema({
  nombre: {
    required: [true, "Nombre requerido"],
    type: String,
  },
  apellido: {
    required: [true, "Apellido requerido"],
    type: String,
  },
  email: {
    required: [true, "Email requerido"],
    type: String,
    lowercase: true,
    match:[/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/ ,'Email de formato no válido'],
    unique: true,
  },
  telefono: {
    required: [true, "Teléfono requerido"],
    type: Number,
    unique: true,
  },
  estado: {
    required: [true, "Estado requerido"],
    type: String,
    uppercase: true,
    enum: {
      values: ["ACTIVO", "INACTIVO"],
      message: "Estado no válido, se espera activo o inactivo",
    },
  },
  password: {
    type: String,
    minlength: [8, "Mínimo 8 caracteres"],
  },
});


usuarioSchema.pre("save", function (next) {
  next();
});


module.exports = usuarioSchema;
