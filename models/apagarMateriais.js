// scripts/apagarMateriais.js
const mongoose = require('../config/conexao'); // sua conexão
const Disciplina = require('../models/disciplina');

async function apagarMateriaisSemUsuario() {
  try {
    // Remove todos os documentos sem o campo "usuario"
    const resultado = await Disciplina.deleteMany({ usuario: { $exists: false } });

    console.log(`Materiais apagados: ${resultado.deletedCount}`);
    process.exit();
  } catch (err) {
    console.error("Erro ao apagar materiais:", err);
    process.exit(1);
  }
}

apagarMateriaisSemUsuario();
