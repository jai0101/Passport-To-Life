// testeArquivo.js
const fs = require('fs');
const path = require('path');

const nomeArquivo = '1763175715853.ppt'; // seu arquivo
const caminho = path.resolve(__dirname, './public/assets/materiais', nomeArquivo);

if (fs.existsSync(caminho)) {
    console.log('✅ Arquivo existe:', caminho);
} else {
    console.log('❌ Arquivo NÃO existe:', caminho);
}
