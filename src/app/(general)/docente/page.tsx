// src/app/%28general%29/docente/page.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import EntregasModal from '../../Componentes/EntregasModal';

type Seccion = 'dashboard' | 'cursos' | 'actividades' | 'calificaciones';

export default function DocentePage() {
  const router = useRouter();
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('dashboard');
  const [cursos, setCursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);

  // --- Estados y funciones para el modal de entregas ---
  const [entregasOpen, setEntregasOpen] = useState(false);
  const [actividadSeleccionada, setActividadSeleccionada] = useState<number | null>(null);
  // --- Actividades (para la pestaña Actividades) ---
  const [actividades, setActividades] = useState<any[]>([]);
  const [loadingActividades, setLoadingActividades] = useState(false);
  
  // --- Estados para el modal de estudiantes matriculados ---
  const [estudiantesModalOpen, setEstudiantesModalOpen] = useState(false);
  const [estudiantesMatriculados, setEstudiantesMatriculados] = useState<any[]>([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<any>(null);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);

  function abrirEntregas(idActividadRaw: any) {
    console.log('abrirEntregas raw value:', idActividadRaw);
    const id = idActividadRaw === null || idActividadRaw === undefined ? null : Number(idActividadRaw);
    if (!id || Number.isNaN(id)) {
      console.warn('abrirEntregas: idActividad inválido:', idActividadRaw);
      // avisar usuario y evitar petición con "{id}" o inválido
      alert('ID de actividad inválido. Revisa la consola.');
      return;
    }
    setActividadSeleccionada(id);
    setEntregasOpen(true);
  }

  // Función para ver estudiantes matriculados en un curso
  const verEstudiantesMatriculados = async (curso: any) => {
    const idAsignatura = curso.id_asignatura ?? curso.idAsignatura ?? curso.id;
    if (!idAsignatura) {
      alert('ID de asignatura inválido');
      return;
    }
    
    setCursoSeleccionado(curso);
    setEstudiantesModalOpen(true);
    setLoadingEstudiantes(true);
    
    try {
      const resp = await fetch(`http://localhost:5050/matricula/asignatura/${idAsignatura}/estudiantes`);
      const data = await resp.json();
      
      if (resp.ok) {
        // Extraer los estudiantes de la respuesta
        const estudiantes = (data.estudiantes || []).map((mat: any) => ({
          id_usuario: mat.estudiante?.id_usuario || mat.id_usuario,
          nombre: mat.estudiante?.nombre || mat.nombre,
          apellido: mat.estudiante?.apellido || mat.apellido,
          email: mat.estudiante?.email || mat.email,
          fecha_matricula: mat.fecha_matricula,
          estado: mat.estado
        }));
        setEstudiantesMatriculados(estudiantes);
      } else {
        console.error('Error al cargar estudiantes:', data.mensaje);
        setEstudiantesMatriculados([]);
      }
    } catch (error) {
      console.error('Error al cargar estudiantes matriculados:', error);
      setEstudiantesMatriculados([]);
    } finally {
      setLoadingEstudiantes(false);
    }
  };
  // ------------------------------------------------------

  useEffect(() => {
    const usuarioData = localStorage.getItem('usuario');
    if (usuarioData) {
      const user = JSON.parse(usuarioData);
      setUsuario(user);
      if (user.id_usuario) {
        cargarCursos(user.id_usuario);
      }
    }
  }, []);

  // si el usuario va a la sección Actividades, cargar actividades
  useEffect(() => {
    if (seccionActiva === 'actividades') {
      // cargar actividades para los cursos ya cargados
      cargarActividades();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seccionActiva, cursos]);

  // Función robusta: detecta la forma de la respuesta y extrae el array
  const cargarCursos = async (idDocente: number) => {
    setLoading(true);
    try {
      const resp = await fetch('http://localhost:5050/asignatura/asignaturas');
      const data = await resp.json();
      // DEBUG: ver qué trae el backend
      console.log('cargarCursos response status:', resp.status);
      console.log('cargarCursos raw data:', data);

      // Normalizar: buscar el array de asignaturas en varias formas posibles
      let arr: any[] = [];

      if (Array.isArray(data)) {
        arr = data;
      } else if (Array.isArray(data.asignaturas)) {
        arr = data.asignaturas;
      } else if (Array.isArray(data.cursos)) {
        arr = data.cursos;
      } else if (Array.isArray(data.data)) { // por si responde { data: [...] }
        arr = data.data;
      } else {
        // Si no encontramos un array, intentar extraer el primer array dentro del objeto
        const firstArray = Object.values(data).find(v => Array.isArray(v));
        if (firstArray) arr = firstArray as any[];
      }

      if (!Array.isArray(arr)) {
        console.warn('No se encontró un array en la respuesta; se asigna vacío.');
        arr = [];
      }

      // Filtrar por id_docente (manejar campos tanto id_docente como idDocente)
      const misCursos = arr.filter((c: any) => {
        const docenteId = c.id_docente ?? c.idDocente ?? c.idDocenteAsignado ?? null;
        return Number(docenteId) === Number(idDocente);
      });

      setCursos(misCursos);
    } catch (error) {
      console.error('Error en cargarCursos:', error);
      setCursos([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar actividades correctamente: iterar cursos y pedir actividades por asignatura
  const cargarActividades = async () => {
    if (!cursos || cursos.length === 0) {
      setActividades([]);
      return;
    }
    setLoadingActividades(true);
    try {
      // Hacemos múltiples requests (uno por asignatura) y concatenamos resultados
      const promises = cursos.map(async (c) => {
        const idAsignatura = c.id_asignatura ?? c.idAsignatura ?? c.id;
        if (!idAsignatura) return [];
        try {
          const resp = await fetch(`http://localhost:5050/actividad/asignatura/${idAsignatura}/actividades`);
          if (!resp.ok) {
            console.warn('actividad fetch no ok for', idAsignatura, resp.status);
            return [];
          }
          const data = await resp.json();
          // data.actividades o data (según respuesta)
          if (Array.isArray(data.actividades)) return data.actividades;
          if (Array.isArray(data)) return data;
          // buscar primer array en objeto
          const arr = Object.values(data).find(v => Array.isArray(v));
          return arr || [];
        } catch (err) {
          console.error('Error al obtener actividades para asignatura', idAsignatura, err);
          return [];
        }
      });

      const results = await Promise.all(promises);
      const merged = results.flat();
      // opcional: filtrar duplicados por id_actividad
      const byId = new Map<number, any>();
      merged.forEach((a: any) => {
        const id = a.id_actividad ?? a.idActividad ?? a.id;
        if (id) byId.set(Number(id), a);
      });
      setActividades(Array.from(byId.values()));
    } catch (err) {
      console.error('Error en cargarActividades:', err);
      setActividades([]);
    } finally {
      setLoadingActividades(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    router.push('/');
  };

  const renderDashboard = () => (
    <div>
      {/* ... el resto de tu UI permanece igual ... */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #48C9B0' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Mis Cursos</p>
                  <h3 className="mb-0 fw-bold" style={{ color: '#48C9B0' }}>{cursos.length}</h3>
                </div>
                <div style={{ fontSize: '2.5rem' }}>📚</div>
              </div>
            </div>
          </div>
        </div>
        {/* ... otras tarjetas ... */}
      </div>
      {/* ... tarjeta principal ... */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-5 text-center">
          <h2 className="mb-3" style={{ color: '#2F4858' }}>
            Bienvenido, {usuario?.nombre || 'Docente'}
          </h2>
          <p className="text-muted mb-4">Panel de gestión académica</p>
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            <button
              className="btn btn-lg"
              style={{ backgroundColor: '#48C9B0', color: 'white', borderRadius: '0.75rem' }}
              onClick={() => setSeccionActiva('cursos')}
            >
              Ver Mis Cursos
            </button>
            <button
              className="btn btn-lg"
              style={{ backgroundColor: '#F4A261', color: 'white', borderRadius: '0.75rem' }}
              onClick={() => setSeccionActiva('actividades')}
            >
              Gestionar Actividades
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // El resto de tus render functions permanecen idénticas (omitidos aquí por brevedad)
  const renderCursos = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0" style={{ color: '#2F4858' }}>Mis Cursos</h2>
      </div>

      <div className="row g-4">
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border" style={{ color: '#48C9B0' }} role="status"></div>
          </div>
        ) : cursos.length === 0 ?  (
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <div style={{ fontSize: '4rem' }}>📚</div>
                <h4 style={{ color: '#2F4858' }}>No tienes cursos asignados</h4>
              </div>
            </div>
          </div>
        ) : (
          cursos.map((curso) => (
            <div key={curso.id_asignatura ?? curso.id} className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3">
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '0.75rem',
                      background: 'rgba(72, 201, 176, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      📚
                    </div>
                    <span className="badge" style={{ backgroundColor: '#48C9B0', color: 'white', height: 'fit-content' }}>
                      {curso.codigo_curso}
                    </span>
                  </div>
                  <h5 style={{ color: '#2F4858' }}>{curso.nombre_asignatura}</h5>
                  <p className="text-muted small">{curso.descripcion || 'Sin descripción'}</p>

                  {/* Botones: Ver Estudiantes, Ver Detalles y Ver Entregas */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <button 
                      className="btn btn-sm" 
                      style={{ backgroundColor: '#10b981', color: 'white' }}
                      onClick={() => verEstudiantesMatriculados(curso)}
                    >
                      👥 Estudiantes
                    </button>
                    <button className="btn btn-sm" style={{ backgroundColor: '#48C9B0', color: 'white' }}>
                      Ver Detalles
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{ backgroundColor: '#5DADE2', color: 'white' }}
                      onClick={() => abrirEntregas(curso.id_asignatura ?? curso.id_actividad ?? curso.id)}
                    >
                      Ver Entregas
                    </button>
                  </div>

                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderActividades = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: '#2F4858' }}>Gestión de Actividades</h2>
        <button
          className="btn"
          style={{ backgroundColor: '#F4A261', color: 'white', borderRadius: '0.75rem' }}
          onClick={() => {
            // abrir un modal de nueva actividad (implementar si se requiere)
            alert('Función crear actividad aún no implementada en este patch.');
          }}
        >
          + Nueva Actividad
        </button>
      </div>

      {loadingActividades ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div className="spinner-border" style={{ color: '#48C9B0' }} role="status"></div>
          </div>
        </div>
      ) : actividades.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div style={{ fontSize: '4rem' }}>📋</div>
            <h4 style={{ color: '#2F4858' }}>No hay actividades creadas</h4>
            <p className="text-muted small">Si esperas ver actividades, revisa que las asignaturas del docente tengan actividades asociadas en backend.</p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {actividades.map((act) => (
            <div key={act.id_actividad ?? act.id} className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3">
                    <h5 style={{ color: '#2F4858' }}>{act.titulo}</h5>
                    <span className="badge bg-light text-dark">{act.tipo ?? 'tarea'}</span>
                  </div>
                  <p className="text-muted small">{act.descripcion || 'Sin descripción'}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button className="btn btn-sm" style={{ backgroundColor: '#48C9B0', color: 'white' }} onClick={() => abrirEntregas(act.id_actividad ?? act.id)}>
                      Ver Entregas
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCalificaciones = () => (
    <div>
      <div className="mb-4">
        <h2 style={{ color: '#2F4858' }}>Calificar Entregas</h2>
      </div>
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <div style={{ fontSize: '4rem' }}>✍️</div>
          <h4 style={{ color: '#2F4858' }}>No hay entregas pendientes</h4>
        </div>
      </div>
    </div>
  );

  const renderContenido = () => {
    switch (seccionActiva) {
      case 'dashboard': return renderDashboard();
      case 'cursos': return renderCursos();
      case 'actividades': return renderActividades();
      case 'calificaciones': return renderCalificaciones();
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <div className="d-flex">
        {/* Sidebar */}
        <aside style={{
          width: '280px',
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #2F4858 0%, #1a2f3a 100%)',
          position: 'fixed',
          left: 0,
          top: 0,
          padding: '2rem 1.  5rem',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem', paddingBottom: '1. 5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <img src="/logo.svg" alt="Logo" style={{ width: '180px', marginBottom: '1rem' }} />
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #F4A261 0%, #48C9B0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem'
            }}>
              Synapsis
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Panel de Docente</p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.05)',
            padding: '1rem',
            borderRadius: '0.75rem',
            marginBottom: '2rem',
            color: 'white'
          }}>
            <p className="mb-1 fw-semibold">{usuario?.nombre} {usuario?.apellido}</p>
            <p className="mb-0 small" style={{ color: '#48C9B0' }}>👨‍🏫 Docente</p>
          </div>

          <div style={{ flex: 1 }}>
            {['dashboard', 'cursos', 'actividades', 'calificaciones'].map((item) => (
              <button
                key={item}
                onClick={() => setSeccionActiva(item as Seccion)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.875rem 1rem',
                  borderRadius: '0.75rem',
                  color: seccionActiva === item ?  'white' : 'rgba(255,255,255,0.7)',
                  background: seccionActiva === item ?  'linear-gradient(135deg, #48C9B0 0%, #5DADE2 100%)' : 'transparent',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  marginBottom: '0.5rem',
                  fontWeight: seccionActiva === item ? 600 : 400
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>
                  {item === 'dashboard' && '📊'}
                  {item === 'cursos' && '📚'}
                  {item === 'actividades' && '📋'}
                  {item === 'calificaciones' && '✍️'}
                </span>
                <span style={{ textTransform: 'capitalize' }}>{item}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(236,72,153,0.1)',
              border: '1px solid rgba(236,72,153,0.3)',
              color: '#EC4899',
              padding: '0.875rem',
              borderRadius: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%'
            }}
          >
            🚪 Cerrar Sesión
          </button>
        </aside>

        {/* Main Content */}
        <main style={{ marginLeft: '280px', padding: '2rem', minHeight: '100vh', flex: 1 }}>
          {renderContenido()}
        </main>
      </div>

      {/* Modal de Entregas (montado una vez en la página docente) */}
      <EntregasModal
        open={entregasOpen}
        onClose={() => setEntregasOpen(false)}
        idActividad={actividadSeleccionada}
        onRefresh={() => {
          if (usuario && usuario.id_usuario) {
            cargarCursos(usuario.id_usuario);
            // si estamos en actividades, recargar actividades también
            if (seccionActiva === 'actividades') {
              cargarActividades();
            }
          }
        }}
      />

      {/* Modal de Estudiantes Matriculados */}
      {estudiantesModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#2F4858' }}>👥 Estudiantes Matriculados</h3>
                <p style={{ margin: '0.5rem 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
                  {cursoSeleccionado?.nombre_asignatura} ({cursoSeleccionado?.codigo_curso})
                </p>
              </div>
              <button
                onClick={() => setEstudiantesModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            {loadingEstudiantes ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="spinner-border" style={{ color: '#48C9B0' }} role="status"></div>
                <p style={{ marginTop: '1rem', color: '#6b7280' }}>Cargando estudiantes...</p>
              </div>
            ) : estudiantesMatriculados.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '4rem' }}>📭</div>
                <h4 style={{ color: '#2F4858', marginTop: '1rem' }}>No hay estudiantes matriculados</h4>
                <p style={{ color: '#6b7280' }}>Este curso aún no tiene estudiantes inscritos.</p>
              </div>
            ) : (
              <div>
                <p style={{ color: '#10b981', fontWeight: 600, marginBottom: '1rem' }}>
                  Total: {estudiantesMatriculados.length} estudiante(s)
                </p>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#374151' }}>#</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#374151' }}>Nombre</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#374151' }}>Email</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#374151' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estudiantesMatriculados.map((est, index) => (
                      <tr key={est.id_usuario || index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.75rem', color: '#6b7280' }}>{index + 1}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 500, color: '#2F4858' }}>
                          {est.nombre} {est.apellido}
                        </td>
                        <td style={{ padding: '0.75rem', color: '#6b7280' }}>{est.email}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: est.estado === 'activa' ? '#d1fae5' : '#fef3c7',
                            color: est.estado === 'activa' ? '#065f46' : '#92400e'
                          }}>
                            {est.estado === 'activa' ? 'Activo' : est.estado || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button
                onClick={() => setEstudiantesModalOpen(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}