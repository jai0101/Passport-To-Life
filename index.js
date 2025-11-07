require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const passport = require('./config/passport'); // Passport configurado
const session = require('express-session');
const mongoose = require('mongoose');
const publicRouter = require('./routes/publicRoute');
const Usuario = require('./models/usuario');

// 🔹 MongoDB
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado ao MongoDB Atlas com sucesso'))
.catch(err => console.error('❌ Erro ao conectar:', err));

// 🔹 App Express + HTTP + Socket.IO
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 🔹 Sessão
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true em produção
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
});

// 🔹 Middlewares
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// 🔹 Disponibiliza req.user nos templates
app.use((req, res, next) => {
    res.locals.Admin = req.user || null;
    next();
});

// 🔹 Compartilha sessão com Socket.IO
io.use((socket, next) => sessionMiddleware(socket.request, {}, next));

// 🔹 Chat Socket.IO
io.on('connection', async (socket) => {
    const session = socket.request.session;
    if (!session?.passport?.user) return socket.disconnect();

    try {
        const user = await Usuario.findById(session.passport.user);
        if (!user) return socket.disconnect();

        console.log(`💬 Usuário conectado no chat: ${user.username}`);

        socket.on('chat message', (data) => {
            if (!data.msg || !data.nickname) return;
            io.emit('chat message', { nickname: data.nickname, msg: data.msg });
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Usuário desconectado: ${user.username}`);
        });

    } catch (err) {
        console.error(err);
        socket.disconnect();
    }
});

// 🔹 Rotas
app.use('/', publicRouter);

// 🔹 Servir arquivos de disciplina/foto
app.get('/disciplina/:disciplina/foto/:arquivo', (req, res) => {
    const caminho = path.join(__dirname, 'public', 'assets', 'fotos', req.params.arquivo);
    res.download(caminho);
});

// 🔹 Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
