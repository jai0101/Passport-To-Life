const Usuario = require('../models/usuario');
const Material = require('../models/material');
const DisciplinaDisponivel = require('../models/disciplinasDisponiveis');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require("fs");
const { converterParaPDF } = require('../config/conversor');

const publicController = {

    // ----------------------
    // PÁGINAS PÚBLICAS
    // ----------------------
    abreindex: (req, res) => res.render('index'),
    abredescricao: (req, res) => res.render('descricao'),
    abredesenvolvedora: (req, res) => res.render('desenvolvedora'),
    abreconteudo: (req, res) => res.render('conteudo'),
    abredoacao: (req, res) => res.render('doacao'),
    mostrarmensagem: (req, res) => res.render('mensagem'),
    abreavaliacao: (req, res) => res.render('avaliar'),
    mostraravaliacao: (req, res) => res.render('avaliacoes'),

    // ----------------------
    // REGISTRO
    // ----------------------
    postRegistrar: async (req, res) => {
        try {
            const { username, email, password } = req.body;
            if (!username || !email || !password) {
                return res.redirect('/login?error=Preencha todos os campos');
            }

            const usuarioExistente = await Usuario.findOne({ email });
            if (usuarioExistente) {
                return res.redirect('/login?error=E-mail já cadastrado');
            }

            const hash = await bcrypt.hash(password, 10);

            const novoUsuario = new Usuario({
                username,
                email,
                password: hash,
                foto: req.file ? req.file.filename : "default.png"
            });

            await novoUsuario.save();
            res.redirect('/login?ok=Conta criada com sucesso!');
        } catch (err) {
            console.error(err);
            res.redirect('/login?error=Erro ao registrar');
        }
    },

    // ----------------------
    // PERFIL DO USUÁRIO LOGADO
    // ----------------------
    abreperfil: async (req, res) => {
        try {
            const materiais = await Material.find({ usuario: req.user._id })
                .populate("disciplina")
                .sort({ createdAt: -1 })
                .lean();

            const disciplinasDisponiveis = await DisciplinaDisponivel.find().lean();

            res.render('perfil', {
                Admin: req.user,
                materiais,
                disciplinasDisponiveis
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Erro ao carregar perfil");
        }
    },

    // ----------------------
    // EDITAR PERFIL
    // ----------------------
    editar: async (req, res) => {
        try {
            const usuario = await Usuario.findById(req.params.id).lean();
            if (!usuario) return res.send("Usuário não encontrado");

            res.render('editar', { usuario });
        } catch (err) {
            console.error(err);
            res.send("Erro ao abrir edição");
        }
    },

    enviaeditar: async (req, res) => {
        try {
            const { username, email } = req.body;
            let dados = { username, email };

            if (req.file) dados.foto = req.file.filename;

            await Usuario.findByIdAndUpdate(req.params.id, dados);
            res.redirect('/perfil');
        } catch (err) {
            console.error(err);
            res.send("Erro ao atualizar");
        }
    },

    // ----------------------
    // DELETAR USUÁRIO
    // ----------------------
    deletar: async (req, res) => {
        try {
            await Usuario.findByIdAndDelete(req.params.id);
            res.redirect('/listar');
        } catch (err) {
            console.error(err);
            res.send("Erro ao deletar");
        }
    },

    // ----------------------
    // LISTAR USUÁRIOS (com total de materiais)
    // ----------------------
    abrirlistar: async (req, res) => {
        try {
            const usuarios = await Usuario.find().lean();

            const usuariosComContagem = await Promise.all(
                usuarios.map(async (usuario) => {
                    const totalMateriais = await Material.countDocuments({ usuario: usuario._id });
                    return { ...usuario, totalMateriais };
                })
            );

            res.render('listar', { usuarios: usuariosComContagem });
        } catch (err) {
            console.error(err);
            res.send("Erro ao listar usuários");
        }
    },

    // ----------------------
    // PERFIL DE OUTRO USUÁRIO
    // ----------------------
    verPerfilUsuario: async (req, res) => {
        try {
            const usuario = await Usuario.findById(req.params.id).lean();
            if (!usuario) return res.send("Usuário não encontrado");

            const materiais = await Material.find({ usuario: usuario._id })
                .populate("disciplina")
                .lean();

            res.render("perfilunico", {
                usuario,
                materiais,
                userLogado: req.user
            });
        } catch (err) {
            console.error(err);
            res.send("Erro ao buscar usuário");
        }
    },

    // ----------------------
    // VISUALIZAR DISCIPLINA
    // ----------------------
    abreDisciplina: async (req, res) => {
        try {
            const disciplina = await DisciplinaDisponivel.findOne({
                titulo: req.params.disciplina
            }).lean();

            if (!disciplina) return res.send("Disciplina não encontrada!");

            const materiais = await Material.find({ disciplina: disciplina._id }).lean();
            res.render("disciplina", { disciplina, materiais });
        } catch (err) {
            console.error(err);
            res.send("Erro ao abrir disciplina");
        }
    },

    // ----------------------
    // VISUALIZAR MATERIAL (PDF ou PPT/PPTX)
    // ----------------------
    visualizaMaterial: async (req, res) => {
        try {
            const material = await Material.findById(req.params.id).lean();
            if (!material) return res.status(404).send("Material não encontrado");

            const filePath = path.resolve(__dirname, '../public/assets/materiais', material.material);
            if (!fs.existsSync(filePath)) return res.status(404).send("Arquivo não encontrado");

            const ext = path.extname(material.material).toLowerCase();

            if (ext === '.pdf') {
                return res.sendFile(filePath);
            }

            if (ext === '.ppt' || ext === '.pptx') {
                try {
                    const pdfBuffer = await converterParaPDF(filePath);
                    res.contentType("application/pdf");
                    return res.send(pdfBuffer);
                } catch (convErr) {
                    console.error("Erro na conversão PPT para PDF:", convErr);
                    return res.status(500).send("Não foi possível converter o PPT para PDF. Você pode baixar o arquivo diretamente.");
                }
            }

            return res.status(400).send("Visualização não disponível para este tipo de arquivo");

        } catch (err) {
            console.error(err);
            res.status(500).send("Erro ao visualizar material");
        }
    },

    // ----------------------
    // BUSCAR MATERIAL
    // ----------------------
    buscarMaterialPorTitulo: async (req, res) => {
        try {
            const { q } = req.query;
            const materiais = await Material.find({ titulo: new RegExp(q, "i") }).lean();
            res.render("buscar", { materiais, q });
        } catch (err) {
            console.error(err);
            res.send("Erro na busca");
        }
    },

    // ----------------------
    // UPLOAD MATERIAL
    // ----------------------
    uploadMaterial: async (req, res) => {
        try {
            const novo = new Material({
                titulo: req.body.titulo,
                conteudo: req.body.conteudo,
                disciplina: req.body.disciplina,
                usuario: req.user._id,
                material: req.file.filename
            });
            await novo.save();
            res.redirect('/perfil');
        } catch (err) {
            console.error(err);
            res.send("Erro ao enviar material");
        }
    },

    // ----------------------
    // DOWNLOAD MATERIAL
    // ----------------------
    downloadMaterial: async (req, res) => {
        try {
            const material = await Material.findById(req.params.id).lean();
            if (!material) return res.send("Arquivo não encontrado");

            const filePath = path.resolve("public/assets/materiais", material.material);
            if (!fs.existsSync(filePath)) return res.send("Arquivo não encontrado no servidor");

            res.download(filePath);
        } catch (err) {
            console.error(err);
            res.send("Erro ao baixar");
        }
    },

    // ----------------------
    // EXCLUIR MATERIAL
    // ----------------------
    deletarMaterial: async (req, res) => {
        try {
            await Material.findByIdAndDelete(req.params.id);
            res.redirect('/perfil');
        } catch (err) {
            console.error(err);
            res.send("Erro ao excluir");
        }
    },

    // ----------------------
    // LOGOUT
    // ----------------------
    logout: (req, res) => {
        req.logout(err => {
            if (err) {
                console.error("Erro ao fazer logout:", err);
                return res.redirect('/perfil?erro=Erro ao sair');
            }
            return res.redirect('/login?ok=Logout realizado!');
        });
    }

};

module.exports = publicController;
