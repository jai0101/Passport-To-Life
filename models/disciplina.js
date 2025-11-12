const mongoose = require('../config/conexao');
const Schema = mongoose.Schema;

const DisciplinaSchema = new Schema({
  titulo: {
    type: String,
    required: true
  },
  conteudo: {
    type: String,
    required: true
  },
  material: {
    type: String,
    required: true // nome do arquivo salvo
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario", // referência para o model de usuário
    required: true
  },
  disciplinaId: {               
    type: mongoose.Schema.Types.ObjectId, // tipo ObjectId para referência
    ref: "Disciplina", // referência caso exista outro model de disciplina
    required: true
  }
}, { 
  timestamps: true // adiciona createdAt e updatedAt automaticamente
});

const Disciplina = mongoose.model("Disciplina", DisciplinaSchema);

module.exports = Disciplina;
