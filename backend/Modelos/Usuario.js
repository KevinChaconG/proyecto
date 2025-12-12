const { DataTypes } = require('sequelize')
const sequelize = require('../db/Conexion');

// Compañeros, este modelo define la estructura de la tabla usuarios
const Usuario = sequelize.define('Usuarios', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,  // Compañeros, esto permite que MySQL genere el ID automáticamente
    allowNull: false
  },
  id_rol: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW  // Compañeros, esto pone la fecha actual por defecto
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true  // Compañeros, por defecto los usuarios están activos
  }
}, {
  tableName: 'usuarios',  // Compañeros, nombre de la tabla en MySQL
  timestamps: false  // Compañeros, no usamos createdAt/updatedAt de Sequelize
});

module.exports = Usuario;