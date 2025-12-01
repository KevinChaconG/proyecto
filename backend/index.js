const express=require('express')
const cors=require('cors')
const sequelize=require('./db/Conexion')

require('./Modelos/Usuario')

const usuarioRutas = require('./Rutas/UsuarioRutas')

const app=express()
app.use(cors())
app.use(express.json())

app.use('/usuario', usuarioRutas);

sequelize.sync()
.then(() => {
    console.log('Modelos sincronizados con la base de datos...');
    app.listen(5050, ()=>{
        console.log('Aplicacion ejecutando correctamente en el puerto 5050')
    })
})
.catch(error =>{
    console.log('Error al conectar a la base de datos...', error)
});