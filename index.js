const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const passport = require('passport');
const session = require('express-session');

const Usuario = require('./models/usuario'); 
const Disciplina = require('./models/disciplina'); 
const publicRouter = require('./routes/publicRoute');

const app = express();

const sessionMiddleware = session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Passa o usuário logado para todas as views
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

app.use('/', publicRouter);

const server = http.createServer(app);
const io = new Server(server);
io.engine.use(sessionMiddleware);

io.on('connection', (socket) => {
    const session = socket.request.session;
    if (!session || !session.passport || !session.passport.user) {
        console.log('Usuário não autenticado tentou se conectar ao chat:', socket.id);
        socket.disconnect(true);
        return;
    }

    console.log('Usuário conectado:', socket.id);

    // Busca o usuário completo do banco para usar o nickname
    const userId = session.passport.user;
    Usuario.findById(userId).then(user => {
        if (!user) return;

        socket.on('chat message', (data) => {
            if (data && data.msg) {
                io.emit('chat message', { nickname: user.nome, msg: data.msg });
            }
        });
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectado:', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
