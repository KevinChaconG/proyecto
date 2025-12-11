const express = require('express');
const Matricula = require('../Modelos/Matricula');
const Asignatura = require('../Modelos/Asignatura');
const Usuario = require('../Modelos/Usuario');

const router = express.Router();

// ============================================
// RUTAS PARA GESTIÓN DE MATRÍCULAS
// ============================================

// Compañeros, esta ruta lista TODAS las matrículas (para el admin panel)
router.get('/matriculas', async (req, resp) => {
    try {
        const matriculas = await Matricula.findAll({
            include: [
                {
                    model: Asignatura,
                    as: 'asignatura',
                    attributes: ['id_asignatura', 'nombre_asignatura', 'codigo_curso']
                },
                {
                    model: Usuario,
                    as: 'estudiante',
                    attributes: ['id_usuario', 'nombre', 'apellido', 'email']
                }
            ],
            order: [['fecha_matricula', 'DESC']]
        });

        resp.json({
            mensaje: 'Lista de todas las matrículas',
            total: matriculas.length,
            matriculas: matriculas
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({ mensaje: 'Error al obtener matrículas' });
    }
});

// Compañeros, esta ruta lista los cursos en los que está matriculado un estudiante
router.get('/estudiante/:id_estudiante/matriculas', async (req, resp) => {
    try {
        const { id_estudiante } = req.params;

        // Compañeros, verificamos que el estudiante exista
        const estudiante = await Usuario.findByPk(id_estudiante);
        if (!estudiante) {
            return resp.status(404).json({ mensaje: 'Estudiante no encontrado' });
        }

        // Compañeros, obtenemos todas las matrículas del estudiante
        const matriculas = await Matricula.findAll({
            where: { id_estudiante },
            include: [{
                model: Asignatura,
                as: 'asignatura',
                attributes: ['id_asignatura', 'nombre_asignatura', 'descripcion', 'codigo_curso'],
                include: [{
                    model: Usuario,
                    as: 'docente',
                    attributes: ['id_usuario', 'nombre', 'apellido', 'email']
                }]
            }],
            order: [['fecha_matricula', 'DESC']]
        });

        resp.json({
            mensaje: 'Lista de matrículas del estudiante',
            estudiante: {
                id_usuario: estudiante.id_usuario,
                nombre: estudiante.nombre,
                apellido: estudiante.apellido
            },
            total: matriculas.length,
            matriculas: matriculas
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({ mensaje: 'Error al obtener matrículas' });
    }
});

// Compañeros, esta ruta lista los estudiantes matriculados en una asignatura
router.get('/asignatura/:id_asignatura/estudiantes', async (req, resp) => {
    try {
        const { id_asignatura } = req.params;

        // Compañeros, verificamos que la asignatura exista
        const asignatura = await Asignatura.findByPk(id_asignatura);
        if (!asignatura) {
            return resp.status(404).json({ mensaje: 'Asignatura no encontrada' });
        }

        // Compañeros, obtenemos todos los estudiantes matriculados
        const matriculas = await Matricula.findAll({
            where: { id_asignatura },
            include: [{
                model: Usuario,
                as: 'estudiante',
                attributes: ['id_usuario', 'nombre', 'apellido', 'email']
            }],
            order: [['fecha_matricula', 'ASC']]
        });

        resp.json({
            mensaje: 'Lista de estudiantes matriculados',
            asignatura: {
                id_asignatura: asignatura.id_asignatura,
                nombre: asignatura.nombre_asignatura,
                codigo: asignatura.codigo_curso
            },
            total: matriculas.length,
            estudiantes: matriculas
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({ mensaje: 'Error al obtener estudiantes' });
    }
});

// Compañeros, esta ruta CREA una nueva matrícula (estudiante se inscribe a un curso)
router.post('/matriculas', async (req, resp) => {
    try {
        const { id_asignatura, id_estudiante } = req.body;

        // Compañeros, validamos que vengan los datos obligatorios
        if (!id_asignatura || !id_estudiante) {
            return resp.status(400).json({ mensaje: 'La asignatura y el estudiante son obligatorios' });
        }

        // Compañeros, verificamos que la asignatura exista
        const asignatura = await Asignatura.findByPk(id_asignatura);
        if (!asignatura) {
            return resp.status(404).json({ mensaje: 'La asignatura no existe' });
        }

        // Compañeros, verificamos que el usuario sea estudiante
        const estudiante = await Usuario.findByPk(id_estudiante);
        if (! estudiante) {
            return resp.status(404).json({ mensaje: 'El estudiante no existe' });
        }
        if (estudiante.id_rol !== 3) {
            return resp.status(400).json({ mensaje: 'El usuario no es un estudiante' });
        }

        // Compañeros, verificamos que no esté ya matriculado
        const matriculaExistente = await Matricula.findOne({
            where: { id_asignatura, id_estudiante }
        });
        if (matriculaExistente) {
            return resp.status(409).json({ mensaje: 'El estudiante ya está matriculado en esta asignatura' });
        }

        // Compañeros, creamos la nueva matrícula
        const nuevaMatricula = await Matricula.create({
            id_asignatura,
            id_estudiante,
            fecha_matricula: new Date(),
            estado: 'activa'
        });

        // Compañeros, obtenemos la matrícula completa con datos
        const matriculaCompleta = await Matricula.findByPk(nuevaMatricula.id_matricula, {
            include: [
                {
                    model: Asignatura,
                    as: 'asignatura',
                    attributes: ['id_asignatura', 'nombre_asignatura', 'codigo_curso']
                },
                {
                    model: Usuario,
                    as: 'estudiante',
                    attributes: ['id_usuario', 'nombre', 'apellido', 'email']
                }
            ]
        });

        resp.status(201).json({
            mensaje: 'Matrícula realizada exitosamente',
            matricula: matriculaCompleta
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({ mensaje: 'Error al crear matrícula' });
    }
});

// Compañeros, esta ruta ELIMINA una matrícula (solo admin)
router.delete('/matriculas/:id', async (req, resp) => {
    try {
        const { id } = req.params;

        // Compañeros, buscamos la matrícula por ID
        const matricula = await Matricula.findByPk(id, {
            include: [
                {
                    model: Asignatura,
                    as: 'asignatura',
                    attributes: ['nombre_asignatura']
                },
                {
                    model: Usuario,
                    as: 'estudiante',
                    attributes: ['nombre', 'apellido']
                }
            ]
        });

        if (!matricula) {
            return resp.status(404).json({ mensaje: 'Matrícula no encontrada' });
        }

        // Compañeros, guardamos los datos antes de eliminar
        const datosEliminados = {
            id_matricula: matricula.id_matricula,
            estudiante: `${matricula.estudiante.nombre} ${matricula.estudiante.apellido}`,
            asignatura: matricula.asignatura.nombre_asignatura
        };

        // Compañeros, eliminamos la matrícula
        await matricula.destroy();

        resp.json({
            mensaje: 'Matrícula eliminada exitosamente',
            matricula_eliminada: datosEliminados
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({ mensaje: 'Error al eliminar matrícula' });
    }
});

module.exports = router;
