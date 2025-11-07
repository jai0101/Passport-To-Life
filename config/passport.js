const passport = require('passport');
const LocalStrategy = require('passport-local');
const Usuario = require('../models/usuario');

passport.use(new LocalStrategy(
  { usernameField: 'username', passwordField: 'password' },
  async (username, password, done) => {
    try {
      const user = await Usuario.findOne({ username });
      console.log("Buscando usuário:", username, "=>", user);

      if (!user) return done(null, false, { message: 'Usuário não encontrado' });
      if (user.password !== password) return done(null, false, { message: 'Senha incorreta' });

      return done(null, user);
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
