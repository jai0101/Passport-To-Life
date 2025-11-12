const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');

// ==========================
// STRATEGY LOCAL (USERNAME + SENHA)
// ==========================
passport.use(new LocalStrategy(
  {
    usernameField: 'username',   // ⚡ agora é username
    passwordField: 'password'
  },
  async (username, password, done) => {
    try {
      console.log("🔍 Tentando login com:", username);

      // Busca usuário pelo username
      const user = await Usuario.findOne({ username });
      if (!user) {
        return done(null, false, { message: "Usuário não cadastrado" });
      }

      // Se usuário não tiver senha (login social)
      if (!user.password) {
        return done(null, false, { message: "Usuário registrado via login social. Use o botão de login social." });
      }

      // Verifica a senha com bcrypt
      const senhaCorreta = await bcrypt.compare(password, user.password);
      if (!senhaCorreta) {
        return done(null, false, { message: "Senha incorreta" });
      }

      // ✅ Sucesso
      return done(null, user);

    } catch (err) {
      return done(err);
    }
  }
));

// ==========================
// SERIALIZE / DESERIALIZE
// ==========================
passport.serializeUser((usuario, done) => {
  done(null, usuario._id);
});

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
