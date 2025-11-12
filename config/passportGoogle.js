const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Procura usuário pelo email
        let user = await Usuario.findOne({ username: profile.emails[0].value });

        if (!user) {
            // Se não existir, cria automaticamente
            const salt = await bcrypt.genSalt(10);
            const senhaHash = await bcrypt.hash(Math.random().toString(36).slice(-8), salt);

            user = new Usuario({
                username: profile.emails[0].value,
                password: senhaHash,
                nome1: profile.name?.givenName || '',
                nome2: profile.name?.familyName || '',
                foto: profile.photos?.[0]?.value || ''
            });

            await user.save();
        }

        return done(null, user);
    } catch (err) {
        console.error("Erro na estratégia Google:", err);
        return done(err, null);
    }
}));

// Serialização do usuário para sessão
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await Usuario.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});
