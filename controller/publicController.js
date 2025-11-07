async function abreperfil(req, res) {

  // 🔐 PROTEÇÃO — Bloqueia acesso sem login
  if (!req.user) {
    return res.redirect('/login');
  }

  try {
    const usuario = await Usuario.findById(req.user.id);

    // Caso o ID exista na sessão mas não no banco
    if (!usuario) {
      req.logout(() => {});
      return res.redirect('/login');
    }

    const usu_disciplinas = await Disciplina.find({
      usuario: req.user.id
    });

    res.render('perfil', {
      Admin: usuario,
      Disciplinas: usu_disciplinas
    });

  } catch (err) {
    console.error("Erro ao abrir perfil:", err);
    return res.redirect('/login');
  }
}
