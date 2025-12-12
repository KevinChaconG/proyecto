// backend/Modelos/asignatura.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db/Conexion');

// Compañeros, este modelo representa los cursos o clases del sistema
const Asignatura = sequelize.define('Asignatura', {
  id_asignatura: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombre_asignatura: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  codigo_curso: {
    type: DataTypes. STRING(45),
    allowNull: true,
    unique: true
  },
  id_docente: {
    type: DataTypes. INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'asignaturas',
  timestamps: false
});

// Compañeros, definimos la relación con Usuario (docente)
const Usuario = require('./Usuario');
Asignatura.belongsTo(Usuario, {
  foreignKey: 'id_docente',
  as: 'docente'
});




module.exports = Asignatura;