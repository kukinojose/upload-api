const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '5mb' }));

const DOCS_DIR = path.join(__dirname, 'documents');

// Asegúrate de que exista la carpeta
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR);
}

// Ruta para recibir archivos
app.post('/upload', (req, res) => {
  const { filename, content } = req.body;

  if (!filename || !content) {
    return res.status(400).json({ message: 'Falta filename o content' });
  }

  const safeName = filename.replace(/[^a-z0-9_\-\.]/gi, '_');
  const filePath = path.join(DOCS_DIR, safeName);

  fs.writeFileSync(filePath, content, 'utf8');
  res.status(200).json({ message: `Archivo ${safeName} guardado.` });
});

// Render healthcheck
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});
