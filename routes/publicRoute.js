const express = require('express');
const router = express.Router();
const publicController = require('../controller/publicController');
const passport = require('../config/passport');
const bloqueio = require('../config/bloqueio');
const upload = require('../config/configMulter');

// ✅ ROTAS PÚBLICAS
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

// ✅ LOGIN / LOGOUT
router.post('/login', passport.authenticate('local', {
    successRedirect: '/perfil',
    failureRedirect: '/registrar',
}));
router.get('/logout', publicController.logout);

// ✅ PERFIL PROTEGIDO
router.get('/perfil', publicController.abreperfil);

// ✅ PERFIL PÚBLICO POR ID
router.get('/perfil/:id', publicController.perfilunico);

// ✅ REGISTRO
router.post('/registrar', upload.single("foto"), publicController.enviaregistrar);

// ✅ CONTEÚDO
router.get('/addconteudo', publicController.adicionarconteudo);
router.post('/enviaconteudo', upload.single("arquivo"), publicController.enviaconteudo);

// ✅ DOAÇÃO E AVALIAÇÃO
router.post('/enviadoacao', publicController.enviadoacao);
router.post('/enviaavaliacao', publicController.avaliar);

// ✅ EDITAR / DELETAR
router.get('/del/:id', publicController.deletar);
router.get('/edit/:id', publicController.editar);
router.post('/edit/:id', upload.single("foto"), publicController.enviaeditar);

module.exports = router;
