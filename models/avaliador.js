const mongoose = require('../config/conexao')
const Schema = mongoose.Schema

var AvaliadorSchema = new Schema({
    apelido:{type:String},
    email:{type:String},
    avaliacao:{type:String}

})

const avaliador = mongoose.model("Avaliador", AvaliadorSchema)
module.exports = avaliador