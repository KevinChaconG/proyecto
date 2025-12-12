/**
 * backend/controllers/docenteController.js
 */

const pool = require('../config/db');

/**
 * Helper: verifica si existe una asignatura por id
 * @param {number} idAsignatura
 * @returns {Promise<boolean>}
 */
async function cursoExiste(idAsignatura) {
  const [rows] = await pool.query('SELECT id_asignatura FROM asignaturas WHERE id_asignatura = ?', [idAsignatura]);
  return Array.isArray(rows) && rows.length > 0;
}

const getCoursesByDocente = async (req, res) => {
  const { idDocente } = req.params;

  if (!idDocente) {
    return res.status(400).json({ ok: false, mensaje: 'Falta idDocente en parámetros' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id_asignatura, nombre_asignatura, codigo_curso, descripcion, id_docente, activo FROM asignaturas WHERE id_docente = ?',
      [Number(idDocente)]
    );
    return res.json({ ok: true, total: rows.length, cursos: rows });
  } catch (error) {
    console.error('getCoursesByDocente error:', error);
    return res.status(500).json({ ok: false, mensaje: error.message });
  }
};

const getStudentsByCourse = async (req, res) => {
  const { idCurso } = req.params;

  if (!idCurso) {
    return res.status(400).json({ ok: false, mensaje: 'Falta idCurso en parámetros' });
  }

  try {
    const id = Number(idCurso);
    if (Number.isNaN(id)) {
      return res.status(400).json({ ok: false, mensaje: 'idCurso inválido' });
    }

    // Verificar existencia del curso antes de consultar matrículas
    const existe = await cursoExiste(id);
    if (!existe) {
      return res.status(404).json({ ok: false, mensaje: 'Curso no encontrado' });
    }

    const [rows] = await pool.query(
      `SELECT m.id_matricula, u.id_usuario, u.nombre, u.apellido, u.email, m.estado, m.fecha_matricula
       FROM matriculas m
       JOIN usuarios u ON m.id_estudiante = u.id_usuario
       WHERE m.id_asignatura = ?`,
      [id]
    );

    return res.json({ ok: true, total: rows.length, estudiantes: rows });
  } catch (err) {
    console.error('getStudentsByCourse error:', err);
    return res.status(500).json({ ok: false, mensaje: err.message });
  }
};

const getActivitiesByCourse = async (req, res) => {
  const { idCurso } = req.params;

  if (!idCurso) {
    return res.status(400).json({ ok: false, mensaje: 'Falta idCurso en parámetros' });
  }

  try {
    const id = Number(idCurso);
    if (Number.isNaN(id)) {
      return res.status(400).json({ ok: false, mensaje: 'idCurso inválido' });
    }

    // Verificar existencia del curso
    const existe = await cursoExiste(id);
    if (!existe) {
      return res.status(404).json({ ok: false, mensaje: 'Curso no encontrado' });
    }

    const [rows] = await pool.query(
      `SELECT id_actividad, id_asignatura, titulo, descripcion, tipo_actividad, fecha_creacion, fecha_limite, puntaje_maximo, activo
       FROM actividades
       WHERE id_asignatura = ?`,
      [id]
    );

    return res.json({ ok: true, total: rows.length, actividades: rows });
  } catch (error) {
    console.error('getActivitiesByCourse error:', error);
    return res.status(500).json({ ok: false, mensaje: error.message });
  }
};

module.exports = {
  getCoursesByDocente,
  getStudentsByCourse,
  getActivitiesByCourse
};