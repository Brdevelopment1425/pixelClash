const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// index.html için kök dizinden gönder
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Görseller ve diğer statik dosyalar
app.get('/:filename', (req, res) => {
  const filePath = path.join(__dirname, req.params.filename);
  res.sendFile(filePath);
});

app.listen(PORT, () => {
  console.log(`✅ Sunucu çalışıyor: http://localhost:${PORT}`);
});
