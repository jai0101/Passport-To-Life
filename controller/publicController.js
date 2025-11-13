const Usuario = require('../models/usuario');
const Material = require('../models/material');
const DisciplinaDisponivel = require('../models/disciplinasDisponiveis');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// ==========================
// Middleware de permissão
// ==========================
function podeEditarOuExcluir(user, alvoId, adminCampo = 'admin') {
  if (!user) return false;
  if (user[adminCampo] === true) return true;
  return user._id.toString() === alvoId.toString();
}

module.exports = {

  // ==========================
  // PÁGINAS PÚBLICAS
  // ==========================
  abreindex: async (req, res) => {
    try {
      const disciplinas = await DisciplinaDisponivel.find().sort({ titulo: 1 }).lean();
      res.render('index', { disciplinas });
    } catch (err) {
      console.error(err);
      res.render('index', { disciplinas: [] });
    }
  },
  abredescricao: (req, res) => res.render('descricao'),
  abredesenvolvedora: (req, res) => res.render('desenvolvedora'),
  abreconteudo: (req, res) => res.render('conteudo'),
  abredoacao: (req, res) => res.render('doacao'),
  mostrarmensagem: (req, res) => res.render('mensagem'),
  abreavaliacao: (req, res) => res.render('avaliar'),
  mostraravaliacao: (req, res) => res.render('avaliacoes'),

  // ==========================
  // LOGIN
  // ==========================
  abrelogin: (req, res) => {
    res.render('login', { 
      error: req.query.error || null, 
      oldEmail: req.query.oldEmail || '', 
      ok: req.query.ok || null 
    });
  },

  // ==========================
  // PERFIL DO USUÁRIO LOGADO
  // ==========================
  abreperfil: async (req, res) => {
    try {
      if (!req.user) return res.redirect('/login?erro=Você precisa estar logado');

      const usuario = await Usuario.findById(req.user._id).lean();
      const materiais = await Material.find({ usuario: req.user._id })
        .populate('disciplina')
        .sort({ createdAt: -1 })
        .lean();

      const disciplinas = await DisciplinaDisponivel.find().lean();

      res.render('perfil', {
        Admin: usuario, // 👈 compatível com o EJS que usa "Admin"
        materiais,
        disciplinasDisponiveis: disciplinas,
        ok: req.query.ok || null,
        erro: req.query.erro || null
      });
    } catch (err) {
      console.error("💥 Erro ao carregar perfil:", err);
      res.status(500).send("Erro ao carregar perfil 😢");
    }
  },

  verPerfilUsuario: async (req, res) => {
    try {
      const usuario = await Usuario.findById(req.params.id).lean();
      if (!usuario) return res.redirect('/listar?erro=Usuário não encontrado');

      const materiais = await Material.find({ usuario: usuario._id })
        .populate('disciplina')
        .lean();

      return res.render('perfilunico', { usuario, materiais });
    } catch (err) {
      console.error("Erro ao carregar perfil do usuário:", err);
      return res.redirect('/listar?erro=Erro ao carregar perfil');
    }
  },
// ==========================
// REGISTRAR
// ==========================
abreregistrar: (req, res) => {
  res.render('registrar', {
    usuario: {
      nome1: '',
      nome2: '',
      username: '',
      telefone: '',
      profissao: '',
      cidade: '',
      foto: null
    },
    mensagem: null
  });
},

postRegistrar: async (req, res) => {
  try {
    const { nome1, nome2, username, password, telefone, profissao, cidade } = req.body;
    let foto = req.file ? req.file.filename : null;

    const usuarioExistente = await Usuario.findOne({ username });
    if (usuarioExistente) {
      return res.render('registrar', {
        usuario: { nome1, nome2, username, telefone, profissao, cidade, foto },
        mensagem: 'Usuário já cadastrado!'
      });
    }

    if (foto && path.extname(foto).toLowerCase() === '.heic') {
      const caminhoArquivo = path.join(__dirname, '..', 'public', 'assets', 'fotos', foto);
      const novoNome = foto.replace(/\.heic$/i, '.jpg');
      const caminhoNovo = path.join(__dirname, '..', 'public', 'assets', 'fotos', novoNome);
      await sharp(caminhoArquivo).jpeg({ quality: 90 }).toFile(caminhoNovo);
      fs.unlinkSync(caminhoArquivo);
      foto = novoNome;
    }

    const hashSenha = await bcrypt.hash(password, 10);

    await Usuario.create({
      nome1,
      nome2,
      username,
      password: hashSenha,
      telefone,
      profissao,
      cidade,
      foto
    });

    // Redirect direto do controller
    return res.redirect('/login?ok=Usuário cadastrado com sucesso! Faça login para continuar.');
  } catch (err) {
    console.error(err);
    return res.render('registrar', {
      usuario: req.body,
      mensagem: 'Erro ao criar conta. Tente novamente.'
    });
  }
},

  // ==========================
  // LOGOUT
  // ==========================
  logout: (req, res, next) => {
    req.logout(err => {
      if (err) return next(err);
      res.redirect('/');
    });
  },

  // ==========================
  // EDITAR PERFIL (/editar/:id)
  // ==========================
  editar: async (req, res) => {
    try {
      const usuario = await Usuario.findById(req.params.id).lean();
      if (!usuario) return res.redirect('/perfil?erro=Usuário não encontrado');

      if (!podeEditarOuExcluir(req.user, usuario._id))
        return res.redirect('/perfil?erro=Sem permissão');

      res.render('editarPerfil', { usuario, mensagem: null });
    } catch (err) {
      console.error(err);
      res.redirect('/perfil?erro=Erro ao carregar edição');
    }
  },

  enviaeditar: async (req, res) => {
    try {
      const usuario = await Usuario.findById(req.params.id);
      if (!usuario) return res.redirect('/perfil?erro=Usuário não encontrado');

      if (!podeEditarOuExcluir(req.user, usuario._id))
        return res.redirect('/perfil?erro=Sem permissão');

      const { nome1, nome2, telefone, profissao, cidade, username, password } = req.body;

      usuario.nome1 = nome1 || usuario.nome1;
      usuario.nome2 = nome2 || usuario.nome2;
      usuario.telefone = telefone || usuario.telefone;
      usuario.profissao = profissao || usuario.profissao;
      usuario.cidade = cidade || usuario.cidade;
      usuario.username = username || usuario.username;

      if (password && password.trim() !== '') {
        usuario.password = await bcrypt.hash(password, 10);
      }

      if (req.file) {
        let foto = req.file.filename;
        if (path.extname(foto).toLowerCase() === '.heic') {
          const caminhoArquivo = path.join(__dirname, '..', 'public', 'assets', 'fotos', foto);
          const novoNome = foto.replace(/\.heic$/i, '.jpg');
          const caminhoNovo = path.join(__dirname, '..', 'public', 'assets', 'fotos', novoNome);

          await sharp(caminhoArquivo).jpeg({ quality: 90 }).toFile(caminhoNovo);
          fs.unlinkSync(caminhoArquivo);
          foto = novoNome;
        }
        usuario.foto = foto;
      }

      await usuario.save();
      return res.redirect('/perfil?ok=Perfil atualizado com sucesso!');
    } catch (err) {
      console.error(err);
      res.redirect('/perfil?erro=Erro ao atualizar perfil');
    }
  },

  // ==========================
  // EXCLUIR PERFIL (/excluir/:id)
  // ==========================
  deletar: async (req, res) => {
    try {
      const usuario = await Usuario.findById(req.params.id);
      if (!usuario) return res.redirect('/perfil?erro=Usuário não encontrado');

      if (!podeEditarOuExcluir(req.user, usuario._id))
        return res.redirect('/perfil?erro=Sem permissão');

      await Usuario.findByIdAndDelete(req.params.id);

      req.logout(() => res.redirect('/?ok=Conta excluída com sucesso!'));
    } catch (err) {
      console.error(err);
      return res.redirect('/perfil?erro=Erro ao excluir conta');
    }
  },

  // ==========================
  // LISTAR USUÁRIOS
  // ==========================
  abrirlistar: async (req, res) => {
    try {
      const usuarios = await Usuario.find().lean();
      const contagens = await Material.aggregate([{ $group: { _id: "$usuario", total: { $sum: 1 } } }]);

      const mapaContagens = {};
      contagens.forEach(c => {
        if (c._id) mapaContagens[c._id.toString()] = c.total;
      });

      const usuariosComContagem = usuarios.map(u => ({
        ...u,
        quantidadeConteudos: mapaContagens[u._id.toString()] || 0
      }));

      res.render('listar', {
        usuarios: usuariosComContagem,
        ok: req.query.ok,
        erro: req.query.erro
      });
    } catch (err) {
      console.error("Erro em abrirlistar:", err);
      res.redirect('/?erro=Erro ao listar usuários');
    }
  },

  // ==========================
  // MATERIAIS
  // ==========================
  uploadMaterial: async (req, res) => {
    try {
      if (!req.user) return res.redirect('/login?erro=Faça login');
      if (!req.file) return res.redirect('/perfil?erro=Nenhum arquivo enviado');

      await Material.create({
        usuario: req.user._id,
        disciplina: req.body.disciplina,
        titulo: req.body.titulo,
        conteudo: req.body.conteudo,
        material: req.file.filename
      });

      res.redirect('/perfil?ok=Material enviado com sucesso!');
    } catch (err) {
      console.error(err);
      res.redirect('/perfil?erro=Erro no upload');
    }
  },

  downloadMaterial: async (req, res) => {
    try {
      const material = await Material.findById(req.params.id);
      if (!material) return res.status(404).send("Material não encontrado");

      const caminho = path.join(__dirname, "..", "public", "assets", "fotos", material.material);
      if (!fs.existsSync(caminho)) return res.status(404).send("Arquivo físico não encontrado");

      res.download(caminho, material.material);
    } catch (err) {
      console.error(err);
      res.status(500).send("Erro ao baixar o material");
    }
  },

  deletarMaterial: async (req, res) => {
    try {
      const material = await Material.findById(req.params.id);
      if (!material) return res.redirect('/perfil?erro=Material não encontrado');

      if (!podeEditarOuExcluir(req.user, material.usuario))
        return res.redirect('/perfil?erro=Sem permissão');

      const caminho = path.join(__dirname, "..", "public", "assets", "fotos", material.material);
      if (fs.existsSync(caminho)) fs.unlinkSync(caminho);

      await material.deleteOne();
      res.redirect('/perfil?ok=Material excluído com sucesso!');
    } catch (err) {
      console.error(err);
      res.redirect('/perfil?erro=Erro ao excluir material');
    }
  },

  // ==========================
  // VISUALIZAR MATERIAIS POR DISCIPLINA
  // ==========================
  abreDisciplina: async (req, res) => {
    try {
      const nomeDisciplina = req.params.disciplina.trim();
      const busca = req.query.busca || '';

      const disciplina = await DisciplinaDisponivel.findOne({
        titulo: { $regex: new RegExp('^' + nomeDisciplina + '$', 'i') }
      }).lean();

      if (!disciplina) {
        return res.render('visualiza', {
          disciplina: nomeDisciplina,
          materiais: [],
          busca,
          userLogado: req.user || null,
          baseUrl: `${req.protocol}://${req.get('host')}`
        });
      }

      const filtro = { disciplina: disciplina._id };
      if (busca.trim() !== '') filtro.titulo = { $regex: busca, $options: 'i' };

      const materiais = await Material.find(filtro)
        .populate('usuario')
        .populate('disciplina')
        .sort({ createdAt: -1 })
        .lean();

      res.render('visualiza', {
        disciplina: disciplina.titulo,
        materiais,
        busca,
        userLogado: req.user || null,
        baseUrl: `${req.protocol}://${req.get('host')}`
      });
    } catch (err) {
      console.error('Erro ao abrir disciplina:', err);
      res.redirect('/?erro=Erro ao carregar disciplina');
    }
  },

  // ==========================
  // BUSCA GERAL
  // ==========================
  buscarMaterialPorTitulo: async (req, res) => {
    try {
      const termo = req.query.q || "";
      const regex = new RegExp(termo, "i");

      const materiais = await Material.find({ titulo: regex })
        .populate('usuario', 'username foto')
        .populate('disciplina', 'titulo')
        .sort({ createdAt: -1 })
        .lean();

      const disciplinas = await DisciplinaDisponivel.find().sort({ titulo: 1 }).lean();

      res.render('buscaMateriais', {
        termo,
        materiais,
        disciplinas,
        userLogado: req.user || null
      });
    } catch (err) {
      console.error("Erro ao buscar materiais:", err);
      res.status(500).send("Erro ao buscar materiais");
    }
  }
};
