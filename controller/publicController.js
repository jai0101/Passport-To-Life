const Usuario = require('../models/usuario');
const Destinatario = require('../models/destinatario');
const Avaliador = require('../models/avaliador');
const Disciplina = require('../models/disciplina');
const path = require('path');

// Abre página inicial
async function abreindex(req, res) {
    const admin = req.user ? await Usuario.findById(req.user.id) : null;
    res.render('index', { Admin: admin });
}

// Outras páginas públicas
async function abredescricao(req, res) {
    const admin = req.user ? await Usuario.findById(req.user.id) : null;
    res.render('descricao', { Admin: admin });
}

async function abredesenvolvedora(req, res) {
    const admin = req.user ? await Usuario.findById(req.user.id) : null;
    res.render('desenvolvedora', { Admin: admin });
}

async function abreconteudo(req, res) {
    const admin = req.user ? await Usuario.findById(req.user.id) : null;
    res.render('conteudo', { Admin: admin });
}

async function abrelogin(req, res) {
    res.render('login');
}

async function abreregistrar(req, res) {
    res.render('registrar');
}

async function abredoacao(req, res) {
    const admin = req.user ? await Usuario.findById(req.user.id) : null;
    res.render('doacao', { Admin: admin });
}

async function abreavaliacao(req, res) {
    const admin = req.user ? await Usuario.findById(req.user.id) : null;
    res.render('avaliar', { Admin: admin });
}

async function mostrarmensagem(req, res) {
    const admin = req.user ? await Usuario.findById(req.user.id) : null;
    const destinatarios = await Destinatario.find();
    res.render('mensagem', { Destinatarios: destinatarios, Admin: admin });
}

async function mostraravaliacao(req, res) {
    const admin = req.user ? await Usuario.findById(req.user.id) : null;
    const avaliacoes = await Avaliador.find();
    res.render('avaliacoes', { Avaliacoes: avaliacoes, Admin: admin });
}

// Abrir perfil do usuário logado
async function abreperfil(req, res) {
    if (!req.user) return res.redirect('/login');

    const usuario = await Usuario.findById(req.user.id);
    const usu_disciplinas = await Disciplina.find({ usuario: req.user.id });

    res.render('perfil', {
        Admin: usuario,
        Disciplinas: usu_disciplinas
    });
}

// Perfil público por ID
async function perfilunico(req, res) {
    try {
        const usuario = await Usuario.findById(req.params.id);
        const admin = req.user ? await Usuario.findById(req.user.id) : null;
        const usu_disciplinas = await Disciplina.find({ usuario: req.params.id });

        res.render('perfilunico', {
            usuario,
            Admin: admin,
            Disciplinas: usu_disciplinas,
            num_disciplinas: usu_disciplinas.length
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Erro ao buscar perfil.');
    }
}

// Abrir lista de usuários
async function abrirlistar(req, res) {
  const nomeUsuario = req.query.nome1 || '';
  const admin = req.user ? await Usuario.findById(req.user.id) : null;

  const query = nomeUsuario ? { nome1: nomeUsuario } : {};
  const usuarios = await Usuario.find(query).exec();

  const quantidadeConteudos = usuarios.map(usuario => {
    if (usuario.disciplina && usuario.disciplina.material) {
      return usuario.disciplina.material.length;
    } else {
      return 0;
    }
  });

  res.render("listar", {
    Usuarios: usuarios,
    Admin: admin,
    quantidadeConteudos
  });
}

// Logout
async function logout(req, res, next) {
    req.logout(function(err) {
        if (err) return next(err);
        res.redirect('/login');
    });
}

// Registro
async function enviaregistrar(req, res) {
    const usuario = new Usuario({
        nome1: req.body.nome1,
        nome2: req.body.nome2,
        telephone: req.body.telephone,
        profissao: req.body.profissao,
        cidade: req.body.cidade,
        username: req.body.username,
        password: req.body.password,
        foto: req.file.filename
    });

    usuario.save(function(err) {
        if (err) {
            console.log(err);
            return res.redirect('/registrar');
        }
        res.redirect('/');
    });
}

// Adicionar conteúdo
async function adicionarconteudo(req, res) {
    const admin = req.user ? await Usuario.findById(req.user.id) : null;
    res.render('addconteudo', { Admin: admin });
}

// Enviar conteúdo
async function enviaconteudo(req, res) {
    const disciplina = new Disciplina({
        conteudo: req.body.conteudo,
        titulo: req.body.titulo,
        material: req.file.filename,
        usuario: req.user.id
    });

    disciplina.save(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/perfil');
        }
    });
}

// Editar usuário
async function editar(req, res) {
    const admin = req.user ? await Usuario.findById(req.user.id) : null;
    const usuario = await Usuario.findById(req.params.id);
    res.render('editar', { Usuario: usuario, Admin: admin });
}

// Enviar edição
async function enviaeditar(req, res) {
    await Usuario.findByIdAndUpdate(req.user.id, {
        nome1: req.body.nome1,
        nome2: req.body.nome2,
        telephone: req.body.telephone,
        profissao: req.body.profissao,
        cidade: req.body.cidade,
        username: req.body.username,
        password: req.body.password,
        foto: req.file.filename
    });
    res.redirect('/perfil');
}

// Deletar usuário
async function deletar(req, res) {
    try {
        await Usuario.findByIdAndDelete(req.params.id);
        req.logout(function(err) {
            if (err) console.log(err);
            res.redirect('/');
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Erro ao excluir usuário');
    }
}

// Doação
async function enviadoacao(req, res) {
    const destinatario = new Destinatario({
        nome: req.body.nome,
        email: req.body.email,
        pix: req.body.pix,
        mensagem: req.body.mensagem
    });

    destinatario.save(err => {
        if (err) console.log(err);
        res.redirect('/mensagem');
    });
}

// Avaliar
async function avaliar(req, res) {
    const avaliador = new Avaliador({
        apelido: req.body.apelido,
        email: req.body.email,
        avaliacao: req.body.avaliacao
    });

    avaliador.save(err => {
        if (err) console.log(err);
        res.redirect('/avaliacoes');
    });
}

// Visualizar disciplina
async function abreDisciplina(req, res) {
    const admin = req.user ? await Usuario.findById(req.user.id) : null;
    const disciplinas = await Disciplina.find({ conteudo: req.params.disciplina });
    disciplinas.forEach(d => d.caminhoMaterial = `/assets/fotos/${d.material}`);
    res.render('visualizaconteudo', { Disciplinas: disciplinas, nome: req.params.disciplina, Admin: admin });
}

module.exports = {
    abreindex,
    abredescricao,
    abredesenvolvedora,
    abreconteudo,
    abrelogin,
    logout,
    abreregistrar,
    enviaregistrar,
    abreperfil,
    abredoacao,
    mostrarmensagem,
    adicionarconteudo,
    abrirlistar,
    deletar,
    editar,
    enviaeditar,
    enviadoacao,
    abreDisciplina,
    abreavaliacao,
    avaliar,
    mostraravaliacao,
    enviaconteudo,
    perfilunico
};
