const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');

router.get('/promedios-por-curso', reporteController.getGradeAverageByCourse);

module.exports = router;