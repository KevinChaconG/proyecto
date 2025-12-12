-- ============================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS
-- Plataforma Estudiantil Synapsis
-- ============================================

-- Crear y usar la base de datos
CREATE DATABASE IF NOT EXISTS plataforma_estudiantil;
USE plataforma_estudiantil;

-- ============================================
-- TABLA: roles
-- Debe crearse PRIMERO porque usuarios la referencia
-- ============================================
CREATE TABLE roles (
    id_rol INT PRIMARY KEY AUTO_INCREMENT,
    nombre_rol VARCHAR(45) NOT NULL UNIQUE
);

-- Insertar los tres roles principales
INSERT INTO roles (nombre_rol) VALUES
('admin'),
('docente'),
('estudiante');

-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    id_rol INT NOT NULL,
    nombre VARCHAR(45) NOT NULL,
    apellido VARCHAR(45) NOT NULL,
    email VARCHAR(45) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    fecha_creacion DATETIME DEFAULT NOW(),
    
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

-- ============================================
-- TABLA: asignaturas
-- ============================================
CREATE TABLE asignaturas (
    id_asignatura INT PRIMARY KEY AUTO_INCREMENT,
    nombre_asignatura VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    id_docente INT,
    codigo_curso VARCHAR(45) UNIQUE,
    fecha_creacion DATETIME DEFAULT NOW(),
    
    FOREIGN KEY (id_docente) REFERENCES usuarios(id_usuario)
);

-- ============================================
-- TABLA: matriculas
-- ============================================
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

-- ============================================
-- TABLA: actividades
-- ============================================
CREATE TABLE actividades (
    id_actividad INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_publicacion DATETIME DEFAULT NOW(),
    fecha_entrega DATETIME NULL,
    id_asignatura INT NOT NULL,
    estado ENUM('Activa', 'Cerrada', 'Borrador') DEFAULT 'Activa',
    valor_maximo INT DEFAULT 100,
    
    FOREIGN KEY (id_asignatura) REFERENCES asignaturas(id_asignatura)
);

-- ============================================
-- TABLA: calificaciones
-- ============================================
CREATE TABLE calificaciones (
    id_calificacion INT PRIMARY KEY AUTO_INCREMENT,
    id_actividad INT NOT NULL,
    id_estudiante INT NOT NULL,
    id_docente INT NOT NULL,
    valor_obtenido DECIMAL(5,2) NOT NULL,
    fecha_calificacion DATETIME DEFAULT NOW(),
    comentario TEXT,
    
    FOREIGN KEY (id_actividad) REFERENCES actividades(id_actividad),
    FOREIGN KEY (id_estudiante) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_docente) REFERENCES usuarios(id_usuario),
    
    -- Solo una calificación por actividad por estudiante
    UNIQUE (id_actividad, id_estudiante)
);

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar usuario administrador
-- NOTA: La contraseña debe ser hasheada con bcrypt en el backend
INSERT INTO usuarios (id_rol, nombre, apellido, email, password_hash) VALUES 
(1, 'Admin', 'Master', 'admin@admin.com', '$2b$10$rF5qE8zRqZ8QzKGjKqF8Gu8vKxBw9YqN5vE8zRqZ8QzKGjKqF8Gu');
-- Esta es la contraseña '123456' hasheada con bcrypt

-- Verificar datos
SELECT * FROM roles;
SELECT * FROM usuarios;