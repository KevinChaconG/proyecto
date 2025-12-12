const mysql = require('mysql2/promise');
require('dotenv').config();

async function verTablas() {
  try {
    const connection = await mysql.createConnection({
      host: process.env. DB_HOST || 'localhost',
      user: process.env. DB_USER || 'root',
      password: process.env. DB_PASSWORD || '',
      database: process.env.DB_NAME || 'synapsis_db'
    });

    console. log('✅ Conectado a MySQL\n');

    // Ver estructura de usuarios
    console.log('📋 Estructura de la tabla USUARIOS:');
    const [usuarios] = await connection.execute('DESCRIBE usuarios');
    console.table(usuarios);

    console.log('\n📋 Estructura de la tabla ASIGNATURAS:');
    const [asignaturas] = await connection. execute('DESCRIBE asignaturas');
    console.table(asignaturas);

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error. message);
    process.exit(1);
  }
}

verTablas();