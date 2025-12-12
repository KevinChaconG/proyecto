const express = require('express');
const router = express.Router();
const docenteController = require('../controllers/docenteController');

// Obtener cursos asignados a un docente (por id docente)
router.get('/cursos/:idDocente', docenteController.getCoursesByDocente);

// Obtener estudiantes matriculados de un curso (por id curso)
router.get('/curso/:idCurso/estudiantes', docenteController.getStudentsByCourse);

// Obtener actividades de un curso (por id curso)
router.get('/curso/:idCurso/actividades', docenteController.getActivitiesByCourse);

module.exports = router;
