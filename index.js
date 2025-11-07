const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const path = require('path');
const passport = require('passport');
const Usuario = require('./models/usuario');
const Disciplina = require('./models/disciplina');
const session = require('express-session');

const sessionMiddleware = session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
});

app.use(sessionMiddleware);
app.use(passport.authenticate('session'));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 🔹 Passar o usuário logado para todas as views
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

const publicRouter = require('./routes/publicRoute');
app.use('/', publicRouter);

const server = http.createServer(app);
const io = new Server(server);

// Compartilhar a sessão do Express com o Socket.IO
io.engine.use(sessionMiddleware);

io.on('connection', (socket) => {
    console.log('Novo usuário conectado ao chat:', socket.id);

    const session = socket.request.session;
    if (!session || !session.passport || !session.passport.user) {
        console.log('Tentativa de conexão não autenticada. Desconectando.');
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

server.listen(3000, () => {
    console.log('Funcionando na porta 3000');
});

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

    if (admin) {
        res.render("listar", { Usuarios: usuarios, Admin: admin, quantidadeConteudos: conteudosPorUsuario });
    } else {
        res.render("listar", { Usuarios: usuarios, quantidadeConteudos: conteudosPorUsuario });
    }
});
