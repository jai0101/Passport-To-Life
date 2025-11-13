const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// ==========================
// MIDDLEWARES
// ==========================
const bloqueio = require('../config/bloqueio');
const upload = require('../config/configMulter');

// ==========================
// MODELS
// ==========================
const Material = require('../models/material');
const Usuario = require('../models/usuario');

// ==========================
// CONTROLLER
// ==========================
const publicController = require('../controller/publicController');

// ==========================
// ROTAS PÚBLICAS (sem login)
// ==========================
router.get('/', publicController.abreindex);
router.get('/descricao', publicController.abredescricao);
router.get('/desenvolvedora', publicController.abredesenvolvedora);
router.get('/conteudo', publicController.abreconteudo);
router.get('/doacao', publicController.abredoacao);
router.get('/mensagem', publicController.mostrarmensagem);
router.get('/avaliar', publicController.abreavaliacao);
router.get('/avaliacoes', publicController.mostraravaliacao);

// ==========================
// VISUALIZA MATERIAIS POR DISCIPLINA (público)
// ==========================
router.get('/visualiza/:disciplina', publicController.abreDisciplina);

// 🔎 Buscar material por título (público)
router.get('/buscar', publicController.buscarMaterialPorTitulo);

// ==========================
// LOGIN
// ==========================
router.get('/login', publicController.abrelogin);

router.post('/login', (req, res, next) => {
  const usernameDigitado = req.body.username;

  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      const mensagem = encodeURIComponent(info?.message || "Falha no login");
      const oldEmail = encodeURIComponent(usernameDigitado || '');
      return res.redirect(`/login?error=${mensagem}&oldEmail=${oldEmail}`);
    }

    req.logIn(user, err => {
      if (err) return next(err);
      return res.redirect('/perfil');
    });
  })(req, res, next);
});

// ==========================
// REGISTRO DE USUÁRIO
// ==========================
router.get('/registrar', publicController.abreregistrar);
router.post('/registrar', upload.single('foto'), publicController.postRegistrar);

// ==========================
// LOGOUT
// ==========================
router.get('/logout', publicController.logout);

// ==========================
// PERFIL DO USUÁRIO LOGADO
// ==========================
router.get('/perfil', bloqueio, publicController.abreperfil);

// ==========================
// PERFIL DE OUTRO USUÁRIO
// ==========================
router.get('/perfil/:id', bloqueio, publicController.verPerfilUsuario);

// ==========================
// EDITAR / ATUALIZAR USUÁRIO
// ==========================
router.get('/editar/:id', bloqueio, publicController.editar);
router.post('/editar/:id', bloqueio, upload.single('foto'), publicController.enviaeditar);

// ==========================
// EXCLUIR USUÁRIO
// ==========================
router.get('/excluir/:id', bloqueio, publicController.deletar);

// ==========================
// LISTAR USUÁRIOS
// ==========================
router.get('/listar', bloqueio, publicController.abrirlistar);
router.get('/usuario/:id', bloqueio, publicController.verPerfilUsuario);

// ==========================
// LISTAR MATERIAIS DO LOGADO
// ==========================
router.get('/abrirlistar', bloqueio, async (req, res) => {
  try {
    const materiais = await Material.find({ usuario: req.user._id })
      .populate('disciplina')
      .sort({ createdAt: -1 })
      .lean();

    res.render('listarMateriais', { materiais });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao listar materiais");
  }
});

// ==========================
// UPLOAD DE MATERIAL
// ==========================
const storageMaterial = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/assets/fotos/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

const uploadMaterial = multer({
  storage: storageMaterial,
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ];
    if (tiposPermitidos.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Apenas PDF ou arquivos de Slide (PPT/PPTX) são permitidos!"));
  }
});

router.post(
  '/disciplina/upload',
  bloqueio,
  uploadMaterial.single('material'),
  publicController.uploadMaterial
);

// ==========================
// DOWNLOAD DE MATERIAL
// ==========================
router.get('/material/download/:id', publicController.downloadMaterial);

// ==========================
// EXCLUIR MATERIAL
// ==========================
router.get('/excluir/material/:id', bloqueio, publicController.deletarMaterial);

// ==========================
// VISUALIZAR MATERIAL (PDF/PPT COM PREVIEW)
// ==========================
router.get('/material/visualiza/:id', publicController.visualizarMaterial);

module.exports = router;
