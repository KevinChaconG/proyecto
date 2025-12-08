const { Sequelize } = require('sequelize');
require('dotenv').config(); 

const sequelize = new Sequelize(
    process. env.DB_NAME,      
    process.env.DB_USER,      
    process.env. DB_PASSWORD,  
    {
        host: process.env.DB_HOST,      
        port: process. env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false, // puedes Cambiar a true para ver queries SQL en consola
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        timezone: '-06:00' 
    }
);

// Probar la conexión al iniciar
sequelize.authenticate()
    . then(() => {
        console.log('✅ Conexión a MySQL exitosa');
        console.log(`📊 Base de datos: ${process.env. DB_NAME}`);
        console.log(`👤 Usuario: ${process.env. DB_USER}`);
    })
    .catch(error => {
        console.error('❌ Error al conectar a MySQL:', error. message);
        console.error('🔍 Verifica tu archivo .env y que MySQL esté corriendo');
    });

module.exports = sequelize;