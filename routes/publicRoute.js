const express = require('express');
const router = express.Router();
const publicController = require('../controller/publicController');
const passport = require('../config/passport');
const bloqueio = require('../config/bloqueio');
const upload = require('../config/configMulter');

// Páginas públicas
router.get('/', publicController.abreindex);
router.get('/descricao', publicController.abredescricao);
router.get('/desenvolvedora', publicController.abredesenvolvedora);
router.get('/conteudo', publicController.abreconteudo);
router.get('/login', publicController.abrelogin);
router.get('/registrar', publicController.abreregistrar);
router.get('/doacao', publicController.abredoacao);
router.get('/mensagem', publicController.mostrarmensagem);
router.get('/avaliar', publicController.abreavaliacao);
router.get('/avaliacoes', publicController.mostraravaliacao);
router.get('/visualiza/:disciplina', publicController.abreDisciplina);

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    console.log("DEBUG LOGIN");
    console.log("err:", err);
    console.log("user:", user);
    console.log("info:", info);

    if (err) return next(err);
    if (!user) return res.send("Usuário ou senha incorretos!"); 

    req.logIn(user, (err) => {
      if (err) return next(err);
      console.log("✅ Usuário logado com sucesso:", user.username);

      // Redireciona para o perfil do usuário logado
      res.redirect('/perfil');
    });
  })(req, res, next);
});


// Logout
router.get('/logout', publicController.logout);

// Perfil do usuário logado (protegido)
router.get('/perfil', bloqueio, publicController.abreperfil);

// Perfil público por ID
router.get('/perfil/:id', publicController.perfilunico);

// Lista de usuários
router.get('/listar', bloqueio, publicController.abrirlistar);

// Registro
router.post('/registrar', upload.single("foto"), publicController.enviaregistrar);

// Conteúdo
router.get('/addconteudo', bloqueio, publicController.adicionarconteudo);
router.post('/enviaconteudo', bloqueio, upload.single("arquivo"), publicController.enviaconteudo);

// Doação e Avaliação
router.post('/enviadoacao', publicController.enviadoacao);
router.post('/enviaavaliacao', publicController.avaliar);

// Editar / Deletar
router.get('/del/:id', bloqueio, publicController.deletar);
router.get('/edit/:id', bloqueio, publicController.editar);
router.post('/edit/:id', bloqueio, upload.single("foto"), publicController.enviaeditar);

module.exports = router;
