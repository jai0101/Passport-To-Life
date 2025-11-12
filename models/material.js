const mongoose = require('../config/conexao');
const Schema = mongoose.Schema;

const MaterialSchema = new Schema({
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  conteudo: {
    type: String,
    required: true,
    trim: true
  },
  material: {
    type: String,
    required: true // nome do arquivo salvo
  },
  usuario: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
    index: true // ← melhora buscas por usuário
  },
  disciplina: {
    type: Schema.Types.ObjectId,
    ref: "DisciplinaDisponivel",
    required: true,
    index: true // ← melhora buscas por disciplina
  }
}, {
  timestamps: true // createdAt & updatedAt automáticos
});

// Nome da collection ajustado para "materials"
const Material = mongoose.model("Material", MaterialSchema, "materials");

module.exports = Material;
