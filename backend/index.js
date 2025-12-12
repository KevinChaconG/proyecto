// backend/index.js es el punto de entrada principal de la aplicación backend
// Comapeños aqui donde definimos la Configura el servidor Express, middleware, rutas y la conexión a la base de datos

const express = require('express');
const cors = require('cors');
const sequelize = require('./db/Conexion');

// require modelos (asegúrate de que estos archivos existen)
require('./Modelos/Usuario');

const app = express();

// CORS: permitir tu frontend durante desarrollo
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Request logger para depuración
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Rutas de usuario
const usuarioRutas = require('./Rutas/UsuarioRutas');
app.use('/usuario', usuarioRutas);

// Rutas de asignaturas
const asignaturaRutas = require('./Rutas/AsignaturaRutas');
app.use('/asignatura', asignaturaRutas);

// Rutas de actividades
const actividadRutas = require('./Rutas/ActividadRutas');
app.use('/actividad', actividadRutas);

// Rutas de matrículas (ajusta la ruta si tu carpeta se llama "routes" en vez de "Rutas")
let matriculaRoutes;
try {
  matriculaRoutes = require('./Rutas/MatriculaRutas');
  app.use('/matricula', matriculaRoutes);
} catch (err) {
  try {
    matriculaRoutes = require('./routes/MatriculaRoutes');
    app.use('/matricula', matriculaRoutes);
  } catch (err2) {
    console.warn('No se encontró archivo de rutas de matricula en ./Rutas ni ./routes (es opcional):', err2.message);
  }
}

// Rutas de entregas
const entregaRutas = require('./Rutas/EntregaRutas');
app.use('/entrega', entregaRutas);

// Rutas de docentes
const docenteRoutes = require('./Rutas/DocenteRutas');
app.use('/docente', docenteRoutes);

// Health check simple
app.get('/_health', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'dev' }));

// Sincronizar modelos y levantar servidor
sequelize.sync()
  .then(() => {
    console.log('Modelos sincronizados con la base de datos.');
    const port = process.env.PORT || 5050;
    app.listen(port, () => {
      console.log(`Aplicación ejecutando correctamente en el puerto ${port}`);
    });
  })
  .catch(error => {
    console.error('Error al conectar a la base de datos...', error);
    process.exit(1);
  });

// captura errores no manejados (logs amigables)
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // opcional: process.exit(1);
});