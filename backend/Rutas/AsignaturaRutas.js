// backend/Rutas/AsignaturaRutas.js

const express = require('express');
const Asignatura = require('../Modelos/Asignatura');
const Usuario = require('../Modelos/Usuario');

const router = express.Router();

// ============================================
// RUTAS PARA GESTIÓN DE CURSOS/ASIGNATURAS
// ============================================

// Compañeros, esta ruta lista TODAS las asignaturas con información del docente
router.get('/asignaturas', async (req, resp) => {
    try {
        // Compañeros, obtenemos todas las asignaturas y sus docentes asignados
        const asignaturas = await Asignatura. findAll({
            attributes: ['id_asignatura', 'nombre_asignatura', 'descripcion', 'codigo_curso', 'id_docente', 'fecha_creacion', 'activo'],
            include: [{
                model: Usuario,
                as: 'docente',
                attributes: ['id_usuario', 'nombre', 'apellido', 'email'],
                required: false // Compañeros, esto permite mostrar asignaturas sin docente asignado
            }],
            order: [['id_asignatura', 'ASC']]
        });

        resp.json({
            mensaje: 'Lista de asignaturas',
            total: asignaturas.length,
            asignaturas: asignaturas
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({ mensaje: 'Error al obtener asignaturas' });
    }
});

// Compañeros, esta ruta obtiene UNA asignatura específica por su ID
router.get('/asignaturas/:id', async (req, resp) => {
    try {
        const { id } = req.params;

        const asignatura = await Asignatura.findByPk(id, {
            include: [{
                model: Usuario,
                as: 'docente',
                attributes: ['id_usuario', 'nombre', 'apellido', 'email']
            }]
        });

        if (!asignatura) {
            return resp.status(404).json({ mensaje: 'Asignatura no encontrada' });
        }

        resp.json({
            mensaje: 'Asignatura encontrada',
            asignatura: asignatura
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({ mensaje: 'Error al obtener asignatura' });
    }
});

// Compañeros, esta ruta CREA una nueva asignatura y asigna un docente
router.post('/asignaturas', async (req, resp) => {
    try {
        const { nombre_asignatura, descripcion, codigo_curso, id_docente } = req.body;

        // Compañeros, validamos que venga al menos el nombre
        if (!nombre_asignatura) {
            return resp.status(400).json({ mensaje: 'El nombre de la asignatura es obligatorio' });
        }

        // Compañeros, si viene un docente, verificamos que exista y sea rol docente
        if (id_docente) {
            const docente = await Usuario.findByPk(id_docente);
            if (!docente) {
                return resp.status(404).json({ mensaje: 'El docente especificado no existe' });
            }
            if (docente. id_rol !== 2) {
                return resp.status(400).json({ mensaje: 'El usuario especificado no es un docente' });
            }
        }

        // Compañeros, verificamos que el código de curso no esté duplicado
        if (codigo_curso) {
            const codigoExistente = await Asignatura.findOne({ where: { codigo_curso } });
            if (codigoExistente) {
                return resp.status(409).json({ mensaje: 'Este código de curso ya está en uso' });
            }
        }

        // Compañeros, creamos la nueva asignatura
        const nuevaAsignatura = await Asignatura.create({
            nombre_asignatura,
            descripcion,
            codigo_curso,
            id_docente,
            fecha_creacion: new Date(),
            activo: true
        });

        // Compañeros, obtenemos la asignatura con los datos del docente
        const asignaturaCompleta = await Asignatura. findByPk(nuevaAsignatura.id_asignatura, {
            include: [{
                model: Usuario,
                as: 'docente',
                attributes: ['id_usuario', 'nombre', 'apellido', 'email']
            }]
        });

        resp.status(201).json({
            mensaje: 'Asignatura creada exitosamente',
            asignatura: asignaturaCompleta
        });

    } catch (error) {
        console. log(error);
        resp. status(500).json({ mensaje: 'Error al crear asignatura' });
    }
});

// Compañeros, esta ruta ACTUALIZA una asignatura existente
router.put('/asignaturas/:id', async (req, resp) => {
    try {
        const { id } = req.params;
        const { nombre_asignatura, descripcion, codigo_curso, id_docente, activo } = req.body;

        // Compañeros, buscamos la asignatura por ID
        const asignatura = await Asignatura.findByPk(id);

        if (!asignatura) {
            return resp.status(404).json({ mensaje: 'Asignatura no encontrada' });
        }

        // Compañeros, si viene un nuevo docente, verificamos que exista
        if (id_docente) {
            const docente = await Usuario.findByPk(id_docente);
            if (!docente) {
                return resp.status(404).json({ mensaje: 'El docente especificado no existe' });
            }
            if (docente. id_rol !== 2) {
                return resp.status(400).json({ mensaje: 'El usuario especificado no es un docente' });
            }
        }

        // Compañeros, verificamos que el código no esté duplicado
        if (codigo_curso && codigo_curso !== asignatura.codigo_curso) {
            const codigoExistente = await Asignatura.findOne({ where: { codigo_curso } });
            if (codigoExistente) {
                return resp. status(409).json({ mensaje: 'Este código de curso ya está en uso' });
            }
        }

        // Compañeros, preparamos los datos a actualizar
        const datosActualizar = {};
        
        if (nombre_asignatura) datosActualizar.nombre_asignatura = nombre_asignatura;
        if (descripcion !== undefined) datosActualizar. descripcion = descripcion;
        if (codigo_curso) datosActualizar.codigo_curso = codigo_curso;
        if (id_docente !== undefined) datosActualizar.id_docente = id_docente;
        if (activo !== undefined) datosActualizar. activo = activo;

        // Compañeros, actualizamos la asignatura
        await asignatura.update(datosActualizar);

        // Compañeros, obtenemos la asignatura actualizada con datos del docente
        const asignaturaActualizada = await Asignatura.findByPk(id, {
            include: [{
                model: Usuario,
                as: 'docente',
                attributes: ['id_usuario', 'nombre', 'apellido', 'email']
            }]
        });

        resp.json({
            mensaje: 'Asignatura actualizada exitosamente',
            asignatura: asignaturaActualizada
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({ mensaje: 'Error al actualizar asignatura' });
    }
});

// Compañeros, esta ruta ELIMINA una asignatura
router.delete('/asignaturas/:id', async (req, resp) => {
    try {
        const { id } = req.params;

        // Compañeros, buscamos la asignatura por ID
        const asignatura = await Asignatura.findByPk(id);

        if (!asignatura) {
            return resp.status(404).json({ mensaje: 'Asignatura no encontrada' });
        }

        // Compañeros, guardamos los datos antes de eliminar
        const datosEliminados = {
            id_asignatura: asignatura.id_asignatura,
            nombre_asignatura: asignatura.nombre_asignatura,
            codigo_curso: asignatura.codigo_curso
        };

        // Compañeros, eliminamos la asignatura
        await asignatura.destroy();

        resp.json({
            mensaje: 'Asignatura eliminada exitosamente',
            asignatura_eliminada: datosEliminados
        });

    } catch (error) {
        console. log(error);
        resp. status(500).json({ mensaje: 'Error al eliminar asignatura' });
    }
});

module.exports = router;