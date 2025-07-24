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

// Ruta para subir archivos
app.post('/upload', (req, res) => {
  const { filename, content } = req.body;

  if (!filename || !content) {
    return res.status(400).json({ message: 'Falta filename o content' });
  }

  const safeName = filename.replace(/[^a-z0-9_\-\.]/gi, '_');
  const filePath = path.join(DOCS_DIR, safeName);

  try {
    fs.writeFileSync(filePath, content, 'utf8');
    res.status(200).json({ message: `Archivo ${safeName} guardado.` });
  } catch (err) {
    console.error('Error al guardar archivo:', err);
    res.status(500).json({ message: 'Error al guardar archivo' });
  }
});

// Ruta para listar archivos disponibles
app.get('/files', (req, res) => {
  fs.readdir(DOCS_DIR, (err, files) => {
    if (err) {
      console.error('Error leyendo documentos:', err);
      return res.status(500).json({ message: 'Error al listar documentos' });
    }
    res.status(200).json({ archivos: files });
  });
});

// Ruta para leer el contenido de un archivo
app.get('/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(DOCS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Archivo no encontrado' });
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.type('text/markdown').send(content);
  } catch (err) {
    console.error('Error leyendo archivo:', err);
    res.status(500).json({ message: 'Error al leer archivo' });
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});
