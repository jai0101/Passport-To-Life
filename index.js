require('dotenv').config(); // Carrega variáveis do .env
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');

// 🔹 Modelos
const Usuario = require('./models/usuario');
const Disciplina = require('./models/disciplina');
const publicRouter = require('./routes/publicRoute');

// 🔹 Configuração Mongoose
mongoose.set('strictQuery', true); // ou false, dependendo do que você preferir
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado ao MongoDB Atlas com sucesso'))
.catch(err => console.error('❌ Erro ao conectar:', err));

// 🔹 Express
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 🔹 Configuração de sessão
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: true,
});
app.use(sessionMiddleware);

// Inicialização Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware para disponibilizar o usuário logado em todas as views
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Configurações do Express
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rotas
app.use('/', publicRouter);

// 🔹 Compartilhar sessão com Socket.IO
io.engine.use(sessionMiddleware);

// 🔹 Socket.IO
io.on('connection', (socket) => {
    const session = socket.request.session;
    const isAuthenticated = session && session.passport && session.passport.user;

    if (!isAuthenticated) {
        console.log('Usuário não autenticado tentou se conectar ao chat:', socket.id);
        socket.disconnect(true);
        return;
    }

    console.log('Usuário conectado ao chat:', socket.id);

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

    if (admin) {
        res.render("listar", { Usuarios: usuarios, Admin: admin, quantidadeConteudos: conteudosPorUsuario });
    } else {
        res.render("listar", { Usuarios: usuarios, quantidadeConteudos: conteudosPorUsuario });
    }
});

// 🔹 Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
