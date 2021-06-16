const mongoose = require("mongoose");
const express = require("express");
const Router = express.Router();
const RestError = require("../rest-error");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const conn = mongoose.connection;




//Login de usuarios
Router.post("/login", function (req, res, next) {
  let email = req.body.email;
  let password = req.body.password;
  //encriptamos password.
  password = crypto.createHash("sha256").update(password).digest("hex");
  conn.db.collection("usuarios", function (err, collection) {
    collection.findOne({ email: email, password: password }, function (err, doc) {
      if (doc) {
        //enviamos info de usuario autenticado menos password.
        doc.password = undefined;
        //payload: datos utilizados para generar token.
        const token = jwt.sign(doc.email, process.env.TOKEN_SECRET);
        //enviamos token generado con los datos de usuario.
        doc.token = token;

        res.json({ usuario: doc });
      } else {
        next(new RestError("email o password no válidos", 401));
      }
    });
  }); 
});

module.exports = Router;
