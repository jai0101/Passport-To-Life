var Usuario = require('../models/usuario')
var Destinatario = require('../models/destinatario')
var Avaliador = require('../models/avaliador')
var Disciplina = require('../models/disciplina')
const path = require('path');

async function abreindex(req,res) {
  const admin = req.user ? await Usuario.findById(req.user.id) : undefined;
    res.render('index',{Admin:admin})
}

async function abredescricao(req,res) {
  const admin = req.user ? await Usuario.findById(req.user.id) : undefined;
    res.render('descricao',{Admin:admin})
}

async function abreconteudo(req,res) {
  const admin = req.user ? await Usuario.findById(req.user.id) : undefined;
    res.render('conteudo',{Admin:admin})
}

async function abredesenvolvedora(req,res) {
  const admin = req.user ? await Usuario.findById(req.user.id) : undefined;
    res.render('desenvolvedora',{Admin:admin})
}

async function abrelogin(req,res) {
    res.render('login')
}

async function logout(req, res) {
    req.logout(function(err) {
        if (err) { return next(err); }
        // redirecionar para a página de login após o logout
        res.redirect('/login');
      });
}      


async function abreperfil(req,res) {
    const usuario = await Usuario.findById(req.user.id);
  
    const usu_disciplinas = await Disciplina.find({
      usuario: req.user.id // Busca as disciplinas que foram adicionadas pelo usuário logado
    });
  
    res.render('perfil', {
      Admin: usuario,
      Disciplinas: usu_disciplinas
    });
  }
  


async function abredoacao(req,res) {
  const admin = req.user ? await Usuario.findById(req.user.id) : undefined;
    res.render('doacao', {Admin:admin})
    
}

async function abreavaliacao(req,res) {
  const admin = req.user ? await Usuario.findById(req.user.id) : undefined;
    res.render('avaliar', {Admin:admin})
    
}

async function mostrarmensagem(req, res) {
  const admin = req.user ? await Usuario.findById(req.user.id) : undefined;
    const destinatario = await Destinatario.find({}).exec(function (err, docs) {
    if (admin) {
    res.render("mensagem", { Destinatarios: docs, Admin: admin });
    } else {
    res.render("mensagem", { Destinatarios: docs });
    }
    });
}

async function mostraravaliacao(req,res) {
  const admin = req.user ? await Usuario.findById(req.user.id) : undefined;
     const avaliador = await Avaliador.find({}).exec(function (err, docs) {
    if (admin) {
    res.render("avaliacoes", { Avaliacoes: docs, Admin: admin });
    } else {
    res.render("avaliacoes", { Avaliacoes: docs });
    }
    });
}

/*async function abrirlistar(req,res) {
    const usuario = await Usuario.find({}).exec(function(err,docs){
    res.render('listar', {Usuarios:docs})
    }) 
   
}*/



/* CERTO async function abrirlistar(req, res) {
  const usuarios = await Usuario.find({}).exec();
  const conteudosPorUsuario = [];

  for (let usuario of usuarios) {
    const conteudos = usuario.disciplina.material;
    conteudosPorUsuario.push(conteudos.length);
  }

  if (req.user) {
    res.render("listar", { Usuarios: usuarios, Admin: req.user, quantidadeConteudos: conteudosPorUsuario });
  } else {
    res.render("listar", { Usuarios: usuarios, quantidadeConteudos: conteudosPorUsuario });
  }
}*/

async function abrirlistar(req, res) {
  const nomeUsuario = req.query.nome1;
  const admin = req.user ? await Usuario.findById(req.user.id) : undefined;
  const query = { nome1: nomeUsuario };
  const usuarios = await Usuario.find(query).exec();
  const conteudosPorUsuario = [];

  for (let usuario of usuarios) {
    const conteudos = usuario.disciplina.material;
    conteudosPorUsuario.push(conteudos.length);
  }

  if (admin) {
    res.render("listar", { Usuarios: usuarios, Admin: admin, quantidadeConteudos: conteudosPorUsuario });
  } else {
    res.render("listar", { Usuarios: usuarios, quantidadeConteudos: conteudosPorUsuario });
  }
}




async function abreDisciplina(req, res) {
  const admin = req.user ? await Usuario.findById(req.user.id) : undefined;
    const disciplinas = await Disciplina.find({ conteudo: req.params.disciplina });
    
    // Adiciona o caminho relativo do arquivo de material didático a cada disciplina
    disciplinas.forEach(disciplina => {
      disciplina.caminhoMaterial = `/assets/fotos/${disciplina.material}`;
    });
  
    // Renderiza a página "visualizaconteudo", passando as disciplinas e outras informações
    res.render('visualizaconteudo', {
      Disciplinas: disciplinas,
      nome: req.params.disciplina,
      Admin: admin
    });
  }

async function abreregistrar(req,res) {
    res.render('registrar')
  
}


async function editar(req,res) {
    const idbusca = req.params.id 
    const teste =  await Usuario.findOne({_id : idbusca})
    console.log(teste.foto)
    const admin = req.user ? await Usuario.findById(req.user.id) : undefined;
    
         Usuario.findById(req.params.id, function(err,docs){
        if(err) {
            console.log(err)
        } else {
            console.log(docs)
            res.render('editar',{Usuario: docs, Admin:admin})
        }
    
  })

}

