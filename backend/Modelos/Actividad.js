// backend/Modelos/actividad.js

const { DataTypes } = require('sequelize');
const sequelize = require('../db/Conexion');

// Compañeros, este modelo representa las tareas, exámenes y proyectos
const Actividad = sequelize. define('Actividad', {
  id_actividad: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  titulo: {
    type: DataTypes. STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tipo: {
    type: DataTypes. ENUM('tarea', 'examen', 'proyecto'),
    allowNull: false,
    defaultValue: 'tarea'
  },
  fecha_publicacion: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },
  fecha_entrega: {
    type: DataTypes.DATE,
    allowNull: true
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
  estado: {
    type: DataTypes.ENUM('activa', 'cerrada', 'borrador'),
    allowNull: false,
    defaultValue: 'activa'
  },
  valor_maximo: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 100.00
  }
}, {
  tableName: 'actividades',
  timestamps: false
});


// Compañeros, definimos la relación con Asignatura
const Asignatura = require('./Asignatura');
Actividad.belongsTo(Asignatura, {
  foreignKey: 'id_asignatura',
  as: 'asignatura'
});


module.exports = Actividad;