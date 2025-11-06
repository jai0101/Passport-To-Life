const mongoose = require('../config/conexao')
const Schema = mongoose.Schema

var DisciplinaSchema = new Schema({
    conteudo:{type:String},
    titulo:{type:String},
    material:{type:String},
    usuario: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"usuario",
    },

});

const disciplina = mongoose.model("Disciplina", DisciplinaSchema)
module.exports = disciplina