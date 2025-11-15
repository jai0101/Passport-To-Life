require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const MongoStore = require('connect-mongo');

// ==========================
// Passport strategies
// ==========================
require('./config/passport');       // Local strategy
require('./config/passportGoogle'); // Google OAuth

// ==========================
// Rotas
// ==========================
const publicRouter = require('./routes/publicRoute');

// ==========================
// Conexão MongoDB
// ==========================
mongoose.set('strictQuery', true);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado ao MongoDB Atlas com sucesso'))
.catch(err => console.error('❌ Erro ao conectar:', err));

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ==========================
// Sessão
// ==========================
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000, // 1 dia
        httpOnly: true
    }
});

app.use(sessionMiddleware);

// ==========================
// Passport
// ==========================
app.use(passport.initialize());
app.use(passport.session());

// ==========================
// Debug de sessão (opcional)
// ==========================
app.use((req, res, next) => {
    console.log("====== SESSION DEBUG ======");
    console.log("SessionID:", req.sessionID);
    console.log("Passport User:", req.session.passport?.user);
    console.log("req.user:", req.user);
    console.log("==========================");
    next();
});

// ==========================
// Models
// ==========================
const Usuario = require('./models/usuario');
const Material = require('./models/material');
const Disciplina = require('./models/disciplina');
const DisciplinaDisponivel = require('./models/disciplinasDisponiveis');

// ==========================
// Middleware global para EJS
// ==========================
app.use(async (req, res, next) => {
    try {
        res.locals.Admin = req.user || null;

        if (req.user) {
            const [materiais, disciplinas] = await Promise.all([
                Material.find({ usuario: req.user._id })
                    .populate('disciplina')
                    .lean(),
                Disciplina.find().lean()
            ]);

            res.locals.materiais = materiais;
            res.locals.disciplinas = disciplinas;
        } else {
            res.locals.materiais = [];
            res.locals.disciplinas = [];
        }

        res.locals.disciplinasDisponiveis = await DisciplinaDisponivel.find().lean();
        res.locals.mensagem = req.query.error || req.query.ok || null;
        res.locals.oldEmail = req.query.oldEmail || '';

    } catch (err) {
        console.error("Erro no middleware global:", err);
        res.locals = {
            Admin: null,
            materiais: [],
            disciplinas: [],
            disciplinasDisponiveis: [],
            mensagem: null,
            oldEmail: ''
        };
    }

    next();
});

// ==========================
// Configurações Express
// ==========================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================
// Rotas
// ==========================
app.use("/", publicRouter);

// ==========================
// Socket.io com sessão
// ==========================
io.engine.use((req, res, next) => sessionMiddleware(req, {}, next));

io.on('connection', (socket) => {
    const session = socket.request.session;

    if (!session?.passport?.user) {
        console.log('❌ Tentativa de chat sem login');
        return socket.disconnect(true);
    }

    console.log('✅ Chat conectado:', socket.id);

    socket.on('chat message', data => {
        if (data?.nickname && data?.msg) {
            io.emit('chat message', data);
        }
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectou do chat:', socket.id);
    });
});

// ==========================
// Iniciar Servidor
// ==========================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
