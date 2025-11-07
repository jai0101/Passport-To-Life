// middleware/bloqueio.js
module.exports = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // usuário logado, continua
  }
  res.redirect('/login'); // não logado, manda para login
};
