const mongoose = require('../config/conexao');
const { Schema } = mongoose;

const MaterialSchema = new Schema(
  {
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
      index: true // otimiza buscas por usuário
    },
    disciplina: {
      type: Schema.Types.ObjectId,
      ref: "DisciplinaDisponivel",
      required: true,
      index: true // otimiza buscas por disciplina
    }
  },
  {
    timestamps: true // createdAt & updatedAt automáticos
  }
);

// Model "Material" com collection explícita "materials"
const Material = mongoose.model("Material", MaterialSchema, "materials");

module.exports = Material;
