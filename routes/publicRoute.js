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
router.post("/login", 
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: false
    }),
    (req, res) => {
        res.redirect("/perfil"); // ✅ se deu certo, manda pro perfil
    }
);
router.get('/logout', publicController.logout);

// ✅ PERFIL DO USUÁRIO LOGADO (PROTEGIDO)
router.get('/perfil', bloqueio, publicController.abreperfil);

// ✅ PERFIL PÚBLICO DE OUTRO USUÁRIO (por ID)
router.get('/perfil/:id', publicController.perfilunico);

// ✅ LISTA DE USUÁRIOS (PROTEGIDA PARA NÃO QUEBRAR HEADER)
router.get('/listar', bloqueio, publicController.listarUsuarios);

// ✅ REGISTRO
router.post('/registrar', upload.single("foto"), publicController.enviaregistrar);

// ✅ CONTEÚDO
router.get('/addconteudo', bloqueio, publicController.adicionarconteudo);
router.post('/enviaconteudo', bloqueio, upload.single("arquivo"), publicController.enviaconteudo);

// ✅ DOAÇÃO E AVALIAÇÃO
router.post('/enviadoacao', publicController.enviadoacao);
router.post('/enviaavaliacao', publicController.avaliar);

// ✅ EDITAR / DELETAR (PROTEGIDOS)
router.get('/del/:id', bloqueio, publicController.deletar);
router.get('/edit/:id', bloqueio, publicController.editar);
router.post('/edit/:id', bloqueio, upload.single("foto"), publicController.enviaeditar);

module.exports = router;
