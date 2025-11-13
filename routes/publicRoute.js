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
router.get('/login', (req, res) => {
  res.render('login', {
    mensagem: req.query.error || null,
    ok: req.query.ok || null,
    oldEmail: req.query.oldEmail || ""
  });
});

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
      console.log("✅ Usuário logado:", user.username);
      return res.redirect('/perfil');
    });
  })(req, res, next);
});

// ==========================
// REGISTRO DE USUÁRIO
// ==========================
router.get('/registrar', publicController.abreregistrar);

router.post('/registrar', upload.single('foto'), async (req, res) => {
  try {
    const { nome1, nome2, username, password, telefone, profissao, cidade } = req.body;
    let foto = req.file ? req.file.filename : null;

    // Verifica se usuário já existe
    const usuarioExistente = await Usuario.findOne({ username });
    if (usuarioExistente) {
      return res.render('registrar', {
        usuario: { nome1, nome2, username, telefone, profissao, cidade },
        mensagem: 'Usuário já cadastrado!'
      });
    }

    // Converte imagem HEIC automaticamente
    if (foto && path.extname(foto).toLowerCase() === '.heic') {
      const caminhoArquivo = path.join(__dirname, '..', 'public', 'assets', 'fotos', foto);
      const novoNome = foto.replace(/\.heic$/i, '.jpg');
      const caminhoNovo = path.join(__dirname, '..', 'public', 'assets', 'fotos', novoNome);

      await sharp(caminhoArquivo).jpeg({ quality: 90 }).toFile(caminhoNovo);
      fs.unlinkSync(caminhoArquivo);
      foto = novoNome;
    }

    await publicController.postRegistrar(req, res);

    // ✅ Redireciona com mensagem de sucesso
    return res.redirect('/login?ok=Usuário cadastrado com sucesso! 💚');
  } catch (err) {
    console.error("Erro no registro:", err);
    return res.redirect('/registrar?error=Erro ao cadastrar usuário');
  }
});

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
router.get('/perfil/:id', bloqueio, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).send('Usuário não encontrado');

    const materiais = await Material.find({ usuario: usuario._id })
      .populate('disciplina')
      .sort({ createdAt: -1 });

    res.render('perfilunico', {
      usuario,
      materiais,
      userLogado: req.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao carregar perfil');
  }
});

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
      .sort({ createdAt: -1 });

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
router.get('/material/visualiza/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id).populate('usuario');
    if (!material) return res.status(404).send("Material não encontrado");

    const host = req.protocol + '://' + req.get('host');
    const urlArquivo = host + '/assets/fotos/' + material.material;

    res.render('visualiza', { material, urlArquivo, userLogado: req.user || null });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao visualizar material");
  }
});

module.exports = router;
