// routes/publicRoute.js
const express = require('express');
const passport = require('passport');
const router = express.Router(); // 🔹 Declarar o router

// Rota de login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            // Se o login falhar, redireciona para a página de registro
            return res.redirect('/registrar'); 
        }
        
        // Se o login for bem-sucedido, estabelecer a sessão
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            // Redireciona após a sessão ser estabelecida
            return res.redirect('/perfil');
        });
    })(req, res, next);
});

// Rota de registro (exemplo)
router.get('/registrar', (req, res) => {
    res.render('registrar'); // Ajuste o EJS conforme seu projeto
});

// Rota de perfil (exemplo)
router.get('/perfil', (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    res.render('perfil', { user: req.user });
});

// Página inicial ou outras rotas públicas
router.get('/', (req, res) => {
    res.render('index', { user: req.user }); // Ajuste o EJS conforme seu projeto
});

// 🔹 Exportar o router
module.exports = router;
