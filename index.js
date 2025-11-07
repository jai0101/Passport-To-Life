const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const passport = require('passport');
const session = require('express-session');

// 🔹 Ajuste os caminhos dos modelos conforme sua estrutura
const Usuario = require('./models/usuario');
const Disciplina = require('./models/disciplina');

const app = express();

// Configuração da sessão
const sessionMiddleware = session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
});

app.use(sessionMiddleware);
app.use(passport.authenticate('session'));

// Configurações do Express
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 🔹 Middleware para tornar o usuário disponível em todas as views
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// 🔹 Rotas públicas
const publicRouter = require('./routes/publicRoute');
app.use('/', publicRouter);

// Criar servidor HTTP e integrar Socket.IO
const server = http.createServer(app);
const io = new Server(server);

// Compartilhar a sessão do Express com Socket.IO
io.engine.use(sessionMiddleware);

// Socket.IO
io.on('connection', (socket) => {
    console.log('Novo usuário conectado ao chat:', socket.id);

    const session = socket.request.session;

    // 🔹 Bloquear usuários não logados
    if (!session || !session.passport || !session.passport.user) {
        console.log('Tentativa de conexão não autenticada. Desconectando.');
        socket.disconnect(true);
        return;
    }

    // Receber mensagens do cliente
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

// Iniciar servidor
server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});

// Rota para download de fotos
app.get('/disciplina/:disciplina/foto/:arquivo', (req, res) => {
    const caminho = path.join(__dirname, 'public', 'assets', 'fotos', req.params.arquivo);
    res.download(caminho);
});

// Rota para listar usuários e quantidade de conteúdos
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
