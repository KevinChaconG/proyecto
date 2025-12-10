const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process. env.DB_HOST || 'localhost',
  user: process. env.DB_USER || 'root',
  password: process. env.DB_PASSWORD || '12345',
  database: process.env. DB_NAME || 'plataforma_estudiantil',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Probar la conexión
pool.getConnection()
  .then(connection => {
    console.log('✅ Pool de conexiones MySQL creado exitosamente');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error al crear pool de conexiones:', err. message);
  });

module.exports = pool;