const mongoose = require('mongoose')
const uri = MONGO_URI="mongodb+srv://jaisasudati:passport123@passport.g19u869.mongodb.net/passaportolife?retryWrites=true&w=majority&appName=Passport";
const onlineUri = process.env.MONGODB_URI;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado ao MongoDB Atlas com sucesso"))
  .catch(err => console.log("❌ Erro ao conectar:", err));

mongoose.connect(uri);

//mongoose.connect(uri, { useNewUrlParse: true, useUnifiedTopology: true })

module.exports = mongoose