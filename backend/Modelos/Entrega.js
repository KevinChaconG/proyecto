const { DataTypes } = require('sequelize');
const sequelize = require('../db/Conexion');

// Compañeros, este modelo guarda las entregas que hacen los estudiantes
const Entrega = sequelize.define('Entrega', {
  id_entrega: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  id_actividad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // Compañeros, este campo conecta con la tabla actividades
    references: {
      model: 'actividades',
      key: 'id_actividad'
    }
  },
  id_estudiante: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // Compañeros, este campo conecta con la tabla usuarios
    references: {
      model: 'usuarios',
      key: 'id_usuario'
    }
  },
  fecha_entrega: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes. NOW
  },
  comentario_estudiante: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  calificacion: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  comentario_docente: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fecha_calificacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estado: {
    type: DataTypes. ENUM('entregada', 'calificada', 'revision'),
    allowNull: false,
    defaultValue: 'entregada'
  }
}, {
  tableName: 'entregas',
  timestamps: false
});


// Compañeros, definimos las relaciones
const Actividad = require('./Actividad');
const Usuario = require('./Usuario');

Entrega.belongsTo(Actividad, {
  foreignKey: 'id_actividad',
  as: 'actividad'
});

Entrega.belongsTo(Usuario, {
  foreignKey: 'id_estudiante',
  as: 'estudiante'
});


module.exports = Entrega;