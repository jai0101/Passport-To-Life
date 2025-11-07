const Usuario = require('../models/usuario');
const Disciplina = require('../models/disciplina');

// Função auxiliar pra sempre passar Admin
const getAdmin = (req) => (req.user ? req.user : null);

// ✅ PÁGINA INDEX
exports.abreindex = (req, res) => {
  res.render('index', { Admin: getAdmin(req) });
};

// ✅ OUTRAS PÁGINAS SIMPLES
exports.abredescricao = (req, res) => res.render('descricao', { Admin: getAdmin(req) });
exports.abredesenvolvedora = (req, res) => res.render('desenvolvedora', { Admin: getAdmin(req) });
exports.abreconteudo = (req, res) => res.render('conteudo', { Admin: getAdmin(req) });
exports.abrelogin = (req, res) => res.render('login', { Admin: null });
exports.abreregistrar = (req, res) => res.render('registrar', { Admin: null });
exports.abredoacao = (req, res) => res.render('doacao', { Admin: getAdmin(req) });
exports.mostrarmensagem = (req, res) => res.render('mensagem', { Admin: getAdmin(req) });
exports.abreavaliacao = (req, res) => res.render('avaliar', { Admin: getAdmin(req) });
exports.mostraravaliacao = (req, res) => res.render('avaliacoes', { Admin: getAdmin(req) });
exports.adicionarconteudo = (req, res) => res.render('addconteudo', { Admin: getAdmin(req) });

// ✅ LOGOUT
exports.logout = (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/login');
  });
};

// ✅ PERFIL PROTEGIDO COM LOGIN
exports.abreperfil = async (req, res) => {
  if (!req.user) return res.redirect('/login');

  try {
    const usuario = await Usuario.findById(req.user.id);
    if (!usuario) {
      req.logout(() => {});
      return res.redirect('/login');
    }

    const usu_disciplinas = await Disciplina.find({ usuario: req.user.id });

    res.render('perfil', {
      Admin: usuario,
      Disciplinas: usu_disciplinas
    });

  } catch (err) {
    console.error("Erro ao abrir perfil:", err);
    return res.redirect('/login');
  }
};

// ✅ PERFIL PÚBLICO POR ID
exports.perfilunico = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.redirect('/');
    const disciplinas = await Disciplina.find({ usuario: usuario._id });

    res.render('perfilunico', { 
      Admin: getAdmin(req),
      usuario, 
      disciplinas 
    });

  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
};

// ✅ LISTAR USUÁRIOS (agora existe e não quebra o header)
exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.render('listar', {
      Admin: getAdmin(req),
      usuarios
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
};

// ✅ REGISTRO
exports.enviaregistrar = async (req, res) => {
  try {
    await Usuario.create(req.body);
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.redirect('/registrar');
  }
};

// ✅ AVALIAÇÃO
exports.avaliar = (req, res) => {
  res.redirect('/avaliacoes');
};

// ✅ DOAÇÃO
exports.enviadoacao = (req, res) => {
  res.redirect('/doacao');
};

// ✅ DISCIPLINA
exports.abreDisciplina = (req, res) => {
  res.render('disciplina', {
    Admin: getAdmin(req),
    id: req.params.disciplina
  });
};

// ✅ CONTEÚDO
exports.enviaconteudo = (req, res) => {
  res.redirect('/conteudo');
};

// ✅ DELETAR
exports.deletar = (req, res) => {
  res.redirect('/listar');
};

// ✅ EDITAR
exports.editar = (req, res) => {
  res.render('editar', {
    Admin: getAdmin(req),
    id: req.params.id
  });
};

exports.enviaeditar = (req, res) => {
  res.redirect('/perfil');
};