/*async function perfilunico(req,res) {
    const idbusca = req.params.id 
    const teste =  await Usuario.findOne({_id : idbusca})
    console.log(teste.nome1)

         Usuario.findById(req.params.id, function(err,docs){
        if(err) {
            console.log(err)
        } else {
            console.log(docs)
            res.render('perfilunico',{Usuario: docs})
        }
    
  })

}*/

/*async function perfilunico(req, res) {
    try{
    const usuario = await Usuario.findById(req.params.id)
     res.render('perfilunico', { usuario, Admin: req.user });
     
  } catch (err) {
    console.log(err);
    res.status(500).send('Ocorreu um erro ao buscar o perfil.');
  }
}*/

async function perfilunico(req, res) {
  try {
    const usuario = await Usuario.findById(req.params.id);
    const admin = req.user ? await Usuario.findById(req.user.id) : undefined;
    const usu_disciplinas = await Disciplina.find({
      usuario: req.params.id // Busca as disciplinas adicionadas pelo usuário cujo perfil está sendo visualizado
    });

    const num_disciplinas = usu_disciplinas.length;

    res.render('perfilunico', {
      usuario,
      Admin: admin,
      Disciplinas: usu_disciplinas,
      num_disciplinas
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Ocorreu um erro ao buscar o perfil.');
  }
}


 async function enviaeditar(req,res) {
     Usuario.findByIdAndUpdate(req.user.id,
         {
          nome1: req.body.nome1,
          nome2: req.body.nome2,
          telephone: req.body.telephone,
          profissao: req.body.profissao,
          cidade: req.body.cidade,
          username: req.body.username,
          password: req.body.password,
          foto:req.file.filename

          }, function (err,docs){

            console.log(req.body.foto)
            res.redirect('/perfil')
          }) 
}


/*async function deletar(req,res) {
    Usuario.findByIdAndDelete(req.params.id, function(err) {
      if (err) {
        console.log(err);
        res.status(500).send('Erro ao excluir usuário');
      } else {
        req.logout(function(err) {
          if (err) {
            console.log(err);
            res.status(500).send('Erro ao fazer logout');
          } else {
            res.redirect('/');
          }
        });
      }
    });
  }*/

  async function deletar(req, res) {
    try {
    await Usuario.findByIdAndDelete(req.params.id);
    req.logout(function(err) {
      if (err) {
        console.log(err);
        res.status(500).send('Erro ao fazer logout');
      } else {
        res.redirect('/');
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Erro ao excluir usuário');
    }
    }    
  
async function adicionarconteudo(req,res) {
  const admin = req.user ? await Usuario.findById(req.user.id) : undefined;
    res.render('addconteudo', {Admin:admin})
  
}

async function enviaregistrar(req,res) {
    var usuario = new Usuario ({
        nome1: req.body.nome1,
        nome2: req.body.nome2,
        telephone: req.body.telephone,
        profissao: req.body.profissao,
        cidade: req.body.cidade,
        username: req.body.username,
        password: req.body.password,
        foto:req.file.filename
        
    })
    usuario.save(function(err){
        
        if(err){
            res.redirect('/registrar');
           
            console.log(err)

        }
        else{

            res.redirect('/');
            console.log(req.body.username)

        }

    })
}


/*async function enviaconteudo(req,res) {
    var disciplina = new Disciplina ({
        conteudo: req.body.conteudo,
        titulo: req.body.titulo,
        material: req.file.filename,
        usuario: req.user.id
    })
    disciplina.save(function(err){
        
        if(err){
            console.log(err)

        }
        else{
            res.redirect('/');
            console.log(req.body.conteudo)

        }

    })
}*/

async function enviaconteudo(req,res) {
    var disciplina = new Disciplina({
      conteudo: req.body.conteudo,
      titulo: req.body.titulo,
      material: req.file.filename,
      usuario: req.user.id // Adiciona o ID do usuário que fez o upload do material
      

    });
  
    disciplina.save(function(err){
      if(err){
        console.log(err);
      }
      else{
        res.redirect('/perfil');
       
      }
    });
  }

  //(`/visualiza/${disciplina.id}`)
  

async function enviadoacao(req,res) {
    var destinatario = new Destinatario ({
        nome: req.body.nome,
        email: req.body.email,
        pix: req.body.pix,
        mensagem: req.body.mensagem
        
    })
    destinatario.save(function(err){
        
        if(err){
            console.log(err)

        }
        else{
          
            res.redirect('mensagem');
            console.log(destinatario.nome)

        }


    }) 

   
}

async function avaliar(req,res) {
    var avaliador = new Avaliador ({
        apelido: req.body.apelido,
        email: req.body.email,
        avaliacao: req.body.avaliacao
        
    })
    avaliador.save(function(err){
        
        if(err){
            console.log(err)

        }
        else{
          
            res.redirect('avaliacoes');
            console.log(avaliador.nome)

        }


    }) 

   
}


async function logar(req, res){
    
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
    logar,
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
}
