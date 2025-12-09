// backend/controllers/matriculaController.js

const db = require('../config/db');

// Obtener todas las matrículas
exports. obtenerMatriculas = async (req, res) => {
  try {
    const [matriculas] = await db.execute(`
      SELECT 
        m. id_matricula,
        m.id_estudiante,
        m.id_asignatura,
        m.fecha_matricula,
        m.estado,
        m.nota_final,
        CONCAT(u.nombre, ' ', u.apellido) as estudiante,
        u.email as email_estudiante,
        a.nombre_asignatura,
        a. codigo_curso
      FROM matriculas m
      INNER JOIN usuarios u ON m.id_estudiante = u.id_usuario
      INNER JOIN asignaturas a ON m.id_asignatura = a.id_asignatura
      ORDER BY m.fecha_matricula DESC
    `);

    res.json({
      mensaje: 'Lista de matrículas',
      total: matriculas.length,
      matriculas
    });
  } catch (error) {
    console.error('Error al obtener matrículas:', error);
    res.status(500).json({ mensaje: 'Error al obtener matrículas', error: error.message });
  }
};

// Obtener estudiantes de un curso específico
exports.obtenerEstudiantesPorCurso = async (req, res) => {
  try {
    const { id_asignatura } = req.params;

    const [estudiantes] = await db.execute(`
      SELECT 
        m. id_matricula,
        m.fecha_matricula,
        m. estado,
        m.nota_final,
        u.id_usuario,
        CONCAT(u.nombre, ' ', u.apellido) as estudiante,
        u. email
      FROM matriculas m
      INNER JOIN usuarios u ON m.id_estudiante = u.id_usuario
      WHERE m.id_asignatura = ?
      ORDER BY u.apellido, u.nombre
    `, [id_asignatura]);

    res.json({
      mensaje: 'Estudiantes del curso',
      total: estudiantes.length,
      estudiantes
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ mensaje: 'Error al obtener estudiantes', error: error.message });
  }
};

// Crear matrícula (inscribir estudiante a curso)
exports.crearMatricula = async (req, res) => {
  try {
    const { id_estudiante, id_asignatura } = req. body;

    // Verificar que el estudiante existe y es estudiante (rol 3)
    const [estudiante] = await db.execute(
      'SELECT id_usuario, id_rol FROM usuarios WHERE id_usuario = ? ',
      [id_estudiante]
    );

    if (estudiante.length === 0) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    if (estudiante[0].id_rol !== 3) {
      return res.status(400).json({ mensaje: 'El usuario no es un estudiante' });
    }

    // Verificar que el curso existe
    const [curso] = await db.execute(
      'SELECT id_asignatura FROM asignaturas WHERE id_asignatura = ?',
      [id_asignatura]
    );

    if (curso.length === 0) {
      return res.status(404).json({ mensaje: 'Curso no encontrado' });
    }

    // Crear la matrícula
    const [result] = await db.execute(
      'INSERT INTO matriculas (id_estudiante, id_asignatura, estado) VALUES (?, ?, ?)',
      [id_estudiante, id_asignatura, 'activa']
    );

    res.status(201).json({
      mensaje: 'Estudiante matriculado exitosamente',
      id_matricula: result.insertId
    });
  } catch (error) {
    console.error('Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ mensaje: 'El estudiante ya está matriculado en este curso' });
    }
    res.status(500).json({ mensaje: 'Error al crear matrícula', error: error. message });
  }
};

// Eliminar matrícula
exports.eliminarMatricula = async (req, res) => {
  try {
    const { id_matricula } = req.params;

    const [result] = await db.execute(
      'DELETE FROM matriculas WHERE id_matricula = ?',
      [id_matricula]
    );

    if (result. affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Matrícula no encontrada' });
    }

    res.json({ mensaje: 'Matrícula eliminada exitosamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ mensaje: 'Error al eliminar matrícula', error: error.message });
  }
};

// Actualizar estado de matrícula
exports.actualizarMatricula = async (req, res) => {
  try {
    const { id_matricula } = req.params;
    const { estado, nota_final } = req.body;

    const [result] = await db.execute(
      'UPDATE matriculas SET estado = ?, nota_final = ? WHERE id_matricula = ?',
      [estado, nota_final || null, id_matricula]
    );

    if (result. affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Matrícula no encontrada' });
    }

    res.json({ mensaje: 'Matrícula actualizada exitosamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ mensaje: 'Error al actualizar matrícula', error: error.message });
  }
};