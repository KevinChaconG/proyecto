const express = require('express');
const Entrega = require('../Modelos/Entrega');
const Actividad = require('../Modelos/Actividad');
const Usuario = require('../Modelos/Usuario');
const Asignatura = require('../Modelos/Asignatura');

const router = express.Router();

// ============================================
// RUTAS PARA GESTIÓN DE ENTREGAS Y CALIFICACIONES
// ============================================

// Compañeros, esta ruta lista todas las entregas de una actividad específica (para docente)
router.get('/actividad/:id_actividad/entregas', async (req, resp) => {
    try {
        const { id_actividad } = req. params;

        // Compañeros, verificamos que la actividad exista
        const actividad = await Actividad.findByPk(id_actividad, {
            include: [{
                model: Asignatura,
                as: 'asignatura',
                attributes: ['nombre_asignatura']
            }]
        });

        if (!actividad) {
            return resp.status(404). json({ mensaje: 'Actividad no encontrada' });
        }

        // Compañeros, obtenemos todas las entregas de esa actividad
        const entregas = await Entrega.findAll({
            where: { id_actividad },
            include: [{
                model: Usuario,
                as: 'estudiante',
                attributes: ['id_usuario', 'nombre', 'apellido', 'email']
            }],
            order: [['fecha_entrega', 'DESC']]
        });

        resp.json({
            mensaje: 'Lista de entregas',
            actividad: {
                id_actividad: actividad.id_actividad,
                titulo: actividad.titulo,
                asignatura: actividad.asignatura.nombre_asignatura
            },
            total: entregas.length,
            entregas: entregas
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({ mensaje: 'Error al obtener entregas' });
    }
});

// Compañeros, esta ruta lista todas las entregas de un estudiante específico
router.get('/estudiante/:id_estudiante/entregas', async (req, resp) => {
    try {
        const { id_estudiante } = req.params;

        // Compañeros, verificamos que el estudiante exista
        const estudiante = await Usuario.findByPk(id_estudiante);
        if (!estudiante) {
            return resp.status(404).json({ mensaje: 'Estudiante no encontrado' });
        }

        // Compañeros, obtenemos todas las entregas del estudiante
        const entregas = await Entrega.findAll({
            where: { id_estudiante },
            include: [{
                model: Actividad,
                as: 'actividad',
                attributes: ['id_actividad', 'titulo', 'tipo', 'valor_maximo'],
                include: [{
                    model: Asignatura,
                    as: 'asignatura',
                    attributes: ['nombre_asignatura', 'codigo_curso']
                }]
            }],
            order: [['fecha_entrega', 'DESC']]
        });

        resp. json({
            mensaje: 'Lista de entregas del estudiante',
            estudiante: {
                id_usuario: estudiante.id_usuario,
                nombre: estudiante.nombre,
                apellido: estudiante.apellido
            },
            total: entregas.length,
            entregas: entregas
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({ mensaje: 'Error al obtener entregas' });
    }
});

// Compañeros, esta ruta obtiene UNA entrega específica por su ID
router.get('/entregas/:id', async (req, resp) => {
    try {
        const { id } = req.params;

        const entrega = await Entrega. findByPk(id, {
            include: [
                {
                    model: Actividad,
                    as: 'actividad',
                    attributes: ['id_actividad', 'titulo', 'tipo', 'valor_maximo'],
                    include: [{
                        model: Asignatura,
                        as: 'asignatura',
                        attributes: ['nombre_asignatura']
                    }]
                },
                {
                    model: Usuario,
                    as: 'estudiante',
                    attributes: ['id_usuario', 'nombre', 'apellido', 'email']
                }
            ]
        });

        if (! entrega) {
            return resp.status(404).json({ mensaje: 'Entrega no encontrada' });
        }

        resp.json({
            mensaje: 'Entrega encontrada',
            entrega: entrega
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({ mensaje: 'Error al obtener entrega' });
    }
});

// Compañeros, esta ruta CREA una nueva entrega (estudiante entrega tarea)
router.post('/entregas', async (req, resp) => {
    try {
        const { id_actividad, id_estudiante, comentario_estudiante } = req.body;

        // Compañeros, validamos que vengan los datos obligatorios
        if (!id_actividad || !id_estudiante) {
            return resp.status(400).json({ mensaje: 'La actividad y el estudiante son obligatorios' });
        }

        // Compañeros, verificamos que la actividad exista
        const actividad = await Actividad.findByPk(id_actividad);
        if (!actividad) {
            return resp.status(404).json({ mensaje: 'La actividad no existe' });
        }

        // Compañeros, verificamos que el usuario sea estudiante
        const estudiante = await Usuario.findByPk(id_estudiante);
        if (! estudiante) {
            return resp.status(404).json({ mensaje: 'El estudiante no existe' });
        }
        if (estudiante.id_rol !== 3) {
            return resp.status(400).json({ mensaje: 'El usuario no es un estudiante' });
        }

        // Compañeros, verificamos que no haya entregado ya esta actividad
        const entregaExistente = await Entrega.findOne({
            where: { id_actividad, id_estudiante }
        });
        if (entregaExistente) {
            return resp.status(409).json({ mensaje: 'Ya existe una entrega para esta actividad' });
        }

        // Compañeros, creamos la nueva entrega
        const nuevaEntrega = await Entrega.create({
            id_actividad,
            id_estudiante,
            fecha_entrega: new Date(),
            comentario_estudiante: comentario_estudiante || null,
            calificacion: null,
            comentario_docente: null,
            fecha_calificacion: null,
            estado: 'entregada'
        });

        // Compañeros, obtenemos la entrega completa con datos
        const entregaCompleta = await Entrega.findByPk(nuevaEntrega.id_entrega, {
            include: [
                {
                    model: Actividad,
                    as: 'actividad',
                    attributes: ['id_actividad', 'titulo', 'tipo']
                },
                {
                    model: Usuario,
                    as: 'estudiante',
                    attributes: ['id_usuario', 'nombre', 'apellido', 'email']
                }
            ]
        });

        resp.status(201).json({
            mensaje: 'Entrega realizada exitosamente',
            entrega: entregaCompleta
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({ mensaje: 'Error al crear entrega' });
    }
});

// Compañeros, esta ruta CALIFICA una entrega (docente califica)
router.put('/entregas/:id/calificar', async (req, resp) => {
    try {
        const { id } = req.params;
        const { calificacion, comentario_docente } = req.body;

        // Compañeros, validamos que venga la calificación
        if (calificacion === undefined || calificacion === null) {
            return resp.status(400). json({ mensaje: 'La calificación es obligatoria' });
        }

        // Compañeros, buscamos la entrega
        const entrega = await Entrega. findByPk(id, {
            include: [{
                model: Actividad,
                as: 'actividad',
                attributes: ['valor_maximo']
            }]
        });

        if (!entrega) {
            return resp. status(404).json({ mensaje: 'Entrega no encontrada' });
        }

        // Compañeros, validamos que la calificación no supere el valor máximo
        if (calificacion > entrega. actividad.valor_maximo) {
            return resp.status(400).json({ 
                mensaje: `La calificación no puede superar ${entrega.actividad.valor_maximo}` 
            });
        }

        if (calificacion < 0) {
            return resp.status(400).json({ mensaje: 'La calificación no puede ser negativa' });
        }

        // Compañeros, actualizamos la entrega con la calificación
        await entrega.update({
            calificacion: calificacion,
            comentario_docente: comentario_docente || null,
            fecha_calificacion: new Date(),
            estado: 'calificada'
        });

        // Compañeros, obtenemos la entrega actualizada
        const entregaActualizada = await Entrega. findByPk(id, {
            include: [
                {
                    model: Actividad,
                    as: 'actividad',
                    attributes: ['id_actividad', 'titulo', 'valor_maximo']
                },
                {
                    model: Usuario,
                    as: 'estudiante',
                    attributes: ['id_usuario', 'nombre', 'apellido', 'email']
                }
            ]
        });

        resp. json({
            mensaje: 'Entrega calificada exitosamente',
            entrega: entregaActualizada
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({ mensaje: 'Error al calificar entrega' });
    }
});

// Compañeros, esta ruta ACTUALIZA el comentario de una entrega (estudiante puede editar)
router.put('/entregas/:id', async (req, resp) => {
    try {
        const { id } = req.params;
        const { comentario_estudiante } = req.body;

        // Compañeros, buscamos la entrega
        const entrega = await Entrega. findByPk(id);

        if (!entrega) {
            return resp.status(404). json({ mensaje: 'Entrega no encontrada' });
        }

        // Compañeros, solo permitimos editar si no ha sido calificada
        if (entrega.estado === 'calificada') {
            return resp.status(400). json({ mensaje: 'No se puede editar una entrega ya calificada' });
        }

        // Compañeros, actualizamos el comentario
        await entrega.update({
            comentario_estudiante: comentario_estudiante
        });

        resp.json({
            mensaje: 'Comentario actualizado exitosamente',
            entrega: entrega
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({ mensaje: 'Error al actualizar entrega' });
    }
});

// Compañeros, esta ruta ELIMINA una entrega (solo admin o estudiante antes de calificar)
router.delete('/entregas/:id', async (req, resp) => {
    try {
        const { id } = req.params;

        // Compañeros, buscamos la entrega
        const entrega = await Entrega.findByPk(id, {
            include: [
                {
                    model: Actividad,
                    as: 'actividad',
                    attributes: ['titulo']
                },
                {
                    model: Usuario,
                    as: 'estudiante',
                    attributes: ['nombre', 'apellido']
                }
            ]
        });

        if (!entrega) {
            return resp.status(404).json({ mensaje: 'Entrega no encontrada' });
        }

        // Compañeros, guardamos los datos antes de eliminar
        const datosEliminados = {
            id_entrega: entrega.id_entrega,
            estudiante: `${entrega.estudiante.nombre} ${entrega.estudiante. apellido}`,
            actividad: entrega.actividad.titulo,
            estado: entrega.estado
        };

        // Compañeros, eliminamos la entrega
        await entrega.destroy();

        resp.json({
            mensaje: 'Entrega eliminada exitosamente',
            entrega_eliminada: datosEliminados
        });

    } catch (error) {
        console. log(error);
        resp. status(500).json({ mensaje: 'Error al eliminar entrega' });
    }
});

module.exports = router;