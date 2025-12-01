Scripts SQL:
create database plataforma_estudiantil

use plataforma_estudiantil

/*Creación de la tabla Usuarios*/
create table usuarios(
id_usuario int primary key,
id_rol int,
nombre varchar(45),
apellido varchar(45),
email varchar(45) unique,
password_hash varchar(255),
fecha_creacion datetime
)

/*Modificación de la tabla Usuarios que permite "id_rol" esté conectado como foreign key */
ALTER TABLE usuarios
ADD CONSTRAINT fk_usuarios_roles
FOREIGN KEY (id_rol)
REFERENCES roles(id_rol);

/*Creación de la tabla roles*/
create table roles (
id_rol int primary key auto_increment
nombre_rol varchar(45)
)

/*Insertamos los unicos tres roles que pueden tener los usuarios*/
insert into roles (nombre_rol) values
('admin'),
('docente'),
('estudiante');

select * from roles

/*Insertamos el usuario admin*/
insert into usuarios (id_usuario, id_rol, nombre, apellido, email, password_hash) values ('1','1','Admin', 'Master', 'admin@admin.com', '123456')

select * from usuarios

/*Creación de la tabla asignaturas*/
create TABLE asignaturas (
    id_asignatura INT PRIMARY KEY AUTO_INCREMENT,
    nombre_asignatura VARCHAR(100),
    descripcion VARCHAR(255),
    id_docente INT,
    codigo_curso VARCHAR(45),

    FOREIGN KEY (id_docente) REFERENCES usuarios(id_usuario)
);

/*Creación de la tabla actividades*/
CREATE TABLE actividades (
    id_actividad INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_publicacion DATETIME DEFAULT NOW(),
    fecha_entrega DATETIME NULL,
    id_asignatura INT NOT NULL,

    FOREIGN KEY (id_asignatura) REFERENCES asignaturas(id_asignatura)
);

/*Estos dos alters agregan las columnas estado y valor_maximo que no fueron agregados en el script anterior*/
ALTER TABLE actividades
ADD COLUMN estado ENUM('Activa', 'Cerrada', 'Borrador') DEFAULT 'Activa';

ALTER TABLE actividades
ADD COLUMN valor_maximo INT DEFAULT 100;

/*Creación de la tabla calificaciones*/
CREATE TABLE calificaciones (
    id_calificacion INT PRIMARY KEY AUTO_INCREMENT,
    
    id_actividad INT NOT NULL,
    id_estudiante INT NOT NULL,
    id_docente INT NOT NULL,

    valor_obtenido DECIMAL(5,2) NOT NULL,
    fecha_calificacion DATETIME DEFAULT NOW(),

    comentario VARCHAR(255),

    FOREIGN KEY (id_actividad) REFERENCES actividades(id_actividad),
    FOREIGN KEY (id_estudiante) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_docente) REFERENCES usuarios(id_usuario)
);

/*Alteración de la tabla que permite que solo se pueda tener una calificación por actividad*/
ALTER TABLE calificaciones
ADD CONSTRAINT unique_calificacion
UNIQUE (id_actividad, id_estudiante);

/*Creación de la tabla matriculas*/
CREATE TABLE matriculas (
    id_matricula INT PRIMARY KEY AUTO_INCREMENT,
    
    id_asignatura INT NOT NULL,
    id_alumno INT NOT NULL,
    
    fecha_matricula DATETIME DEFAULT NOW(),
    estado ENUM('activa', 'retirada', 'aprobada', 'reprobada') DEFAULT 'activa',

    FOREIGN KEY (id_asignatura) REFERENCES asignaturas(id_asignatura),
    FOREIGN KEY (id_alumno) REFERENCES usuarios(id_usuario),

    -- Evita que el mismo alumno se matricule dos veces en la misma asignatura
    UNIQUE (id_asignatura, id_alumno)
);



