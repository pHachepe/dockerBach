const express = require('express');
const app = express();
const path = require('path');

const PORT = 3000;

// Configura el directorio de archivos estáticos
app.use(express.static(path.join(__dirname, '')));

// Ruta para el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
