// bloqueio.js
module.exports = (req, res, next) => {
  // Se o usuário estiver logado pelo Passport
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  // Se houver sessão com passport user (fallback)
  if (req.session && req.session.passport && req.session.passport.user) {
    return next();
  }

  // Caso não esteja logado, redireciona para login
  return res.redirect('/login?error=⚠ Você não está logado. Faça login para acessar esta página.');
};
