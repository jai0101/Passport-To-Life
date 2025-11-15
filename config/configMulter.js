const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 🟦 Garante que as pastas existem
const fotosPath = path.join(__dirname, "../public/assets/fotos");
const materiaisPath = path.join(__dirname, "../public/assets/materiais");

if (!fs.existsSync(fotosPath)) fs.mkdirSync(fotosPath, { recursive: true });
if (!fs.existsSync(materiaisPath)) fs.mkdirSync(materiaisPath, { recursive: true });

// -------------------------------------------
// 📌 STORAGE PARA FOTOS (PERFIL)
// -------------------------------------------
const storageFotos = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, fotosPath);
    },
    filename: (req, file, cb) => {
        const nome = Date.now() + "-" + file.originalname;
        cb(null, nome);
    }
});

// -------------------------------------------
// 📌 STORAGE PARA MATERIAIS
// -------------------------------------------
const storageMateriais = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, materiaisPath);
    },
    filename: (req, file, cb) => {
        const nome = Date.now() + path.extname(file.originalname);
        cb(null, nome);
    }
});

// -------------------------------------------
// ❌ BLOQUEAR ARQUIVOS HEIC
// -------------------------------------------
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".heic") {
        return cb(new Error("O formato HEIC não é compatível. Converta a imagem antes."), false);
    }
    cb(null, true);
};

// -------------------------------------------
// EXPORTA DOIS UPLOADS
// -------------------------------------------
module.exports = {
    uploadFoto: multer({ storage: storageFotos, fileFilter }),
    uploadMaterial: multer({ storage: storageMateriais, fileFilter })
};
