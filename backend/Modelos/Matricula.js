const { DataTypes } = require('sequelize');
const sequelize = require('../db/Conexion');

// Compañeros, este modelo registra qué estudiantes están matriculados en qué cursos
const Matricula = sequelize.define('Matricula', {
  id_matricula: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  id_asignatura: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // Compañeros, este campo conecta con la tabla asignaturas
    references: {
      model: 'asignaturas',
      key: 'id_asignatura'
    }
  },
  id_estudiante: {
    type: DataTypes. INTEGER,
    allowNull: false,
    // Compañeros, este campo conecta con la tabla usuarios
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  },
  fecha_matricula: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },
  estado: {
    type: DataTypes.ENUM('activa', 'retirada', 'completada'),
    allowNull: false,
    defaultValue: 'activa'
  }
}, {
  tableName: 'matriculas',
  timestamps: false
});

// Compañeros, definimos las relaciones
const Asignatura = require('./Asignatura');
const Usuario = require('./Usuario');

Matricula.belongsTo(Asignatura, {
  foreignKey: 'id_asignatura',
  as: 'asignatura'
});

Matricula.belongsTo(Usuario, {
  foreignKey: 'id_estudiante',
  as: 'estudiante'
});



module.exports = Matricula;