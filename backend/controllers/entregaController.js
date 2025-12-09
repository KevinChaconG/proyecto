// /backend/controllers/entregaController.js

const pool = require('../config/db');

/**
 * COMAPÑEROS ESTO FUE CREADO EL 08/12/2025
 * 
 * Listar entregas por actividad
 */
const getDeliveriesByActivity = async (req, res) => {
  const { idActividad } = req.params;
  if (!idActividad) return res.status(400).json({ ok: false, mensaje: 'Falta idActividad' });

  try {
    const [rows] = await pool.query(
      `SELECT e.id_entrega, e.id_actividad, e.id_estudiante, u.nombre, u.apellido, e.archivo_url, e.fecha_entrega, e.calificacion, e.retroalimentacion
       FROM entregas e
       JOIN usuarios u ON e.id_estudiante = u.id_usuario
       WHERE e.id_actividad = ?`,
      [Number(idActividad)]
    );
    return res.json({ ok: true, total: rows.length, entregas: rows });
  } catch (err) {
    console.error('getDeliveriesByActivity error:', err);
    return res.status(500).json({ ok: false, mensaje: err.message });
  }
};

/**
 * Calificar una entrega
 * Body: { calificacion, retroalimentacion }
 */
const gradeDelivery = async (req, res) => {
  const { idEntrega } = req.params;
  const { calificacion, retroalimentacion } = req.body;
  if (calificacion === undefined) return res.status(400).json({ ok: false, mensaje: 'Falta la calificacion' });

  try {
    const [result] = await pool.query(
      `UPDATE entregas SET calificacion = ?, retroalimentacion = ?, fecha_calificacion = NOW()
       WHERE id_entrega = ?`,
      [calificacion, retroalimentacion || null, Number(idEntrega)]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Entrega no encontrada' });
    }
    return res.json({ ok: true, mensaje: 'Entrega calificada' });
  } catch (err) {
    console.error('gradeDelivery error:', err);
    return res.status(500).json({ ok: false, mensaje: err.message });
  }
};

module.exports = {
  getDeliveriesByActivity,
  gradeDelivery
};