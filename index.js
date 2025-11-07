const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const path = require('path');
const passport = require('passport');
const session = require('express-session');

// 🔹 Ajuste os caminhos para os seus modelos
const Usuario = require('./models/usuario'); 
const Disciplina = require('./models/disciplina'); 
const publicRouter = require('./routes/publicRoute'); 

// Configuração da sessão
const sessionMiddleware = session({
    secret: 'keyboard cat', // chave secreta para produção
    resave: false,
    saveUninitialized: false,
});

// Inicialização do Passport
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Configuração do Express
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 🔹 Middleware para passar o usuário logado para todas as views
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Rotas públicas
app.use('/', publicRouter);

// Criar servidor HTTP e Socket.IO
const server = http.createServer(app);
const io = new Server(server);

// Compartilhar sessão do Express com Socket.IO
io.engine.use(sessionMiddleware);

io.on('connection', (socket) => {
    console.log('Novo usuário conectado ao chat:', socket.id);

    const session = socket.request.session;
    const isAuthenticated = session && session.passport && session.passport.user;

    if (!isAuthenticated) {
        console.log('Usuário não autenticado. Desconectando.');
        socket.disconnect(true);
        return;
    }

    socket.on('chat message', (data) => {
        if (data && data.nickname && data.msg) {
            console.log(`[${data.nickname}]: ${data.msg}`);
            io.emit('chat message', data);
        }
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectado do chat:', socket.id);
    });
});

// Rotas adicionais
app.get('/disciplina/:disciplina/foto/:arquivo', (req, res) => {
    const caminho = path.join(__dirname, 'public', 'assets', 'fotos', req.params.arquivo);
    res.download(caminho);
});

app.get('/listar', async (req, res) => {
    const usuarios = await Usuario.find({}).exec();
    const conteudosPorUsuario = [];

    for (let usuario of usuarios) {
        const conteudos = await Disciplina.find({ usuario: usuario._id }).exec();
        conteudosPorUsuario.push(conteudos.length);
    }

    const admin = req.user ? await Usuario.findById(req.user.id) : undefined;

    res.render("listar", { Usuarios: usuarios, Admin: admin, quantidadeConteudos: conteudosPorUsuario });
});

// Iniciar servidor
server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
