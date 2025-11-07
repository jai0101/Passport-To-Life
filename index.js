require('dotenv').config();
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

// 🔹 Configuração do MongoDB
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado ao MongoDB Atlas com sucesso'))
.catch(err => console.error('❌ Erro ao conectar:', err));

// 🔹 Config do Express + HTTP + Socket.io
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 🔹 Sessão
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // mude para true se usar HTTPS
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// 🔹 Tornar usuário disponível nas views
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// 🔹 Config Express
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 🔹 Rotas
app.use('/', publicRouter);

// 🔹 Compartilha sessão com Socket.io
io.engine.use(sessionMiddleware);

// 🔹 Chat em tempo real
io.on('connection', async (socket) => {
    const session = socket.request.session;

    if (!session || !session.passport || !session.passport.user) {
        console.log('❌ Acesso negado ao chat. Usuário não autenticado.');
        return socket.disconnect(true);
    }

    try {
        const user = await Usuario.findById(session.passport.user.id);

        if (!user) {
            console.log('❌ Usuário não encontrado no banco.');
            return socket.disconnect(true);
        }

        console.log(`💬 Usuário conectado no chat: ${user.nome}`);

        socket.on('chat message', (data) => {
            if (!data.msg) return;

            const message = {
                nickname: user.nome,
                msg: data.msg
            };

            console.log(`[${message.nickname}]: ${message.msg}`);
            io.emit('chat message', message);
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Usuário desconectado: ${user.nome}`);
        });

    } catch (err) {
        console.error('❌ Erro ao buscar usuário:', err);
        socket.disconnect(true);
    }
});

// 🔹 Rota extra para download
app.get('/disciplina/:disciplina/foto/:arquivo', (req, res) => {
    const caminho = path.join(__dirname, 'public', 'assets', 'fotos', req.params.arquivo);
    res.download(caminho);
});

// 🔹 Listagem (exemplo já do seu projeto)
app.get('/listar', async (req, res) => {
    const usuarios = await Usuario.find({});
    const conteudosPorUsuario = [];

    for (let u of usuarios) {
        const c = await Disciplina.find({ usuario: u._id });
        conteudosPorUsuario.push(c.length);
    }

    const admin = req.user ? await Usuario.findById(req.user.id) : null;

    res.render('listar', {
        Usuarios: usuarios,
        Admin: admin,
        quantidadeConteudos: conteudosPorUsuario
    });
});

// 🔹 Iniciar server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
