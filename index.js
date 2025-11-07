const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const path = require('path');
const passport = require('passport');
const session = require('express-session');

// 🔹 Ajuste os caminhos dos seus modelos
const Usuario = require('./models/usuario'); 
const Disciplina = require('./models/disciplina'); 
const publicRouter = require('./routes/publicRoute'); 

// Configuração da sessão
const sessionMiddleware = session({
    secret: 'keyboard cat', // Troque por algo seguro em produção
    resave: false,
    saveUninitialized: true,
});

app.use(sessionMiddleware);

// Inicialização do Passport
app.use(passport.initialize());
app.use(passport.session());

// Configurações do Express
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para injetar o usuário logado em todas as views
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

app.use('/', publicRouter);

const server = http.createServer(app);
const io = new Server(server);

// Compartilhar sessão do Express com Socket.IO
io.engine.use(sessionMiddleware);

io.on('connection', (socket) => {
    const session = socket.request.session;

    // 🔹 Verifica se o usuário está logado
    const isAuthenticated = session && session.passport && session.passport.user;

    if (!isAuthenticated) {
        console.log('Usuário não autenticado tentou se conectar ao chat:', socket.id);
        socket.disconnect(true);
        return;
    }

    console.log('Usuário conectado ao chat:', socket.id);

    // Recebe mensagens
    socket.on('chat message', async (data) => {
        // 🔹 Segurança extra: verificação de usuário logado antes de enviar a mensagem
        const sessionNow = socket.request.session;
        if (!sessionNow || !sessionNow.passport || !sessionNow.passport.user) return;

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

    if (admin) {
        res.render("listar", { Usuarios: usuarios, Admin: admin, quantidadeConteudos: conteudosPorUsuario });
    } else {
        res.render("listar", { Usuarios: usuarios, quantidadeConteudos: conteudosPorUsuario });
    }
});

server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
