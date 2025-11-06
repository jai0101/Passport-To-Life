const mongoose = require('../config/conexao')
const Schema = mongoose.Schema

var DestinatarioSchema = new Schema({
    nome:{type:String},
    email:{type:String},
    pix:{type:String},
    mensagem:{type:String}

})

const destinatario = mongoose.model("Destinatario", DestinatarioSchema)
module.exports = destinatario