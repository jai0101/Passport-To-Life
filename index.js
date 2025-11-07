const express = require('express');
const http = require('http' );
const { Server } = require('socket.io');
const app = express();
const path = require('path');
const passport = require('passport'); // Importa o Passport
const session = require('express-session');

// 🔹 AJUSTE OS CAMINHOS DOS SEUS MODELOS E ROTAS AQUI
const Usuario = require('./models/usuario'); 
const Disciplina = require('./models/disciplina'); 
const publicRouter = require('./routes/publicRoute'); 
// --------------------------------------------------

// Configuração da sessão
const sessionMiddleware = session({
    secret: 'keyboard cat', // Mude para uma chave secreta forte em produção
    resave: false,
    saveUninitialized: true,
});

// 🔹 INICIALIZAÇÃO DO PASSPORT
// Certifique-se de que o Passport está configurado (com o arquivo que corrigimos)
// e que estas linhas estão ANTES das rotas.
app.use(sessionMiddleware);
app.use(passport.initialize()); // Inicializa o Passport
app.use(passport.session());    // Habilita a sessão do Passport

// Configurações do Express
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 🔹 Middleware para injetar o usuário logado em todas as views (essencial para o EJS)
app.use((req, res, next) => {
    // req.user é definido pelo Passport.js após o deserializeUser
    res.locals.user = req.user || null;
    next();
});

app.use('/', publicRouter);

const server = http.createServer(app );
const io = new Server(server);

// Compartilhar a sessão do Express com o Socket.IO
io.engine.use(sessionMiddleware);

io.on('connection', (socket) => {
    console.log('Novo usuário conectado ao chat:', socket.id);

    const session = socket.request.session;
    
    // 🔹 Lógica de segurança: Desconectar se o usuário não estiver autenticado
    // Verifica se a sessão existe E se o Passport.js armazenou um ID de usuário na sessão
    const isAuthenticated = session && session.passport && session.passport.user;

    if (!isAuthenticated) {
        console.log('Tentativa de conexão não autenticada. Desconectando.');
        socket.disconnect(true);
        return;
    }

    // Receber mensagens do cliente
    socket.on('chat message', (data) => {
        if (data && data.nickname && data.msg) {
            console.log(`[${data.nickname}]: ${data.msg}`);
            // Envia a mensagem para todos os clientes conectados
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

// Rotas adicionais (mantidas do seu código)
app.get('/disciplina/:disciplina/foto/:arquivo', (req, res) => {
    const caminho = path.join(__dirname, 'public', 'assets', 'fotos', req.params.arquivo);
    res.download(caminho);
});

app.get('/listar', async (req, res) => {
    // req.user é o objeto de usuário completo retornado pelo deserializeUser
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
