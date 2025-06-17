const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

mongoose.connect('mongodb://localhost:27017/mi_basededatos', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error de conexión', err));

const Usuario = mongoose.model('Usuario', new mongoose.Schema({
  nombre: { type: String, unique: true }, // clave única para actualizar/eliminar
  email: String,
  edad: Number,
  grado: String,
  promedio: Number,
  carrera: String,
  estatus: String
}));

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// GET: Mostrar todos los usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// POST: agregar nuevo
app.post('/api/usuarios', async (req, res) => {
  try {
    const nuevo = new Usuario(req.body);
    await nuevo.save();
    res.json({ message: '✅ Usuario agregado correctamente' });
  } catch (error) {
    res.status(400).json({ message: '❌ Error al agregar', error: error.message });
  }
});

// PUT: actualizar por nombre
app.put('/api/usuarios', async (req, res) => {
  const datos = req.body;
  try {
    const actualizado = await Usuario.findOneAndUpdate(
      { nombre: datos.nombre },
      datos,
      { upsert: true, new: true }
    );
    res.json({ message: 'Usuario creado o actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al guardar o actualizar el usuario' });
  }
});

// DELETE: Eliminar usuario por nombre
app.delete('/api/usuarios/:nombre', async (req, res) => {
  try {
    const result = await Usuario.findOneAndDelete({ nombre: req.params.nombre });
    if (result) {
      res.json({ message: 'Usuario eliminado correctamente' });
    } else {
      res.json({ message: 'Usuario no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el usuario' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});

app.use(express.static(path.join(__dirname, 'public')));
