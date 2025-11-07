router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            // Se o login falhar, redireciona para a página de login ou registro
            return res.redirect('/registrar'); 
        }
        
        // Se o login for bem-sucedido, chame req.logIn para estabelecer a sessão
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            // Redireciona APÓS a sessão ser estabelecida
            return res.redirect('/perfil');
        });
    })(req, res, next);
});
