const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Converte um arquivo PPT/PPTX em PDF.
 * @param {string} caminhoPPT - Caminho completo do arquivo PPT/PPTX
 * @returns {Promise<Buffer>} - Buffer do PDF gerado
 */
async function converterParaPDF(caminhoPPT) {
  return new Promise((resolve, reject) => {
    // Define o caminho do PDF final na mesma pasta do PPT
    const nomePDF = path.basename(caminhoPPT).replace(/\.(ppt|pptx)$/i, '.pdf');
    const caminhoPDF = path.join(path.dirname(caminhoPPT), nomePDF);

    // Se já existe PDF, retorna o buffer direto
    if (fs.existsSync(caminhoPDF)) {
      return resolve(fs.readFileSync(caminhoPDF));
    }

    // Comando LibreOffice para conversão
    const cmd = `soffice --headless --convert-to pdf --outdir "${path.dirname(caminhoPDF)}" "${caminhoPPT}"`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('Erro na conversão:', stderr);
        return reject(new Error('Falha ao converter PPT para PDF'));
      }

      // Aguarda o PDF ser criado e lê o buffer
      if (!fs.existsSync(caminhoPDF)) {
        return reject(new Error('PDF não foi gerado'));
      }

      const bufferPDF = fs.readFileSync(caminhoPDF);
      resolve(bufferPDF);
    });
  });
}

module.exports = { converterParaPDF };
