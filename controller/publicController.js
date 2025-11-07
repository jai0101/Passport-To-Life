const Usuario = require('../models/usuario');
const Disciplina = require('../models/disciplina');

// ✅ PÁGINA INDEX
exports.abreindex = (req, res) => {
  res.render('index');
};

// ✅ OUTRAS PÁGINAS SIMPLES
exports.abredescricao = (req, res) => res.render('descricao');
exports.abredesenvolvedora = (req, res) => res.render('desenvolvedora');
exports.abreconteudo = (req, res) => res.render('conteudo');
exports.abrelogin = (req, res) => res.render('login');
exports.abreregistrar = (req, res) => res.render('registrar');
exports.abredoacao = (req, res) => res.render('doacao');
exports.mostrarmensagem = (req, res) => res.render('mensagem');
exports.abreavaliacao = (req, res) => res.render('avaliar');
exports.mostraravaliacao = (req, res) => res.render('avaliacoes');
exports.adicionarconteudo = (req, res) => res.render('addconteudo');

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

// ✅ PERFIL PÚBLICO (se você quiser manter)
exports.perfilunico = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.redirect('/');
    const disciplinas = await Disciplina.find({ usuario: usuario._id });

    res.render('perfilunico', { usuario, disciplinas });

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
  res.render('disciplina', { id: req.params.disciplina });
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
  res.render('editar', { id: req.params.id });
};

exports.enviaeditar = (req, res) => {
  res.redirect('/perfil');
};
