// backend/Rutas/UsuarioRutas.js
const express = require ('express')
const bcrypt = require('bcryptjs')
const Usuario= require('../Modelos/Usuario')

const router = express.Router()


// Compañeros, esta ruta crea un nuevo usuario en el sistema
router.post('/registro', async(req, resp) =>{
    try{
        // Compañeros, extraemos los datos que vienen en el body de la petición
        const {id_rol, nombre, apellido, email, password} = req.body;

        // Compañeros, validamos que vengan todos los datos necesarios (sin id_usuario porque es AUTO_INCREMENT)
        if (!id_rol || !nombre || !apellido || !email || !password){
            return resp.status(400). json ({mensaje: 'Faltan datos obligatorios'})
        }

        // Compañeros, verificamos que el email no esté ya registrado
        const usuarioExistente = await Usuario.findOne({where: {email}});
        if (usuarioExistente) {
            return resp.status(409).json({mensaje: 'Este correo ya está siendo utilizado'})
        }

        // Compañeros, hasheamos la contraseña para guardarla de forma segura
        const password_hash = await bcrypt.hash(password, 10);

        // Compañeros, creamos el nuevo usuario (sin id_usuario, MySQL lo genera automáticamente)
        const nuevoUsuario = await Usuario.create({
            id_rol,
            nombre,
            apellido,
            email,
            password_hash,
            fecha_creacion: new Date(),
            activo: true
        })

        // Compañeros, enviamos la respuesta exitosa
        resp. status(201).json({
            mensaje: 'Usuario creado exitosamente',
            usuario:{
                id_usuario: nuevoUsuario.id_usuario,
                nombre: nuevoUsuario. nombre,
                apellido: nuevoUsuario.apellido,
                email: nuevoUsuario. email,
                id_rol: nuevoUsuario.id_rol
            }
        });

    }catch(error){
        console.log(error);
        resp.status(500).json({mensaje: 'Error al registrar usuario'});
    }
});

// Compañeros, esta ruta valida el login de un usuario
router.post('/login', async (req, resp)=>{
    try {
        // Compañeros, extraemos email y contraseña del body
        const {email, password} = req.body;

        // Compañeros, buscamos el usuario por email
        const usuario = await Usuario.findOne({where: {email}})

        // Compañeros, si no existe el usuario, enviamos error
        if(! usuario){
            return resp.status(401).json({mensaje: 'Usuario no existe'})
        }

        // Compañeros, comparamos la contraseña con el hash guardado
        const passwordValida = await bcrypt.compare(password, usuario.password_hash);

        // Compañeros, si la contraseña no coincide, enviamos error
        if (!passwordValida){
            return resp.status(401).json({mensaje: 'Credenciales inválidas'});
        }

        // Compañeros, si todo es correcto, enviamos los datos del usuario
        resp.json({
            mensaje: 'Login exitoso',
            usuario:{
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                id_rol: usuario.id_rol
            }
        });
        
    } catch (error) {
        console.log(error)
        resp.status(500).json({mensaje: 'Error al iniciar sesión'})
    }
})


// ============================================
// RUTAS PARA GESTIÓN DE USUARIOS (ADMIN)
// ============================================

// Compañeros, esta ruta lista TODOS los usuarios del sistema
router.get('/usuarios', async (req, resp) => {
    try {
        // Compañeros, obtenemos todos los usuarios de la base de datos
        const usuarios = await Usuario.findAll({
            attributes: ['id_usuario', 'id_rol', 'nombre', 'apellido', 'email', 'fecha_creacion', 'activo'],
            order: [['id_usuario', 'ASC']]
        });

        resp.json({
            mensaje: 'Lista de usuarios',
            total: usuarios.length,
            usuarios: usuarios
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({ mensaje: 'Error al obtener usuarios' });
    }
});

// Compañeros, esta ruta obtiene UN usuario específico por su ID
router.get('/usuarios/:id', async (req, resp) => {
    try {
        const { id } = req.params;

        const usuario = await Usuario.findByPk(id, {
            attributes: ['id_usuario', 'id_rol', 'nombre', 'apellido', 'email', 'fecha_creacion', 'activo']
        });

        if (!usuario) {
            return resp.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        resp.json({
            mensaje: 'Usuario encontrado',
            usuario: usuario
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({ mensaje: 'Error al obtener usuario' });
    }
});

// Compañeros, esta ruta ACTUALIZA un usuario existente
router.put('/usuarios/:id', async (req, resp) => {
    try {
        const { id } = req.params;
        const { id_rol, nombre, apellido, email, password, activo } = req.body;

        // Compañeros, buscamos el usuario por ID
        const usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return resp.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Compañeros, verificamos si el email ya está en uso por otro usuario
        if (email && email !== usuario.email) {
            const emailExistente = await Usuario.findOne({ where: { email } });
            if (emailExistente) {
                return resp.status(409).json({ mensaje: 'Este correo ya está siendo utilizado por otro usuario' });
            }
        }

        // Compañeros, preparamos los datos a actualizar
        const datosActualizar = {};
        
        if (id_rol) datosActualizar.id_rol = id_rol;
        if (nombre) datosActualizar.nombre = nombre;
        if (apellido) datosActualizar.apellido = apellido;
        if (email) datosActualizar.email = email;
        if (activo !== undefined) datosActualizar.activo = activo;
        
        // Compañeros, si viene una nueva contraseña, la hasheamos
        if (password) {
            datosActualizar.password_hash = await bcrypt.hash(password, 10);
        }

        // Compañeros, actualizamos el usuario
        await usuario.update(datosActualizar);

        resp.json({
            mensaje: 'Usuario actualizado exitosamente',
            usuario: {
                id_usuario: usuario. id_usuario,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                id_rol: usuario.id_rol,
                activo: usuario.activo
            }
        });

    } catch (error) {
        console. log(error);
        resp. status(500).json({ mensaje: 'Error al actualizar usuario' });
    }
});

// Compañeros, esta ruta ELIMINA un usuario
router. delete('/usuarios/:id', async (req, resp) => {
    try {
        const { id } = req.params;

        // Compañeros, buscamos el usuario por ID
        const usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return resp.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Compañeros, eliminamos el usuario
        await usuario. destroy();

        resp.json({
            mensaje: 'Usuario eliminado exitosamente',
            usuario_eliminado: {
                id_usuario: id,
                nombre: usuario.nombre,
                apellido: usuario. apellido,
                email: usuario.email
            }
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({ mensaje: 'Error al eliminar usuario' });
    }
});


module.exports = router;