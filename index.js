const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const path = require('path');
const passport = require('passport');
// Importações de modelos (mantidas do seu código)
const Usuario = require('path/to/your/models/usuario'); // Ajuste o caminho
const Disciplina = require('path/to/your/models/disciplina'); // Ajuste o caminho

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

// 🔹 Middleware para injetar o usuário logado em todas as views (essencial para o EJS)
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

const publicRouter = require('./routes/publicRoute'); // Ajuste o caminho
app.use('/', publicRouter);

const server = http.createServer(app);
const io = new Server(server);

// Compartilhar a sessão do Express com o Socket.IO
io.engine.use(sessionMiddleware);

io.on('connection', (socket) => {
    console.log('Novo usuário conectado ao chat:', socket.id);

    // 🔹 Lógica de segurança: Desconectar se o usuário não estiver autenticado
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

// Rotas adicionais (mantidas do seu código)
app.get('/disciplina/:disciplina/foto/:arquivo', (req, res) => {
    const caminho = path.join(__dirname, 'public', 'assets', 'fotos', req.params.arquivo);
    res.download(caminho);
});

app.get('/listar', async (req, res) => {
    // Apenas para fins de demonstração, o código abaixo usa as variáveis que você definiu.
    // Você precisará garantir que os modelos 'Usuario' e 'Disciplina' estejam corretamente importados e configurados.
    const usuarios = await Usuario.find({}).exec();
    const conteudosPorUsuario = [];
    for (let usuario of usuarios) {
        // Simulação de busca de conteúdo
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
