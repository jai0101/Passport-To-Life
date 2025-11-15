const express = require('express');
const router = express.Router();
const passport = require('passport');
const bloqueio = require('../config/bloqueio');
const { uploadFoto, uploadMaterial } = require('../config/configMulter');
const publicController = require('../controller/publicController');
const Material = require('../models/material');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Caminho completo do LibreOffice no Windows
const librePath = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe"`;

// ===============================
//        PÁGINAS PÚBLICAS
// ===============================
router.get('/', publicController.abreindex);
router.get('/descricao', publicController.abredescricao);
router.get('/desenvolvedora', publicController.abredesenvolvedora);
router.get('/conteudo', publicController.abreconteudo);
router.get('/doacao', publicController.abredoacao);
router.get('/mensagem', publicController.mostrarmensagem);
router.get('/avaliar', publicController.abreavaliacao);
router.get('/avaliacoes', publicController.mostraravaliacao);

// ===============================
//     VISUALIZAR DISCIPLINA
// ===============================
router.get('/visualiza/:disciplina', publicController.abreDisciplina);

// ===============================
//       VISUALIZAR MATERIAL (PDF ou PPT/PPTX)
// ===============================
router.get('/material/visualizar/:id', publicController.visualizaMaterial);

// ===============================
//            BUSCA
// ===============================
router.get('/buscar', publicController.buscarMaterialPorTitulo);

// ===============================
//            LOGIN
// ===============================
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
      return res.redirect('/perfil');
    });
  })(req, res, next);
});

// ===============================
//            REGISTRO
// ===============================
router.post('/registrar', uploadFoto.single('foto'), publicController.postRegistrar);

// ===============================
//            LOGOUT
// ===============================
router.get('/logout', publicController.logout);

// ===============================
//          PERFIL LOGADO
// ===============================
router.get('/perfil', bloqueio, publicController.abreperfil);

// ===============================
//     PERFIL DE OUTRO USUÁRIO
// ===============================
router.get('/perfil/:id', bloqueio, publicController.verPerfilUsuario);

// ===============================
//             EDITAR
// ===============================
router.get('/editar/:id', bloqueio, publicController.editar);
router.post('/editar/:id', bloqueio, uploadFoto.single('foto'), publicController.enviaeditar);

// ===============================
//        EXCLUIR USUÁRIO
// ===============================
router.get('/excluir/:id', bloqueio, publicController.deletar);

// ===============================
//         LISTAR USUÁRIOS
// ===============================
router.get('/listar', bloqueio, publicController.abrirlistar);

// ===============================
//   LISTAR MATERIAIS DO LOGADO
// ===============================
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

// ===============================
//         UPLOAD MATERIAL
// ===============================
router.post('/disciplina/upload', bloqueio, uploadMaterial.single('material'), publicController.uploadMaterial);

// ===============================
//        DOWNLOAD MATERIAL
// ===============================
router.get('/material/download/:id', publicController.downloadMaterial);

// ===============================
//        EXCLUIR MATERIAL
// ===============================
router.get('/excluir/material/:id', bloqueio, publicController.deletarMaterial);

// ===============================
//      VISUALIZAR ARQUIVO DIRETO (PDF ou PPT/PPTX)
// ===============================
router.get('/visualizar/:nomeArquivo', async (req, res) => {
  const nomeArquivo = req.params.nomeArquivo;
  const filePath = path.join(__dirname, '../public/assets/materiais', nomeArquivo);
  const ext = path.extname(nomeArquivo).toLowerCase();

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Arquivo não encontrado");
  }

  try {
    if (ext === '.pdf') {
      return res.sendFile(filePath);
    } else if (ext === '.ppt' || ext === '.pptx') {
      const pdfPath = filePath.replace(ext, '.pdf');

      // Executa a conversão usando LibreOffice
      exec(`${librePath} --headless --convert-to pdf --outdir "${path.dirname(filePath)}" "${filePath}"`, (err, stdout, stderr) => {
        if (err) {
          console.error("Erro conversão PPT:", err, stderr);
          return res.status(500).send("Erro ao converter o arquivo. Verifique se o LibreOffice está instalado.");
        }

        // Espera 1 segundo para garantir que o arquivo foi gerado
        setTimeout(() => {
          if (fs.existsSync(pdfPath)) {
            return res.sendFile(pdfPath);
          } else {
            return res.status(500).send("PDF não gerado após conversão.");
          }
        }, 1000);
      });
    } else {
      return res.status(400).send("Formato de arquivo não compatível para visualização.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao processar o arquivo.");
  }
});

module.exports = router;
