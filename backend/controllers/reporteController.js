const pool = require('../config/db');


const getGradeAverageByCourse = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        a.id_asignatura,
        a.nombre_asignatura,
        a.codigo_curso,
        COUNT(e.id_entrega) AS total_entregas_calificadas,
        AVG(e.calificacion) AS promedio_calificaciones
       FROM asignaturas a
       LEFT JOIN actividades act ON a.id_asignatura = act.id_asignatura
       LEFT JOIN entregas e ON act.id_actividad = e.id_actividad AND e.calificacion IS NOT NULL
       GROUP BY a.id_asignatura, a.nombre_asignatura, a.codigo_curso
       ORDER BY a.nombre_asignatura ASC`
    );

    const reporte = rows.map(row => ({
      ...row,
      promedio_calificaciones: row.promedio_calificaciones ? parseFloat(row.promedio_calificaciones).toFixed(2) : '0.00'
    }));

    return res.json({ ok: true, total: reporte.length, reporte });
  } catch (err) {
    console.error('getGradeAverageByCourse error:', err);
    return res.status(500).json({ ok: false, mensaje: err.message });
  }
};

module.exports = {
  getGradeAverageByCourse
};