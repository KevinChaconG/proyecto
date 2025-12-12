const pool = require('../config/db');

/**
 * COMPAÑEROS ESTO FUE CREADO EL 08/12/2025 FUE DE LAS ULTIMAS MODIFICACIONES QUE HICE
 * 
 * Crear actividad (tarea/examen) 
 * Body: { id_asignatura, titulo, descripcion, tipo_actividad, fecha_limite, puntaje_maximo }
 */
const createActivity = async (req, res) => {
  const { id_asignatura, titulo, descripcion, tipo_actividad, fecha_limite, puntaje_maximo } = req.body;
  if (!id_asignatura || !titulo) return res.status(400).json({ ok: false, mensaje: 'Faltan datos obligatorios' });

  try {
    const [result] = await pool.query(
      `INSERT INTO actividades (id_asignatura, titulo, descripcion, tipo_actividad, fecha_creacion, fecha_limite, puntaje_maximo, activo)
       VALUES (?, ?, ?, ?, NOW(), ?, ?, TRUE)`,
      [id_asignatura, titulo, descripcion || '', tipo_actividad || 'tarea', fecha_limite || null, puntaje_maximo || 100]
    );
    return res.status(201).json({ ok: true, mensaje: 'Actividad creada', id_actividad: result.insertId });
  } catch (err) {
    console.error('createActivity error:', err);
    return res.status(500).json({ ok: false, mensaje: err.message });
  }
};

/**
 * Obtener actividades por curso
 */
const getActivitiesByCourse = async (req, res) => {
  const { idCurso } = req.params;
  if (!idCurso) return res.status(400).json({ ok: false, mensaje: 'Falta idCurso' });

  try {
    const [rows] = await pool.query(
      `SELECT id_actividad, id_asignatura, titulo, descripcion, tipo_actividad, fecha_creacion, fecha_limite, puntaje_maximo, activo
       FROM actividades
       WHERE id_asignatura = ?`,
      [Number(idCurso)]
    );
    return res.json({ ok: true, total: rows.length, actividades: rows });
  } catch (err) {
    console.error('getActivitiesByCourse error:', err);
    return res.status(500).json({ ok: false, mensaje: err.message });
  }
};

module.exports = {
  createActivity,
  getActivitiesByCourse
};