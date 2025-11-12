const mongoose = require('./config/conexao');
const disciplinasDisponiveis = require('./models/disciplinasDisponiveis');

async function popularDisciplinas() {
  try {
    // Array de disciplinas fixas
    const disciplinas = [
      { titulo: 'Matemática' },
      { titulo: 'Português' },
      { titulo: 'Filosofia' },
      { titulo: 'História' },
      { titulo: 'Geografia' },
      { titulo: 'Biologia' },
      { titulo: 'Química' },
      { titulo: 'Física' }
    ];

    // Limpa a coleção antes de inserir (opcional)
    await disciplinasDisponiveis.deleteMany({});

    // Insere as disciplinas
    await disciplinasDisponiveis.insertMany(disciplinas);

    console.log('✅ Disciplinas cadastradas com sucesso!');
    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Erro ao cadastrar disciplinas:', err);
    mongoose.connection.close();
  }
}

popularDisciplinas();
