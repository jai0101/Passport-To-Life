// scripts/corrigirMateriais.js
const mongoose = require('../config/conexao'); // arquivo de conexão
const Disciplina = require('../models/disciplina');

async function corrigirMateriais() {
  try {
    // Busca todos os materiais que estão sem usuário
    const materiaisSemUsuario = await Disciplina.find({ usuario: { $exists: false } });

    if (materiaisSemUsuario.length === 0) {
      console.log("Todos os materiais já possuem usuário.");
      process.exit();
    }

    for (const mat of materiaisSemUsuario) {
      // Aqui você decide qual usuário atribuir
      // Se houver disciplinaId, você poderia pegar o usuário da disciplina relacionada
      // Para simplificar, se cada material precisa obrigatoriamente ter usuário, você deve conhecer o dono real
      // Neste exemplo, vamos apenas logar para identificar
      console.log(`Material sem usuário encontrado: ${mat._id} | DisciplinaId: ${mat.disciplinaId}`);
    }

    console.log("Identifique os materiais sem usuário e atribua manualmente ou via script baseado em disciplinaId.");
    process.exit();
  } catch (err) {
    console.error("Erro ao corrigir materiais:", err);
    process.exit(1);
  }
}

corrigirMateriais();
