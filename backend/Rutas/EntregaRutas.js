// backend/Rutas/EntregaRutas.js

const express = require('express');
const Entrega = require('../Modelos/Entrega');
const Actividad = require('../Modelos/Actividad');
const Usuario = require('../Modelos/Usuario');
const Asignatura = require('../Modelos/Asignatura');

const router = express.Router();

// ============================================
// RUTAS PARA GESTIÓN DE ENTREGAS Y CALIFICACIONES
// ============================================

// 1) Listar todas las entregas de una actividad (para docente)
router.get('/actividad/:id_actividad/entregas', async (req, resp) => {
  try {
    const { id_actividad } = req.params;

    // Verificamos que la actividad exista e incluimos la asignatura
    const actividad = await Actividad.findByPk(id_actividad, {
      include: [{
        model: Asignatura,
        as: 'asignatura',
        attributes: ['id_asignatura', 'nombre_asignatura']
      }]
    });

    if (!actividad) {
      return resp.status(404).json({ mensaje: 'Actividad no encontrada' });
    }

    // Obtenemos todas las entregas de esa actividad
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
        asignatura: actividad.asignatura ? actividad.asignatura.nombre_asignatura : null
      },
      total: entregas.length,
      entregas: entregas
    });

  } catch (error) {
    console.error('Error get entregas por actividad:', error);
    resp.status(500).json({ mensaje: 'Error al obtener entregas' });
  }
});

// 2) Listar todas las entregas de un estudiante (para su historial)
router.get('/estudiante/:id_estudiante/entregas', async (req, resp) => {
  try {
    const { id_estudiante } = req.params;

    // Verificamos que el estudiante exista
    const estudiante = await Usuario.findByPk(id_estudiante);
    if (!estudiante) {
      return resp.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    // Obtenemos todas las entregas del estudiante
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

    resp.json({
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
    console.error('Error get entregas por estudiante:', error);
    resp.status(500).json({ mensaje: 'Error al obtener entregas' });
  }
});

// 3) Obtener UNA entrega por su ID (detalle)
router.get('/entregas/:id', async (req, resp) => {
  try {
    const { id } = req.params;

    const entrega = await Entrega.findByPk(id, {
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

    if (!entrega) {
      return resp.status(404).json({ mensaje: 'Entrega no encontrada' });
    }

    resp.json({
      mensaje: 'Entrega encontrada',
      entrega: entrega
    });

  } catch (error) {
    console.error('Error get entrega por id:', error);
    resp.status(500).json({ mensaje: 'Error al obtener entrega' });
  }
});

// 4) Crear una nueva entrega (estudiante)
router.post('/entregas', async (req, resp) => {
  try {
    const { id_actividad, id_estudiante, comentario_estudiante, archivo_url } = req.body;

    // Validar campos obligatorios
    if (!id_actividad || !id_estudiante) {
      return resp.status(400).json({ mensaje: 'La actividad y el estudiante son obligatorios' });
    }

    // Verificar actividad y estudiante
    const actividad = await Actividad.findByPk(id_actividad);
    if (!actividad) {
      return resp.status(404).json({ mensaje: 'La actividad no existe' });
    }

    const estudiante = await Usuario.findByPk(id_estudiante);
    if (!estudiante) {
      return resp.status(404).json({ mensaje: 'El estudiante no existe' });
    }
    if (estudiante.id_rol && Number(estudiante.id_rol) !== 3) {
      return resp.status(400).json({ mensaje: 'El usuario no es un estudiante' });
    }

    // Verificar que no exista ya una entrega (si esa es la regla del sistema)
    const entregaExistente = await Entrega.findOne({
      where: { id_actividad, id_estudiante }
    });
    if (entregaExistente) {
      return resp.status(409).json({ mensaje: 'Ya existe una entrega para esta actividad' });
    }

    // Crear entrega
    const nuevaEntrega = await Entrega.create({
      id_actividad,
      id_estudiante,
      fecha_entrega: new Date(),
      comentario_estudiante: comentario_estudiante || null,
      archivo_url: archivo_url || null,
      calificacion: null,
      comentario_docente: null,
      fecha_calificacion: null,
      estado: 'entregada'
    });

    // Obtener entrega completa con relaciones
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
    console.error('Error crear entrega:', error);
    resp.status(500).json({ mensaje: 'Error al crear entrega' });
  }
});

// 5) Calificar una entrega (docente)
router.put('/entregas/:id/calificar', async (req, resp) => {
  try {
    const { id } = req.params;
    const { calificacion, comentario_docente } = req.body;

    // Validar calificacion
    if (calificacion === undefined || calificacion === null) {
      return resp.status(400).json({ mensaje: 'La calificación es obligatoria' });
    }

    // Buscar entrega e incluir actividad para validar rango
    const entrega = await Entrega.findByPk(id, {
      include: [{
        model: Actividad,
        as: 'actividad',
        attributes: ['valor_maximo']
      }]
    });

    if (!entrega) {
      return resp.status(404).json({ mensaje: 'Entrega no encontrada' });
    }

    // Validar rango
    if (entrega.actividad && calificacion > entrega.actividad.valor_maximo) {
      return resp.status(400).json({
        mensaje: `La calificación no puede superar ${entrega.actividad.valor_maximo}`
      });
    }
    if (calificacion < 0) {
      return resp.status(400).json({ mensaje: 'La calificación no puede ser negativa' });
    }

    // Actualizar entrega con la calificación
    await entrega.update({
      calificacion: calificacion,
      comentario_docente: comentario_docente || null,
      fecha_calificacion: new Date(),
      estado: 'calificada'
    });

    // Obtener entrega actualizada con relaciones
    const entregaActualizada = await Entrega.findByPk(id, {
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

    resp.json({
      mensaje: 'Entrega calificada exitosamente',
      entrega: entregaActualizada
    });

  } catch (error) {
    console.error('Error calificar entrega:', error);
    resp.status(500).json({ mensaje: 'Error al calificar entrega' });
  }
});

// 6) Actualizar comentario de una entrega (estudiante puede editar antes de calificar)
router.put('/entregas/:id', async (req, resp) => {
  try {
    const { id } = req.params;
    const { comentario_estudiante } = req.body;

    const entrega = await Entrega.findByPk(id);

    if (!entrega) {
      return resp.status(404).json({ mensaje: 'Entrega no encontrada' });
    }

    if (entrega.estado === 'calificada') {
      return resp.status(400).json({ mensaje: 'No se puede editar una entrega ya calificada' });
    }

    await entrega.update({
      comentario_estudiante: comentario_estudiante
    });

    resp.json({
      mensaje: 'Comentario actualizado exitosamente',
      entrega: entrega
    });

  } catch (error) {
    console.error('Error actualizar entrega:', error);
    resp.status(500).json({ mensaje: 'Error al actualizar entrega' });
  }
});

// 7) Eliminar entrega (admin o estudiante antes de calificar)
router.delete('/entregas/:id', async (req, resp) => {
  try {
    const { id } = req.params;

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

    const datosEliminados = {
      id_entrega: entrega.id_entrega,
      estudiante: entrega.estudiante ? `${entrega.estudiante.nombre} ${entrega.estudiante.apellido}` : null,
      actividad: entrega.actividad ? entrega.actividad.titulo : null,
      estado: entrega.estado
    };

    await entrega.destroy();

    resp.json({
      mensaje: 'Entrega eliminada exitosamente',
      entrega_eliminada: datosEliminados
    });

  } catch (error) {
    console.error('Error eliminar entrega:', error);
    resp.status(500).json({ mensaje: 'Error al eliminar entrega' });
  }
});

module.exports = router;
