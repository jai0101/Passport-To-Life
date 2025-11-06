require("dotenv").config();
console.log("URI:", process.env.MONGO_URI);

const express = require('express')
const app = express()
const path = require('path')
const passport = require('passport')
const Usuario = require('./models/usuario')
const Disciplina = require('./models/disciplina');
var session = require('express-session')

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    })
)

app.use(passport.authenticate('session'));

app.set('view engine','ejs')
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')))

const publicRouter = require('./routes/publicRoute')

app.use('/',publicRouter)

app.listen('3000', function(){
    console.log('Funcionando na porta 3000')
})

app.get('/disciplina/:disciplina/foto/:arquivo', (req, res) => {
    const caminho = path.join(__dirname, 'public', 'assets', 'fotos', req.params.arquivo);
    res.download(caminho);
  });

  app.get('/listar', async function(req, res) {
    const usuarios = await Usuario.find({}).exec();
    const conteudosPorUsuario = [];
  
    for (let usuario of usuarios) {
      const conteudos = await Disciplina.find({ usuario: usuario._id }).exec();
      conteudosPorUsuario.push(conteudos.length);
    }
  const admin = req.user ? await Usuario.findById(req.user.id) : undefined;
    
    if (admin) {
      res.render("listar", { Usuarios: usuarios, Admin: admin, quantidadeConteudos: conteudosPorUsuario });
    } else {
      res.render("listar", { Usuarios: usuarios, quantidadeConteudos: conteudosPorUsuario });
    }
  });



 


