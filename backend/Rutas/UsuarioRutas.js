const express = require ('express')
const bcrypt = require('bcryptjs')
const Usuario= require('../Modelos/Usuario')

const router = express.Router()


//registrar nuevo usuario
router.post('/registro', async(req, resp) =>{
    try{
        const {id_usuario, id_rol, nombre, apellido, email, password} = req.body;

        if (!id_usuario || !id_rol || !nombre || !apellido || !email || !password){
            return resp.status(400).json ({mensaje: 'Faltan datos obligatorios'})
        }

        const usuarioIdExistente = await Usuario.findByPk(id_usuario);
         if (usuarioIdExistente) {
             return resp.status(409).json({ mensaje: 'Este id_usuario ya está en uso' });
    }

        const usuarioExistente = await Usuario.findOne({where: {email}});
        if (usuarioExistente) {
            return resp.status(409).json({mensaje: 'Este correo ya está siendo utilizado'})
        }

        const password_hash = await bcrypt.hash(password, 10);

        const nuevoUsuario=await Usuario.create({
            id_usuario,
            id_rol,
            nombre,
            apellido,
            email,
            password_hash,
            fecha_creacion:new Date()
        })

        resp.status(201).json({
            mensaje: 'Usuario creado exitosamente',
            usuario:{
                id_usuario: nuevoUsuario.id_usuario,
                nombre: nuevoUsuario.nombre,
                apellido: nuevoUsuario.apellido,
                email: nuevoUsuario.email
            }
        });

    }catch(error){
        console.log(error);
        resp.status(500).json({mensaje: 'Error al registrar usuario'});
    }
});

//login de usuario
router.post('/login', async (req, resp)=>{
    try {
        const {email, password} = req.body;

        const usuario=await Usuario.findOne({where: {email}})

        if(!usuario){
            return resp.status(401).json({mensaje: 'Usuario no existe'})
        }

        const passwordValida = await bcrypt.compare(password, usuario.password_hash);

        if (!passwordValida){
            return resp.status(401).json({mensaje: 'Credenciales inválidas'});
        }

        resp.json({
            mensaje: 'Login exitoso',
            usuario:{
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                id_rol:usuario.id_rol
            }
        });
        
    } catch (error) {
        console.log(error)
        resp.status(500).json({mensaje: 'Error al iniciar sesión'})
    }
})

module.exports = router;

