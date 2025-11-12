const mongoose = require('mongoose');

// Use a string de conexão diretamente ou via variável de ambiente
const uri = process.env.MONGO_URI || "mongodb+srv://jaisasudati:passport123@passport.g19u869.mongodb.net/passaportolife?retryWrites=true&w=majority";

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000 // tempo máximo de conexão
})
.then(() => console.log("✅ Conectado ao MongoDB Atlas com sucesso"))
.catch(err => console.log("❌ Erro ao conectar:", err));

module.exports = mongoose;