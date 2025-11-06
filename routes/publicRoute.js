const express = require('express')
const router = express.Router()
const publicController = require('../controller/publicController')
const passport = require('../config/passport')
const bloqueio = require('../config/bloqueio')
var upload = require ('../config/configMulter')


router.get('/',publicController.abreindex)
router.get('/descricao',publicController.abredescricao)
router.get('/desenvolvedora',publicController.abredesenvolvedora)
router.get('/conteudo',publicController.abreconteudo)
router.get('/login',publicController.abrelogin)
router.get('/logout',publicController.logout)
router.get('/perfil',publicController.abreperfil)
router.get('/registrar',publicController.abreregistrar)
router.post('/registrar', upload.single("foto"), publicController.enviaregistrar)
router.get('/addconteudo',publicController.adicionarconteudo)
router.post('/enviaconteudo', upload.single("arquivo"), publicController.enviaconteudo)
router.get('/visualiza/:disciplina',publicController.abreDisciplina)
router.get('/doacao',publicController.abredoacao)
router.post('/enviadoacao', publicController.enviadoacao)
router.get('/mensagem',publicController.mostrarmensagem)
router.get('/avaliar',publicController.abreavaliacao)
router.post('/enviaavaliacao', publicController.avaliar)
router.get('/avaliacoes',publicController.mostraravaliacao)
router.get('/del/:id',publicController.deletar)
router.get('/edit/:id',publicController.editar)
router.get('/perfil/:id',publicController.perfilunico)
router.post('/edit/:id', upload.single("foto"), publicController.enviaeditar)

router.post('/login', passport.authenticate('local', {
    successRedirect: '/perfil',
    failureRedirect: '/registrar',
}))

router.get('/', bloqueio, publicController.abreindex)

//rota para registrar
//router.post('/registrar',conexao.single('foto'), publicController.abreregistrar)
module.exports = router