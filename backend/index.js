const express=require('express')

var cors=require('cors')
const app=express()

const sequelize=require('./db/Conexion')

app.use(cors())
app.use(express.json())

app.listen(5050,()=>{
    console.log('Aplicacion ejecutando correctamente en el puerto 5050')
})