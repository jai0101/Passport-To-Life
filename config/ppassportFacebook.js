const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const Usuario = require("../models/usuario");
const bcrypt = require("bcryptjs");

// ==========================
// Configuração da estratégia Facebook
// ==========================
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${process.env.SITE_URL}/auth/facebook/callback`,
      profileFields: ["id", "emails", "name", "picture.type(large)"]
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0].value;
        const givenName = profile.name?.givenName || "";
        const familyName = profile.name?.familyName || "";
        const picture = profile.photos && profile.photos[0].value;

        if (!email) {
          return done(null, false, { message: "O Facebook não forneceu o e-mail." });
        }

        let usuario = await Usuario.findOne({ username: email });

        if (!usuario) {
          // Cria senha aleatória para o usuário
          const salt = await bcrypt.genSalt(10);
          const senhaHash = await bcrypt.hash(Math.random().toString(36).slice(-8), salt);

          usuario = await Usuario.create({
            username: email,
            password: senhaHash,
            nome1: givenName,
            nome2: familyName,
            foto: picture || ""
          });
        }

        done(null, usuario);
      } catch (err) {
        console.error("Erro no login via Facebook:", err);
        done(err, null);
      }
    }
  )
);

// ==========================
// Serialização e desserialização
// ==========================
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const usuario = await Usuario.findById(id);
    done(null, usuario);
  } catch (err) {
    done(err, null);
  }
});
