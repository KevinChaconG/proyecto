// backend/Rutas/ActividadRutas.js

const express = require('express');
const Actividad = require('../Modelos/Actividad');
const Asignatura = require('../Modelos/Asignatura');
const Usuario = require('../Modelos/Usuario');

const router = express.Router();

// ============================================
// RUTAS PARA GESTIÓN DE ACTIVIDADES (TAREAS/EXÁMENES)
// ============================================

// Listar TODAS las actividades de una asignatura específica
router.get('/asignatura/:id_asignatura/actividades', async (req, resp) => {
    try {
        const { id_asignatura } = req.params;

        // Verificamos que la asignatura exista
        const asignatura = await Asignatura.findByPk(id_asignatura);
        if (!asignatura) {
            return resp.status(404).json({ mensaje: 'Asignatura no encontrada' });
        }

        // Obtenemos todas las actividades de esa asignatura
        const actividades = await Actividad.findAll({
            where: { id_asignatura },
            attributes: ['id_actividad', 'titulo', 'descripcion', 'tipo', 'fecha_publicacion', 'fecha_entrega', 'estado', 'valor_maximo'],
            order: [['fecha_publicacion', 'DESC']]
        });

        resp.json({
            mensaje: 'Lista de actividades',
            asignatura: {
                id_asignatura: asignatura.id_asignatura,
                nombre: asignatura.nombre_asignatura
            },
            total: actividades.length,
            actividades: actividades
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({ mensaje: 'Error al obtener actividades' });
    }
});

// Obtener UNA actividad específica por su ID
router.get('/actividades/:id', async (req, resp) => {
    try {
        const { id } = req.params;

        const actividad = await Actividad.findByPk(id, {
            include: [{
                model: Asignatura,
                as: 'asignatura',
                attributes: ['id_asignatura', 'nombre_asignatura', 'codigo_curso']
            }]
        });

        if (!actividad) {
            return resp.status(404).json({ mensaje: 'Actividad no encontrada' });
        }

        resp.json({
            mensaje: 'Actividad encontrada',
            actividad: actividad
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({ mensaje: 'Error al obtener actividad' });
    }
});

// CREA una nueva actividad (tarea, examen o proyecto)
router.post('/actividades', async (req, resp) => {
    try {
        const { titulo, descripcion, tipo, fecha_entrega, id_asignatura, estado, valor_maximo } = req.body;

        // Validamos datos obligatorios
        if (!titulo || !id_asignatura) {
            return resp.status(400).json({ mensaje: 'El título y la asignatura son obligatorios' });
        }

        // Verificamos que la asignatura exista
        const asignatura = await Asignatura.findByPk(id_asignatura);
        if (!asignatura) {
            return resp.status(404).json({ mensaje: 'La asignatura especificada no existe' });
        }

        // Creamos la nueva actividad
        const nuevaActividad = await Actividad.create({
            titulo,
            descripcion,
            tipo: tipo || 'tarea',
            fecha_publicacion: new Date(),
            fecha_entrega: fecha_entrega || null,
            id_asignatura,
            estado: estado || 'activa',
            valor_maximo: valor_maximo || 100.00
        });

        // Obtenemos la actividad completa con datos de la asignatura
        const actividadCompleta = await Actividad.findByPk(nuevaActividad.id_actividad, {
            include: [{
                model: Asignatura,
                as: 'asignatura',
                attributes: ['id_asignatura', 'nombre_asignatura', 'codigo_curso']
            }]
        });

        resp.status(201).json({
            mensaje: 'Actividad creada exitosamente',
            actividad: actividadCompleta
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({ mensaje: 'Error al crear actividad' });
    }
});

// ACTUALIZA una actividad existente
router.put('/actividades/:id', async (req, resp) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, tipo, fecha_entrega, estado, valor_maximo } = req.body;

        // Buscamos la actividad por ID
        const actividad = await Actividad.findByPk(id);

        if (!actividad) {
            return resp.status(404).json({ mensaje: 'Actividad no encontrada' });
        }

        // Preparamos los datos a actualizar
        const datosActualizar = {};
        if (titulo) datosActualizar.titulo = titulo;
        if (descripcion !== undefined) datosActualizar.descripcion = descripcion;
        if (tipo) datosActualizar.tipo = tipo;
        if (fecha_entrega !== undefined) datosActualizar.fecha_entrega = fecha_entrega;
        if (estado) datosActualizar.estado = estado;
        if (valor_maximo !== undefined) datosActualizar.valor_maximo = valor_maximo;

        // Actualizamos la actividad
        await actividad.update(datosActualizar);

        // Obtenemos la actividad actualizada (incluyendo asignatura)
        const actividadActualizada = await Actividad.findByPk(id, {
            include: [{
                model: Asignatura,
                as: 'asignatura',
                attributes: ['id_asignatura', 'nombre_asignatura', 'codigo_curso']
            }]
        });

        resp.json({
            mensaje: 'Actividad actualizada exitosamente',
            actividad: actividadActualizada
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({ mensaje: 'Error al actualizar actividad' });
    }
});

// ELIMINA una actividad
router.delete('/actividades/:id', async (req, resp) => {
    try {
        const { id } = req.params;

        // Buscamos la actividad por ID
        const actividad = await Actividad.findByPk(id);

        if (!actividad) {
            return resp.status(404).json({ mensaje: 'Actividad no encontrada' });
        }

        // Guardamos los datos antes de eliminar
        const datosEliminados = {
            id_actividad: actividad.id_actividad,
            titulo: actividad.titulo,
            tipo: actividad.tipo
        };

        // Eliminamos la actividad
        await actividad.destroy();

        resp.json({
            mensaje: 'Actividad eliminada exitosamente',
            actividad_eliminada: datosEliminados
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({ mensaje: 'Error al eliminar actividad' });
    }
});

module.exports = router;
