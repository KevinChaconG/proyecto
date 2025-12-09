"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Seccion = "dashboard" | "usuarios" | "cursos" | "matriculas";

interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  id_rol: number;
  activo: boolean;
}

interface Curso {
  id_asignatura: number;
  nombre_asignatura: string;
  codigo_curso: string;
  descripcion?: string;
  id_docente?: number;
  activo: boolean;
  docente?: any;
}

interface AdminPanelProps {
  logoSrc?: string;
  logoAlt?: string;
}

export default function AdminPanel({
  logoSrc = "/logo. svg",
  logoAlt = "Logo de Synapsis",
}: AdminPanelProps) {
  const router = useRouter();
  const [seccionActiva, setSeccionActiva] = useState<Seccion>("dashboard");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [docentes, setDocentes] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showModalUsuario, setShowModalUsuario] = useState(false);
  const [showModalCurso, setShowModalCurso] = useState(false);
  const [usuarioEdit, setUsuarioEdit] = useState<Usuario | null>(null);
  const [cursoEdit, setCursoEdit] = useState<Curso | null>(null);

  // Form data
  const [formUsuario, setFormUsuario] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    id_rol: 3,
    activo: true,
  });

  const [formCurso, setFormCurso] = useState({
    nombre_asignatura: "",
    codigo_curso: "",
    descripcion: "",
    id_docente: "",
    activo: true,
  });

  // Stats
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalCursos: 0,
    totalActividades: 0,
    totalMatriculas: 0,
  });

  // Estados para matrículas
  const [matriculas, setMatriculas] = useState<any[]>([]);
  const [mostrarModalMatricula, setMostrarModalMatricula] = useState(false);
  const [matriculaData, setMatriculaData] = useState({
    id_estudiante: "",
    id_asignatura: "",
  });
  const [estudiantesFiltrados, setEstudiantesFiltrados] = useState<any[]>([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string>("");

  // Cargar matrículas
  const cargarMatriculas = async () => {
    try {
      const resp = await fetch("http://localhost:5050/matricula/matriculas");
      const data = await resp.json();
      setMatriculas(data. matriculas || []);
      
      // Actualizar estadísticas
      setStats(prev => ({
        ...prev,
        totalMatriculas: data.total || 0
      }));
    } catch (error) {
      console.error("Error al cargar matrículas:", error);
      alert("Error al cargar matrículas");
    }
  };

  // Crear matrícula (inscribir estudiante a curso)
  const crearMatricula = async () => {
    try {
      if (!matriculaData.id_estudiante || !matriculaData.id_asignatura) {
        alert("Por favor selecciona un estudiante y un curso");
        return;
      }

      const resp = await fetch("http://localhost:5050/matricula/matriculas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_estudiante: parseInt(matriculaData.id_estudiante),
          id_asignatura: parseInt(matriculaData.id_asignatura),
        }),
      });

      const data = await resp.json();

      if (resp.ok) {
        alert("✅ Estudiante matriculado exitosamente");
        setMostrarModalMatricula(false);
        setMatriculaData({ id_estudiante: "", id_asignatura: "" });
        cargarMatriculas();
      } else {
        alert(`❌ ${data.mensaje || "Error al matricular estudiante"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error al matricular estudiante");
    }
  };

  // Eliminar matrícula
  const eliminarMatricula = async (id: number) => {
    if (! confirm("¿Estás seguro de eliminar esta matrícula?")) return;

    try {
      const resp = await fetch(`http://localhost:5050/matricula/matricula/${id}`, {
        method: "DELETE",
      });

      if (resp.ok) {
        alert("✅ Matrícula eliminada");
        cargarMatriculas();
      } else {
        alert("❌ Error al eliminar matrícula");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error al eliminar matrícula");
    }
  };

  // Filtrar estudiantes por curso
  const filtrarPorCurso = async (idAsignatura: string) => {
    setCursoSeleccionado(idAsignatura);

    if (! idAsignatura) {
      cargarMatriculas();
      return;
    }

    try {
      const resp = await fetch(
        `http://localhost:5050/matricula/asignatura/${idAsignatura}/estudiantes`
      );
      const data = await resp.json();

      // Adaptamos los datos para que coincidan con el formato de la tabla
      const matriculasAdaptadas = data.estudiantes.map((est: any) => ({
        id_matricula: est.id_matricula,
        estudiante: est.estudiante,
        email_estudiante: est.email,
        nombre_asignatura:
          cursos.find((c: any) => c.id_asignatura === parseInt(idAsignatura))
            ?.nombre_asignatura || "",
        codigo_curso:
          cursos.find((c: any) => c.id_asignatura === parseInt(idAsignatura))
            ?.codigo_curso || "",
        estado: est.estado,
        fecha_matricula: est.fecha_matricula,
      }));

      setMatriculas(matriculasAdaptadas);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al filtrar por curso");
    }
  };

  useEffect(() => {
    cargarEstadisticas();
    cargarDocentes();
    cargarMatriculas();
  }, []);

  useEffect(() => {
    if (seccionActiva === "usuarios") {
      cargarUsuarios();
    } else if (seccionActiva === "cursos") {
      cargarCursos();
    } else if (seccionActiva === "matriculas") {
      cargarMatriculas();
    }
  }, [seccionActiva]);

  const cargarEstadisticas = async () => {
    try {
      const respUsuarios = await fetch("http://localhost:5050/usuario/usuarios");
      const dataUsuarios = await respUsuarios. json();

      const respCursos = await fetch("http://localhost:5050/asignatura/asignaturas");
      const dataCursos = await respCursos.json();

      const respMatriculas = await fetch("http://localhost:5050/matricula/matriculas");
      const dataMatriculas = await respMatriculas.json();

      setStats({
        totalUsuarios: dataUsuarios.total || 0,
        totalCursos: dataCursos.total || 0,
        totalActividades: 0,
        totalMatriculas: dataMatriculas.total || 0,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const resp = await fetch("http://localhost:5050/usuario/usuarios");
      const data = await resp.json();
      setUsuarios(data.usuarios || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarCursos = async () => {
    setLoading(true);
    try {
      const resp = await fetch("http://localhost:5050/asignatura/asignaturas");
      const data = await resp.json();
      setCursos(data. asignaturas || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarDocentes = async () => {
    try {
      const resp = await fetch("http://localhost:5050/usuario/usuarios");
      const data = await resp.json();
      const docentesList = (data.usuarios || []).filter((u: Usuario) => u.id_rol === 2);
      setDocentes(docentesList);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    router.push("/");
  };

  // --- USUARIOS ---
  const abrirModalUsuario = (usuario?: Usuario) => {
    if (usuario) {
      setUsuarioEdit(usuario);
      setFormUsuario({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        password: "",
        id_rol: usuario.id_rol,
        activo: usuario.activo,
      });
    } else {
      setUsuarioEdit(null);
      setFormUsuario({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        id_rol: 3,
        activo: true,
      });
    }
    setShowModalUsuario(true);
  };

  const guardarUsuario = async () => {
    try {
      const payload: any = {
        nombre: formUsuario.nombre,
        apellido: formUsuario.apellido,
        email: formUsuario.email,
        id_rol: formUsuario.id_rol,
        activo: formUsuario.activo,
      };

      if (usuarioEdit) {
        // Editar
        if (formUsuario.password) {
          payload.password = formUsuario.password;
        }
        const resp = await fetch(
          `http://localhost:5050/usuario/usuario/${usuarioEdit.id_usuario}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (resp.ok) {
          alert("✅ Usuario actualizado");
          cargarUsuarios();
          cargarEstadisticas();
          setShowModalUsuario(false);
        } else {
          const error = await resp.json();
          alert(`❌ Error: ${error.mensaje || "No se pudo actualizar"}`);
        }
      } else {
        // Crear
        if (! formUsuario.password) {
          alert("❌ La contraseña es obligatoria");
          return;
        }
        payload.password = formUsuario.password;

        const resp = await fetch("http://localhost:5050/usuario/registro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (resp.ok) {
          alert("✅ Usuario creado");
          cargarUsuarios();
          cargarEstadisticas();
          setShowModalUsuario(false);
        } else {
          const error = await resp.json();
          alert(`❌ Error: ${error. mensaje || "No se pudo crear"}`);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error al guardar usuario");
    }
  };

  const eliminarUsuario = async (id: number) => {
    if (! confirm("⚠️ ¿Eliminar este usuario?")) return;
    try {
      const resp = await fetch(`http://localhost:5050/usuario/usuario/${id}`, {
        method: "DELETE",
      });
      if (resp.ok) {
        alert("✅ Usuario eliminado");
        cargarUsuarios();
        cargarEstadisticas();
      } else {
        alert("❌ Error al eliminar");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // --- CURSOS ---
  const abrirModalCurso = (curso?: Curso) => {
    if (curso) {
      setCursoEdit(curso);
      setFormCurso({
        nombre_asignatura: curso.nombre_asignatura,
        codigo_curso: curso.codigo_curso,
        descripcion: curso.descripcion || "",
        id_docente: curso.id_docente?. toString() || "",
        activo: curso.activo,
      });
    } else {
      setCursoEdit(null);
      setFormCurso({
        nombre_asignatura: "",
        codigo_curso: "",
        descripcion: "",
        id_docente: "",
        activo: true,
      });
    }
    setShowModalCurso(true);
  };

  const guardarCurso = async () => {
    try {
      const payload = {
        nombre_asignatura: formCurso.nombre_asignatura,
        codigo_curso: formCurso.codigo_curso,
        descripcion: formCurso.descripcion,
        id_docente: formCurso.id_docente ?  parseInt(formCurso.id_docente) : null,
        activo: formCurso.activo,
      };

      if (cursoEdit) {
        // Editar
        const resp = await fetch(
          `http://localhost:5050/asignatura/asignaturas/${cursoEdit.id_asignatura}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (resp.ok) {
          alert("✅ Curso actualizado");
          cargarCursos();
          cargarEstadisticas();
          setShowModalCurso(false);
        } else {
          alert("❌ Error al actualizar");
        }
      } else {
        // Crear
        const resp = await fetch("http://localhost:5050/asignatura/asignaturas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (resp.ok) {
          alert("✅ Curso creado");
          cargarCursos();
          cargarEstadisticas();
          setShowModalCurso(false);
        } else {
          alert("❌ Error al crear");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error al guardar curso");
    }
  };

  const eliminarCurso = async (id: number) => {
    if (!confirm("⚠️ ¿Eliminar este curso?")) return;
    try {
      const resp = await fetch(`http://localhost:5050/asignatura/asignaturas/${id}`, {
        method: "DELETE",
      });
      if (resp.ok) {
        alert("✅ Curso eliminado");
        cargarCursos();
        cargarEstadisticas();
      } else {
        alert("❌ Error al eliminar");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  function renderContenido() {
    switch (seccionActiva) {
      case "dashboard":
        return (
          <div>
            <div className="row g-4 mb-4">
              <div className="col-12 col-sm-6 col-lg-3">
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{ borderLeft: "4px solid #F4A261" }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="text-muted small mb-1">Total Usuarios</p>
                        <h3 className="mb-0 fw-bold" style={{ color: "#F4A261" }}>
                          {stats.totalUsuarios}
                        </h3>
                      </div>
                      <div style={{ fontSize: "2. 5rem" }}>👥</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{ borderLeft: "4px solid #48C9B0" }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="text-muted small mb-1">Total Cursos</p>
                        <h3 className="mb-0 fw-bold" style={{ color: "#48C9B0" }}>
                          {stats.totalCursos}
                        </h3>
                      </div>
                      <div style={{ fontSize: "2.5rem" }}>📚</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{ borderLeft: "4px solid #EC4899" }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="text-muted small mb-1">Actividades</p>
                        <h3 className="mb-0 fw-bold" style={{ color: "#EC4899" }}>
                          {stats.totalActividades}
                        </h3>
                      </div>
                      <div style={{ fontSize: "2.5rem" }}>📋</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{ borderLeft: "4px solid #A3E635" }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="text-muted small mb-1">Matrículas</p>
                        <h3 className="mb-0 fw-bold" style={{ color: "#A3E635" }}>
                          {stats.totalMatriculas}
                        </h3>
                      </div>
                      <div style={{ fontSize: "2.5rem" }}>📝</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body p-5 text-center">
                <h2 className="mb-3" style={{ color: "#2F4858" }}>
                  Bienvenido al Panel de Administración
                </h2>
                <p className="text-muted mb-4">
                  Gestiona usuarios, cursos y visualiza estadísticas del sistema
                </p>
                <div className="d-flex flex-wrap gap-3 justify-content-center">
                  <button
                    className="btn btn-lg"
                    style={{
                      backgroundColor: "#F4A261",
                      color: "white",
                      borderRadius: "0.75rem",
                    }}
                    onClick={() => setSeccionActiva("usuarios")}
                  >
                    Gestionar Usuarios
                  </button>
                  <button
                    className="btn btn-lg"
                    style={{
                      backgroundColor: "#48C9B0",
                      color: "white",
                      borderRadius: "0.75rem",
                    }}
                    onClick={() => setSeccionActiva("cursos")}
                  >
                    Gestionar Cursos
                  </button>
                  <button
                    className="btn btn-lg"
                    style={{
                      backgroundColor: "#A855F7",
                      color: "white",
                      borderRadius: "0.75rem",
                    }}
                    onClick={() => setSeccionActiva("matriculas")}
                  >
                    Gestionar Matrículas
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "usuarios":
        return (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0" style={{ color: "#2F4858" }}>
                Gestión de Usuarios
              </h2>
              <button
                className="btn"
                style={{
                  backgroundColor: "#F4A261",
                  color: "white",
                  borderRadius: "0. 75rem",
                }}
                onClick={() => abrirModalUsuario()}
              >
                + Nuevo Usuario
              </button>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-5">
                    <div
                      className="spinner-border"
                      style={{ color: "#F4A261" }}
                      role="status"
                    ></div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead style={{ backgroundColor: "#F9FAFB" }}>
                        <tr>
                          <th>ID</th>
                          <th>Nombre</th>
                          <th>Email</th>
                          <th>Rol</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.map((usuario) => (
                          <tr key={usuario.id_usuario}>
                            <td>{usuario.id_usuario}</td>
                            <td>
                              {usuario.nombre} {usuario.apellido}
                            </td>
                            <td>{usuario. email}</td>
                            <td>
                              <span
                                className="badge"
                                style={{
                                  backgroundColor:
                                    usuario.id_rol === 1
                                      ? "#F4A261"
                                      : usuario.id_rol === 2
                                      ? "#48C9B0"
                                      : "#A3E635",
                                  color: "white",
                                }}
                              >
                                {usuario.id_rol === 1
                                  ? "Admin"
                                  : usuario. id_rol === 2
                                  ? "Docente"
                                  : "Estudiante"}
                              </span>
                            </td>
                            <td>
                              <span
                                className="badge"
                                style={{
                                  backgroundColor: usuario.activo
                                    ? "#A3E635"
                                    : "#EC4899",
                                  color: "white",
                                }}
                              >
                                {usuario.activo ?  "Activo" : "Inactivo"}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => abrirModalUsuario(usuario)}
                              >
                                ✏️ Editar
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => eliminarUsuario(usuario.id_usuario)}
                              >
                                🗑️ Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "cursos":
        return (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0" style={{ color: "#2F4858" }}>
                Gestión de Cursos
              </h2>
              <button
                className="btn"
                style={{
                  backgroundColor: "#48C9B0",
                  color: "white",
                  borderRadius: "0.75rem",
                }}
                onClick={() => abrirModalCurso()}
              >
                + Nuevo Curso
              </button>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-5">
                    <div
                      className="spinner-border"
                      style={{ color: "#48C9B0" }}
                      role="status"
                    ></div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead style={{ backgroundColor: "#F9FAFB" }}>
                        <tr>
                          <th>ID</th>
                          <th>Curso</th>
                          <th>Código</th>
                          <th>Docente</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cursos. map((curso) => (
                          <tr key={curso.id_asignatura}>
                            <td>{curso.id_asignatura}</td>
                            <td>{curso.nombre_asignatura}</td>
                            <td>
                              <span className="badge bg-secondary">
                                {curso.codigo_curso}
                              </span>
                            </td>
                            <td>
                              {curso. docente
                                ? `${curso. docente.nombre} ${curso. docente.apellido}`
                                : "Sin asignar"}
                            </td>
                            <td>
                              <span
                                className="badge"
                                style={{
                                  backgroundColor: curso.activo
                                    ? "#A3E635"
                                    : "#EC4899",
                                  color: "white",
                                }}
                              >
                                {curso.activo ?  "Activo" : "Inactivo"}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => abrirModalCurso(curso)}
                              >
                                ✏️ Editar
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => eliminarCurso(curso.id_asignatura)}
                              >
                                🗑️ Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "matriculas":
        return (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0" style={{ color: "#2F4858" }}>
                Gestión de Matrículas
              </h2>
              <button
                className="btn"
                style={{
                  backgroundColor: "#A855F7",
                  color: "white",
                  borderRadius: "0.75rem",
                }}
              onClick={() => {
                // Cargar usuarios si no están cargados
                if (usuarios.length === 0) {
                  cargarUsuarios();
                }
                // Cargar cursos si no están cargados
                if (cursos. length === 0) {
                  cargarCursos();
                }
                setMostrarModalMatricula(true);
              }}
              >
                + Nueva Matrícula
              </button>
            </div>

            {/* Filtro por curso */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <label className="form-label fw-bold">Filtrar por Curso:</label>
                <select
                  className="form-select"
                  value={cursoSeleccionado}
                  onChange={(e) => filtrarPorCurso(e.target.value)}
                >
                  <option value="">Todos los cursos</option>
                  {cursos.map((curso: any) => (
                    <option key={curso.id_asignatura} value={curso.id_asignatura}>
                      {curso.nombre_asignatura} ({curso.codigo_curso})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tabla de matrículas */}
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-5">
                    <div
                      className="spinner-border"
                      style={{ color: "#A855F7" }}
                      role="status"
                    ></div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead style={{ backgroundColor: "#F9FAFB" }}>
                        <tr>
                          <th>ID</th>
                          <th>Estudiante</th>
                          <th>Email</th>
                          <th>Curso</th>
                          <th>Código</th>
                          <th>Estado</th>
                          <th>Fecha</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matriculas.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-4 text-muted">
                              No hay matrículas registradas
                            </td>
                          </tr>
                        ) : (
                          matriculas.map((mat: any) => (
                            <tr key={mat.id_matricula}>
                              <td>{mat.id_matricula}</td>
                              <td>{mat.estudiante}</td>
                              <td className="text-muted">{mat.email_estudiante}</td>
                              <td>{mat.nombre_asignatura}</td>
                              <td>
                                <span className="badge bg-secondary">
                                  {mat.codigo_curso}
                                </span>
                              </td>
                              <td>
                                <span
                                  className="badge"
                                  style={{
                                    backgroundColor:
                                      mat.estado === "activa"
                                        ? "#A3E635"
                                        : mat.estado === "completada"
                                        ? "#48C9B0"
                                        : "#EC4899",
                                    color: "white",
                                  }}
                                >
                                  {mat.estado === "activa"
                                    ? "Activa"
                                    : mat. estado === "completada"
                                    ? "Completada"
                                    : "Retirada"}
                                </span>
                              </td>
                              <td className="text-muted">
                                {new Date(mat.fecha_matricula).toLocaleDateString()}
                              </td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => eliminarMatricula(mat.id_matricula)}
                                >
                                  🗑️ Eliminar
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  }

  return (
    <>
      <style jsx>{`
        .sidebar {
          width: 280px;
          min-height: 100vh;
          background: linear-gradient(180deg, #2f4858 0%, #1a2f3a 100%);
          position: fixed;
          left: 0;
          top: 0;
          padding: 2rem 1. 5rem;
          display: flex;
          flex-direction: column;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
        }

        .logo-section {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 1. 5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logo-text {
          font-size: 1.75rem;
          font-weight: 700;
          background: linear-gradient(135deg, #f4a261 0%, #48c9b0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .menu-list {
          flex: 1;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .menu-item {
          margin-bottom: 0.5rem;
        }

        .menu-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.875rem 1rem;
          border-radius: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          transition: all 0.3s;
          cursor: pointer;
          font-size: 0.95rem;
        }

        . menu-link:hover {
          background: rgba(255, 255, 255, 0.08);
          color: white;
        }

        .menu-link.active {
          background: linear-gradient(135deg, #f4a261 0%, #e9b872 100%);
          color: white;
          font-weight: 600;
        }

        .main-content {
          margin-left: 280px;
          padding: 2rem;
          min-height: 100vh;
          background: #f9fafb;
        }

        .logout-btn {
          background: rgba(236, 72, 153, 0.1);
          border: 1px solid rgba(236, 72, 153, 0. 3);
          color: #ec4899;
          padding: 0.875rem;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          width: 100%;
        }

        .logout-btn:hover {
          background: rgba(236, 72, 153, 0.2);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.2s;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background: white;
          border-radius: 1rem;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      <div className="d-flex">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="logo-section">
            <h1 className="logo-text">Synapsis</h1>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "0. 85rem",
                margin: 0,
              }}
            >
              Panel de Administración
            </p>
          </div>

          <ul className="menu-list">
            <li className="menu-item">
              <button
                className={`menu-link ${
                  seccionActiva === "dashboard" ?  "active" : ""
                }`}
                onClick={() => setSeccionActiva("dashboard")}
              >
                <span style={{ fontSize: "1.25rem" }}>📊</span>
                <span>Dashboard</span>
              </button>
            </li>
            <li className="menu-item">
              <button
                className={`menu-link ${
                  seccionActiva === "usuarios" ? "active" : ""
                }`}
                onClick={() => setSeccionActiva("usuarios")}
              >
                <span style={{ fontSize: "1. 25rem" }}>👥</span>
                <span>Usuarios</span>
              </button>
            </li>
            <li className="menu-item">
              <button
                className={`menu-link ${
                  seccionActiva === "cursos" ? "active" : ""
                }`}
                onClick={() => setSeccionActiva("cursos")}
              >
                <span style={{ fontSize: "1.25rem" }}>📚</span>
                <span>Cursos</span>
              </button>
            </li>
            <li className="menu-item">
              <button
                className={`menu-link ${
                  seccionActiva === "matriculas" ? "active" : ""
                }`}
                onClick={() => setSeccionActiva("matriculas")}
              >
                <span style={{ fontSize: "1.25rem" }}>📝</span>
                <span>Matrículas</span>
              </button>
            </li>
          </ul>

          <button className="logout-btn" onClick={handleLogout}>
            🚪 Cerrar Sesión
          </button>
        </aside>

        {/* Main Content */}
        <main className="main-content">{renderContenido()}</main>
      </div>

      {/* Modal Usuario */}
      {showModalUsuario && (
        <div className="modal-overlay" onClick={() => setShowModalUsuario(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <h3 style={{ color: "#2F4858" }}>
                {usuarioEdit ? "✏️ Editar Usuario" : "➕ Nuevo Usuario"}
              </h3>
              <hr />
              <div className="mb-3">
                <label className="form-label fw-bold">Nombre *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formUsuario.nombre}
                  onChange={(e) =>
                    setFormUsuario({ ...formUsuario, nombre: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Apellido *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formUsuario.apellido}
                  onChange={(e) =>
                    setFormUsuario({ ...formUsuario, apellido: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Email *</label>
                <input
                  type="email"
                  className="form-control"
                  value={formUsuario.email}
                  onChange={(e) =>
                    setFormUsuario({ ...formUsuario, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">
                  Contraseña {! usuarioEdit && "*"}
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={formUsuario.password}
                  onChange={(e) =>
                    setFormUsuario({ ...formUsuario, password: e.target.value })
                  }
                  placeholder={usuarioEdit ? "Dejar vacío para no cambiar" : ""}
                />
                {usuarioEdit && (
                  <small className="text-muted">
                    Dejar vacío si no desea cambiar la contraseña
                  </small>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Rol *</label>
                <select
                  className="form-select"
                  value={formUsuario.id_rol}
                  onChange={(e) =>
                    setFormUsuario({
                      ...formUsuario,
                      id_rol: parseInt(e.target.value),
                    })
                  }
                >
                  <option value={1}>👑 Administrador</option>
                  <option value={2}>👨‍🏫 Docente</option>
                  <option value={3}>👨‍🎓 Estudiante</option>
                </select>
              </div>
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="activoCheck"
                  checked={formUsuario.activo}
                  onChange={(e) =>
                    setFormUsuario({ ...formUsuario, activo: e.target.checked })
                  }
                />
                <label className="form-check-label" htmlFor="activoCheck">
                  Usuario activo
                </label>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-secondary flex-fill"
                  onClick={() => setShowModalUsuario(false)}
                >
                  Cancelar
                </button>
                <button
                  className="btn flex-fill"
                  style={{ backgroundColor: "#F4A261", color: "white" }}
                  onClick={guardarUsuario}
                >
                  💾 Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Curso */}
      {showModalCurso && (
        <div className="modal-overlay" onClick={() => setShowModalCurso(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <h3 style={{ color: "#2F4858" }}>
                {cursoEdit ? "✏️ Editar Curso" : "➕ Nuevo Curso"}
              </h3>
              <hr />
              <div className="mb-3">
                <label className="form-label fw-bold">Nombre del Curso *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formCurso.nombre_asignatura}
                  onChange={(e) =>
                    setFormCurso({ ...formCurso, nombre_asignatura: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Código *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formCurso.codigo_curso}
                  onChange={(e) =>
                    setFormCurso({ ...formCurso, codigo_curso: e.target. value })
                  }
                  placeholder="Ej: PROG-WEB-101"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Descripción</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formCurso.descripcion}
                  onChange={(e) =>
                    setFormCurso({ ...formCurso, descripcion: e.target.value })
                  }
                  placeholder="Descripción del curso"
                ></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Docente Asignado</label>
                <select
                  className="form-select"
                  value={formCurso.id_docente}
                  onChange={(e) =>
                    setFormCurso({ ...formCurso, id_docente: e.target.value })
                  }
                >
                  <option value="">Sin asignar</option>
                  {docentes.map((d) => (
                    <option key={d.id_usuario} value={d.id_usuario}>
                      {d.nombre} {d.apellido}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="cursoActivoCheck"
                  checked={formCurso.activo}
                  onChange={(e) =>
                    setFormCurso({ ...formCurso, activo: e.target.checked })
                  }
                />
                <label className="form-check-label" htmlFor="cursoActivoCheck">
                  Curso activo
                </label>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-secondary flex-fill"
                  onClick={() => setShowModalCurso(false)}
                >
                  Cancelar
                </button>
                <button
                  className="btn flex-fill"
                  style={{ backgroundColor: "#48C9B0", color: "white" }}
                  onClick={guardarCurso}
                >
                  💾 Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Matrícula */}
      
{mostrarModalMatricula && (
  <div
    className="modal-overlay"
    onClick={() => setMostrarModalMatricula(false)}
  >
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="p-4">
        <h3 style={{ color: "#2F4858" }}>📝 Inscribir Estudiante a Curso</h3>
        <hr />

        <div className="mb-3">
          <label className="form-label fw-bold">
            Estudiante <span className="text-danger">*</span>
          </label>
          <select
            className="form-select"
            value={matriculaData.id_estudiante}
            onChange={(e) =>
              setMatriculaData({
                ...matriculaData,
                id_estudiante: e.target.value,
              })
            }
          >
            <option value="">Selecciona un estudiante</option>
            {usuarios
              .filter((u: any) => u.id_rol === 3) // Solo estudiantes
              .map((estudiante: any) => (
                <option
                  key={estudiante.id_usuario}
                  value={estudiante.id_usuario}
                >
                  {estudiante.nombre} {estudiante.apellido} ({estudiante.email})
                </option>
              ))}
          </select>
          {usuarios.filter((u: any) => u. id_rol === 3).length === 0 && (
            <small className="text-muted d-block mt-2">
              ℹ️ No hay estudiantes registrados.  Crea estudiantes primero.
            </small>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">
            Curso <span className="text-danger">*</span>
          </label>
          <select
            className="form-select"
            value={matriculaData.id_asignatura}
            onChange={(e) =>
              setMatriculaData({
                ...matriculaData,
                id_asignatura: e.target.value,
              })
            }
          >
            <option value="">Selecciona un curso</option>
            {cursos
              .filter((c: any) => c.activo) // Solo cursos activos
              .map((curso: any) => (
                <option key={curso.id_asignatura} value={curso.id_asignatura}>
                  {curso.nombre_asignatura} ({curso.codigo_curso})
                </option>
              ))}
          </select>
          {cursos.filter((c: any) => c.activo).length === 0 && (
            <small className="text-muted d-block mt-2">
              ℹ️ No hay cursos activos.  Crea cursos primero. 
            </small>
          )}
        </div>

        <div className="d-flex gap-2 mt-4">
          <button
            className="btn btn-secondary flex-fill"
            onClick={() => {
              setMostrarModalMatricula(false);
              setMatriculaData({ id_estudiante: "", id_asignatura: "" });
            }}
          >
            Cancelar
          </button>
          <button
            className="btn flex-fill"
            style={{ backgroundColor: "#A855F7", color: "white" }}
            onClick={crearMatricula}
          >
            💾 Guardar
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </>
  );
}