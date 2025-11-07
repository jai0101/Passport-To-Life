var passport = require('passport');
var LocalStrategy = require('passport-local');
const Usuario = require('../models/usuario'); // Certifique-se de que este caminho está correto

passport.use(new LocalStrategy(async function verify(username, password, cb) {
    
    try {
        const usuario = await Usuario.findOne({
            username: username
        });

        if (!usuario) {
            return cb(null, false, {
                message: 'Usuário não encontrado!'
            });
        }
        
        // 🔹 MELHORIA: Use uma função de comparação de senha segura (ex: bcrypt) em vez de comparação direta
        if (usuario.password !== password) { 
            return cb(null, false, {
                message: 'Senha incorreta!'
            });
        }
        
        console.log('ok');
        return cb(null, usuario);

    } catch (err) {
        return cb(err);
    }
}));

// 🔹 CORREÇÃO: Serializar apenas o ID do usuário
passport.serializeUser(function (usuario, cb) {
    process.nextTick(function () {
        // Salva apenas o ID do usuário na sessão
        cb(null, { id: usuario._id }); 
    });
});

// 🔹 CORREÇÃO: Deserializar buscando o usuário no banco de dados pelo ID
passport.deserializeUser(async function (user, cb) {
    try {
        // O 'user' aqui é o objeto { id: ... } que foi serializado
        const usuario = await Usuario.findById(user.id); 
        
        if (!usuario) {
            return cb(null, false);
        }
        
        // Retorna o objeto completo do usuário para ser anexado ao req.user
        // O objeto retornado deve ser o que você quer que seja o req.user
        return cb(null, {
            id: usuario._id,
            nome1: usuario.nome1,
            nome2: usuario.nome2,
            telephone: usuario.telephone,
            profissao: usuario.profissao,
            cidade: usuario.cidade,
            username: usuario.username,
            password: usuario.password,
            foto: usuario.foto
        });
        
    } catch (err) {
        return cb(err);
    }
});

module.exports = passport;
