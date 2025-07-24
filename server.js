const express = require('express');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
app.use(express.json({ limit: '5mb' }));

const DOCS_DIR = path.join(__dirname, 'documents');

// Crea la carpeta si no existe
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR);
}

// Función para subir archivo a GitHub
async function uploadToGitHub(filename, content) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = 'kukinojose';
  const REPO_NAME = 'upload-api';
  const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/documents/${filename}`;

  const encodedContent = Buffer.from(content).toString('base64');

  const payload = {
    message: `Añadir archivo ${filename}`,
    content: encodedContent
  };

  const res = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Error al subir a GitHub: ${error}`);
  }

  return await res.json();
}

// Ruta para recibir archivos
app.post('/upload', async (req, res) => {
  const { filename, content } = req.body;

  if (!filename || !content) {
    return res.status(400).json({ message: 'Falta filename o content' });
  }

  const safeName = filename.replace(/[^a-z0-9_\-\.]/gi, '_');
  const filePath = path.join(DOCS_DIR, safeName);

  try {
    fs.writeFileSync(filePath, content, 'utf8');

    // Subida automática a GitHub
    await uploadToGitHub(safeName, content);

    res.status(200).json({ message: `Archivo ${safeName} guardado y subido a GitHub ✅` });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ message: 'Error al guardar o subir el archivo' });
  }
});

// Render healthcheck
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente ✅');
});

// Puerto dinámico para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});
