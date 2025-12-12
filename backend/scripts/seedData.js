const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv'). config();

async function seedData() {
  let connection;
  
  try {
    console.log('🌱 Iniciando seed de datos...\n');

    // Conectar a MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'synapsis_db'
    });

    console.log('✅ Conectado a MySQL\n');

    // Hash de la contraseña "123456"
    const hashedPassword = await bcrypt.hash('123456', 10);

    // 1.  CREAR USUARIOS
    console.log('📝 Creando usuarios...');

    // Admin
    await connection.execute(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, id_rol, activo) 
       VALUES (?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)`,
      ['Admin', 'Sistema', 'admin@admin.com', hashedPassword, 1, 1]
    );

    // Docente 1
    await connection.execute(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, id_rol, activo) 
       VALUES (?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)`,
      ['Juan', 'Pérez', 'docente@test.com', hashedPassword, 2, 1]
    );

    // Docente 2
    await connection.execute(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, id_rol, activo) 
       VALUES (?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)`,
      ['María', 'González', 'maria@test.com', hashedPassword, 2, 1]
    );

    // Estudiantes
    await connection.execute(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, id_rol, activo) 
       VALUES (?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)`,
      ['Carlos', 'López', 'estudiante@test.com', hashedPassword, 3, 1]
    );

    await connection.execute(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, id_rol, activo) 
       VALUES (?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)`,
      ['Ana', 'Martínez', 'ana@test.com', hashedPassword, 3, 1]
    );

    await connection.execute(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, id_rol, activo) 
       VALUES (?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)`,
      ['Luis', 'Ramírez', 'luis@test.com', hashedPassword, 3, 1]
    );

    console.log('✅ 6 usuarios creados\n');

    // Obtener IDs de docentes
    const [rows1] = await connection.execute(
      'SELECT id_usuario FROM usuarios WHERE email = ? ',
      ['docente@test.com']
    );
    const [rows2] = await connection.execute(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      ['maria@test.com']
    );

    const idDocente1 = rows1[0]?.id_usuario || 2;
    const idDocente2 = rows2[0]?. id_usuario || 3;

    // 2. CREAR CURSOS
    console.log('📚 Creando cursos...');

    await connection.execute(
      `INSERT INTO asignaturas (nombre_asignatura, codigo_curso, descripcion, id_docente, activo) 
       VALUES (?, ?, ?, ?, ?)`,
      ['Programación Web', 'PROG-WEB-101', 'Desarrollo de aplicaciones web modernas con React y Node.js', idDocente1, 1]
    );

    await connection.execute(
      `INSERT INTO asignaturas (nombre_asignatura, codigo_curso, descripcion, id_docente, activo) 
       VALUES (?, ?, ?, ?, ?)`,
      ['Base de Datos', 'BD-201', 'Fundamentos de bases de datos relacionales con MySQL', idDocente1, 1]
    );

    await connection.execute(
      `INSERT INTO asignaturas (nombre_asignatura, codigo_curso, descripcion, id_docente, activo) 
       VALUES (?, ?, ?, ?, ?)`,
      ['Matemáticas I', 'MAT-101', 'Cálculo diferencial e integral', idDocente2, 1]
    );

    await connection.execute(
      `INSERT INTO asignaturas (nombre_asignatura, codigo_curso, descripcion, id_docente, activo) 
       VALUES (?, ?, ?, ?, ?)`,
      ['Inglés Técnico', 'ING-301', 'Inglés aplicado a tecnología y documentación técnica', idDocente2, 1]
    );

    console.log('✅ 4 cursos creados\n');

    // 3. RESUMEN
    const [countUsuarios] = await connection.execute('SELECT COUNT(*) as total FROM usuarios');
    const [countCursos] = await connection.execute('SELECT COUNT(*) as total FROM asignaturas');

    console.log('═══════════════════════════════════════');
    console.log('🎉 SEED COMPLETADO EXITOSAMENTE');
    console.log('═══════════════════════════════════════');
    console.log(`📊 Total de usuarios en DB: ${countUsuarios[0]. total}`);
    console.log(`📚 Total de cursos en DB: ${countCursos[0]. total}`);
    console.log('');
    console.log('👤 CREDENCIALES DE ACCESO:');
    console.log('   ┌─────────────────────────────────────');
    console.log('   │ Admin:');
    console.log('   │   Email: admin@admin.com');
    console.log('   │   Pass:  123456');
    console. log('   ├─────────────────────────────────────');
    console. log('   │ Docente:');
    console.log('   │   Email: docente@test.com');
    console.log('   │   Pass:  123456');
    console.log('   ├─────────────────────────────────────');
    console.log('   │ Estudiante:');
    console. log('   │   Email: estudiante@test.com');
    console.log('   │   Pass:  123456');
    console.log('   └─────────────────────────────────────');
    console.log('');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR AL EJECUTAR SEED:', error. message);
    console.error(error);
    if (connection) await connection.end();
    process. exit(1);
  }
}

seedData();