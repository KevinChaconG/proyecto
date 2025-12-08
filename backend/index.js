// backend/index.js

const express = require('express');
const cors = require('cors');
const sequelize = require('./db/Conexion');

require('./Modelos/Usuario');

const app = express();
app.use(cors());
app.use(express.json());

// Rutas de usuario
const usuarioRutas = require('./Rutas/UsuarioRutas');
app.use('/usuario', usuarioRutas);

// Rutas de asignaturas
const asignaturaRutas = require('./Rutas/AsignaturaRutas');
app.use('/asignatura', asignaturaRutas);

// Rutas de actividades
const actividadRutas = require('./Rutas/ActividadRutas');
app.use('/actividad', actividadRutas);

// Rutas de matrículas (usando config/db.js)
const matriculaRoutes = require('./routes/matriculaRoutes');
app.use('/matricula', matriculaRoutes);

// Rutas de entregas
const entregaRutas = require('./Rutas/EntregaRutas');
app.use('/entrega', entregaRutas);

sequelize.sync()
  .then(() => {
    console.log('Modelos sincronizados con la base de datos.. .');
    app.listen(5050, () => {
      console.log('Aplicacion ejecutando correctamente en el puerto 5050');
    });
  })
  .catch(error => {
    console.log('Error al conectar a la base de datos...', error);
  });