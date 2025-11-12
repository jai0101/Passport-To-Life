const mongoose = require('../config/conexao');
const Schema = mongoose.Schema;

const DisciplinaDisponivelSchema = new Schema({
  titulo: {
    type: String,
    required: true,
    trim: true
  }
});

// 🔹 Define explicitamente o nome da collection:
const DisciplinaDisponivel = mongoose.model(
  'DisciplinaDisponivel',
  DisciplinaDisponivelSchema,
  'disciplinasDisponiveis' // <- nome fixo da collection no Mongo
);

module.exports = DisciplinaDisponivel;
