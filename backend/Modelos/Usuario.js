const { DataTypes } = require('sequelize')
const sequelize = require('../db/Conexion');

const Usuario = sequelize.define('Usuarios', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull:false
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
    allowNull: true
  }
}, {
  tableName: 'usuarios', 
  timestamps: false 
});

module.exports = Usuario;