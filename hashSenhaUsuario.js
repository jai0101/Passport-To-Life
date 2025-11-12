require('dotenv').config();
const mongoose = require('./config/conexao');
const bcrypt = require('bcryptjs');
const Usuario = require('./models/usuario');

async function atualizarSenha() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conectado ao MongoDB');

    const usuario = await Usuario.findOne({ username: "jaisasudati@gmail.com" });
    if (!usuario) {
      console.log('❌ Usuário não encontrado!');
      process.exit(1);
    }

    const hash = await bcrypt.hash(usuario.password, 10);

    await Usuario.updateOne(
      { _id: usuario._id },
      { $set: { password: hash } }
    );

    console.log('✅ Senha convertida para hash com sucesso!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Erro ao atualizar senha:', err);
    process.exit(1);
  }
}

atualizarSenha();
