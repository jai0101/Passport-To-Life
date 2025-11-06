
const mongoose = require('../config/conexao')
const Schema = mongoose.Schema

var UsuarioSchema = new Schema({
    nome1:{type:String},
    nome2:{type:String},
    telephone:{type:String},
    profissao:{type:String},
    cidade:{type:String},
    username:{type:String, unique: true},
    password:{type:String},
    foto: {type:String},
   
})

const usuario = mongoose.model("Usuario", UsuarioSchema)
module.exports = usuario