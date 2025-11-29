const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(
    'plataforma_estudiantil',
    'Kevin',
    '1234',
    {
        host: 'localhost',
        port: 3306,
        dialect: 'mysql'

    }
)


sequelize.authenticate()
    .then(() => console.log('Conexión exitosa...'))
    .catch(error => console.log('Ocurrió un error en la conexión...' + error))



module.exports = sequelize;