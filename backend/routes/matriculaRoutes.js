// backend/routes/matriculaRoutes.js

const express = require('express');
const router = express.Router();
const matriculaController = require('../controllers/matriculaController');

// Rutas de matrículas
router.get('/matriculas', matriculaController.obtenerMatriculas);
router. get('/asignatura/:id_asignatura/estudiantes', matriculaController. obtenerEstudiantesPorCurso);
router.post('/matricula', matriculaController.crearMatricula);
router.put('/matricula/:id_matricula', matriculaController.actualizarMatricula);
router. delete('/matricula/:id_matricula', matriculaController.eliminarMatricula);

module. exports = router;