const mongoose = require('../config/conexao');
const Schema = mongoose.Schema;

const UsuarioSchema = new Schema({
  // Dados pessoais
  nome1: { type: String, required: true },
  nome2: { type: String, required: true },
  telefone: { type: String },
  profissao: { type: String },
  cidade: { type: String },

  // Login local
  username: { type: String, unique: true, required: true },
  password: { type: String, required: false }, // pode ser nulo para login social
  foto: { type: String },

  // Login social
  googleId:   { type: String, default: null },
  facebookId: { type: String, default: null },
  appleId:    { type: String, default: null },

  // Controle de admin
  admin: { type: Boolean, default: false }
}, { timestamps: true });

const Usuario = mongoose.model("Usuario", UsuarioSchema);

module.exports = Usuario;
