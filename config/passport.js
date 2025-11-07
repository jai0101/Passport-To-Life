const passport = require('passport');
const LocalStrategy = require('passport-local');
const Usuario = require('../models/usuario');

passport.use(new LocalStrategy(
  { usernameField: 'username', passwordField: 'password' },
  async function(username, password, done) {
    try {
      const usuario = await Usuario.findOne({ username });
      console.log("🔍 Tentando login com email:", username);
      console.log("🧾 Usuário encontrado no banco:", usuario);

      if (!usuario) return done(null, false, { message: 'Usuário não encontrado!' });
      if (usuario.password !== password) return done(null, false, { message: 'Senha incorreta!' });

      console.log('✅ Login OK');
      return done(null, usuario);
    } catch (err) {
      return done(err);
    }
  }
));

// Serializa apenas o ID
passport.serializeUser((usuario, done) => {
  done(null, usuario._id);
});

// Deserializa buscando o usuário
passport.deserializeUser(async (id, done) => {
  try {
    const usuario = await Usuario.findById(id);
    if (!usuario) return done(null, false);

    return done(null, usuario);
  } catch (err) {
    return done(err);
  }
});

module.exports = passport;
