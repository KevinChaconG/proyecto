'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Seccion = 'dashboard' | 'misCursos' | 'explorar' | 'tareas' | 'calificaciones';

interface Curso {
  id_asignatura: number;
  nombre_asignatura: string;
  codigo_curso: string;
  descripcion?: string;
  activo: boolean;
  docente?: any;
}

interface Matricula {
  id_matricula: number;
  id_asignatura: number;
  nombre_asignatura: string;
  codigo_curso: string;
  estado: string;
  fecha_matricula: string;
  docente?: string;
}

interface Tarea {
  id_actividad: number;
  titulo: string;
  descripcion?: string;
  tipo?: string;
  fecha_entrega?: string | null;
  estado?: string;
  valor_maximo?: number;
  id_asignatura: number;
  nombre_asignatura: string;
  codigo_curso: string;
}

interface EntregaEstudiante {
  id_entrega: number;
  id_actividad: number;
  id_estudiante: number;
  fecha_entrega: string;
  comentario_estudiante?: string | null;
  calificacion?: string | number | null;
  comentario_docente?: string | null;
  estado: string;
  actividad?: {
    id_actividad: number;
    titulo: string;
    tipo?: string | null;
    valor_maximo?: string | number | null;
    asignatura?: {
      nombre_asignatura?: string | null;
      codigo_curso?: string | null;
    };
  };
}

export default function EstudiantePage() {
  const router = useRouter();
  const [seccion, setSeccion] = useState<Seccion>('dashboard');
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [misCursos, setMisCursos] = useState<Matricula[]>([]);
  const [cursosDisponibles, setCursosDisponibles] = useState<Curso[]>([]);
  const [stats, setStats] = useState({
    totalCursos: 0,
    tareasPendientes: 0,
    tareasCompletadas: 0,
    promedio: 0
  });

  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loadingTareas, setLoadingTareas] = useState(false);

  const [entregaModalOpen, setEntregaModalOpen] = useState(false);
  const [tareaSeleccionada, setTareaSeleccionada] = useState<Tarea | null>(null);
  const [contenidoEntrega, setContenidoEntrega] = useState('');
  const [enviandoEntrega, setEnviandoEntrega] = useState(false);
  const [errorEntrega, setErrorEntrega] = useState<string | null>(null);

  const [entregasEstudiante, setEntregasEstudiante] = useState<EntregaEstudiante[]>([]);
  const [loadingCalificaciones, setLoadingCalificaciones] = useState(false);
  const [errorCalificaciones, setErrorCalificaciones] = useState<string | null>(null);


  useEffect(() => {
    const data = localStorage.getItem('usuario');
    if (data) {
      const user = JSON.parse(data);
      setUsuario(user);
      
      if (user.id_rol !== 3) {
        alert('Acceso denegado.Solo para estudiantes.');
        router.push('/');
        return;
      }
      
      cargarDatos(user.id_usuario);
    } else {
      router.push('/');
    }
  }, []);

    useEffect(() => {
    if (seccion === 'tareas' && usuario) {
      cargarTareas(usuario.id_usuario);
    }
  }, [seccion, usuario]);

  useEffect(() => {
    if (seccion === 'calificaciones' && usuario) {
      cargarCalificaciones(usuario.id_usuario);
    }
  }, [seccion, usuario]);


  const cargarDatos = async (idEstudiante: number) => {
    await Promise.all([
      cargarMisCursos(idEstudiante),
      cargarCursosDisponibles(),
      cargarCalificaciones(idEstudiante)
    ]);
  };

  const toNumber = (value: unknown) => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value === 'string') {
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  };

  const syncStatsFromEntregas = (entregas: EntregaEstudiante[], tareasCount?: number) => {
    const graded = entregas.filter((e) => e.calificacion !== null && e.calificacion !== undefined);
    const sum = graded.reduce((acc, e) => acc + (toNumber(e.calificacion) ?? 0), 0);
    const promedio = graded.length > 0 ? sum / graded.length : 0;
    const completadas = entregas.length;
    const pendientes = typeof tareasCount === 'number' ? Math.max(0, tareasCount - completadas) : undefined;

    setStats((prev) => ({
      ...prev,
      tareasCompletadas: completadas,
      promedio,
      ...(pendientes !== undefined ? { tareasPendientes: pendientes } : {})
    }));
  };

  const cargarCalificaciones = async (idEstudiante: number) => {
    setLoadingCalificaciones(true);
    setErrorCalificaciones(null);
    try {
      const resp = await fetch(`http://localhost:5050/entrega/estudiante/${idEstudiante}/entregas`);
      const raw = await resp.text();
      let data: any = {};
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          data = { raw };
        }
      }

      if (!resp.ok) {
        throw new Error(data?.mensaje || `No se pudieron cargar calificaciones (HTTP ${resp.status}).`);
      }

      const entregas = Array.isArray(data?.entregas) ? (data.entregas as EntregaEstudiante[]) : [];
      setEntregasEstudiante(entregas);
      syncStatsFromEntregas(entregas, tareas.length);
    } catch (err: any) {
      console.error('Error al cargar calificaciones:', err);
      setEntregasEstudiante([]);
      setErrorCalificaciones(err?.message || 'Error al cargar calificaciones');
      syncStatsFromEntregas([], tareas.length);
    } finally {
      setLoadingCalificaciones(false);
    }
  };

  const cargarMisCursos = async (idEstudiante: number) => {
    setLoading(true);
    try {
      const resp = await fetch(`http://localhost:5050/matricula/estudiante/${idEstudiante}/matriculas`);
      
      if (!resp.ok) {
        console.error('Error al cargar matrículas:', resp.status);
        setMisCursos([]);
        return;
      }
      
      const data = await resp.json();
      const matriculasEstudiante = data.matriculas || [];
      
      const cursosFormateados = matriculasEstudiante.map((m: any) => ({
        id_matricula: m.id_matricula,
        id_asignatura: m.id_asignatura,
        nombre_asignatura: m.asignatura?.nombre_asignatura || 'Curso sin nombre',
        codigo_curso: m.asignatura?.codigo_curso || 'N/A',
        estado: m.estado || 'activa',
        fecha_matricula: m.fecha_matricula,
        docente: m.asignatura?.docente ? `${m.asignatura.docente.nombre} ${m.asignatura.docente.apellido}` : 'No asignado'
      }));
      
      setMisCursos(cursosFormateados);
      setStats(prev => ({
        ...prev,
        totalCursos: cursosFormateados.length
      }));
      
    } catch (error) {
      console.error('Error al cargar mis cursos:', error);
      setMisCursos([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarCursosDisponibles = async () => {
    try {
      const resp = await fetch('http://localhost:5050/asignatura/asignaturas');
      const data = await resp.json();
      
      if (resp.ok) {
        const cursosActivos = (data.asignaturas || []).filter(
          (c: Curso) => c.activo
        );
        setCursosDisponibles(cursosActivos);
      }
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    }
  };

    const cargarTareas = async (idEstudiante: number) => {
    if (!misCursos || misCursos.length === 0) {
      setTareas([]);
      return;
    }

    setLoadingTareas(true);
    try {
      const promises = misCursos.map(async (curso) => {
        const idAsignatura = curso.id_asignatura;
        if (!idAsignatura) return [];

        try {
          const resp = await fetch(
            `http://localhost:5050/actividad/asignatura/${idAsignatura}/actividades`
          );

          if (!resp.ok) {
            console.warn('No se pudieron cargar actividades para', idAsignatura, resp.status);
            return [];
          }

          const data = await resp.json();
          const arrRaw =
            Array.isArray(data.actividades)
              ? data.actividades
              : Array.isArray(data)
              ? data
              : (() => {
                  const firstArray = Object.values(data).find(v => Array.isArray(v));
                  return firstArray || [];
                })();

          const tareasCurso: Tarea[] = (arrRaw as any[]).map((a) => ({
            id_actividad: a.id_actividad ?? a.id,
            titulo: a.titulo,
            descripcion: a.descripcion,
            tipo: a.tipo,
            fecha_entrega: a.fecha_entrega,
            estado: a.estado,
            valor_maximo: a.valor_maximo,
            id_asignatura: curso.id_asignatura,
            nombre_asignatura: curso.nombre_asignatura,
            codigo_curso: curso.codigo_curso
          }));

          return tareasCurso;
        } catch (err) {
          console.error('Error cargando actividades para asignatura', idAsignatura, err);
          return [];
        }
      });

      const results = await Promise.all(promises);
      const merged = results.flat();

      const byId = new Map<number, Tarea>();
      merged.forEach((t) => {
        if (t.id_actividad) byId.set(t.id_actividad, t);
      });

      setTareas(Array.from(byId.values()));

      const tareasCount = Array.from(byId.values()).length;
      setStats(prev => ({
        ...prev,
        tareasPendientes: tareasCount
      }));
      // Si ya hay entregas, ajusta pendientes vs completadas.
      syncStatsFromEntregas(entregasEstudiante, tareasCount);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      setTareas([]);
    } finally {
      setLoadingTareas(false);
    }
  };

    const abrirModalEntrega = (tarea: Tarea) => {
    setTareaSeleccionada(tarea);
    setContenidoEntrega('');
    setErrorEntrega(null);
    setEntregaModalOpen(true);
  };

const enviarEntrega = async (e?: React.FormEvent) => {
  e?.preventDefault();
  if (!usuario || !tareaSeleccionada) return;

  if (!contenidoEntrega.trim()) {
    setErrorEntrega('Por favor escribe una respuesta o comentario antes de enviar.');
    return;
  }


  const payload = {
    id_actividad: tareaSeleccionada.id_actividad,
    id_estudiante: usuario.id_usuario,
    comentario_estudiante: contenidoEntrega.trim(),
    archivo_url: null 
  };

  setEnviandoEntrega(true);
  setErrorEntrega(null);

  try {
    const resp = await fetch('http://localhost:5050/entrega/entregas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Nota: algunos errores del backend pueden devolver body vacío o no-JSON.
    // Para evitar `{} `o `Unexpected end of JSON input`, leemos texto y parseamos si se puede.
    const raw = await resp.text();
    let data: any = null;
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = { raw };
      }
    }

    if (!resp.ok) {
      // 409 = caso esperado cuando el estudiante intenta enviar 2 veces la misma actividad.
      if (resp.status === 409) {
        setErrorEntrega((data && data.mensaje) || 'Ya existe una entrega para esta actividad.');
        return;
      }

      console.error('Error al enviar entrega:', {
        status: resp.status,
        body: data ?? raw,
      });

      throw new Error((data && data.mensaje) || `No se pudo enviar la entrega (HTTP ${resp.status}).`);
    }

    alert('✅ Entrega realizada exitosamente');
    setEntregaModalOpen(false);
    setContenidoEntrega('');

  } catch (err: any) {
    console.error('Error en enviarEntrega:', err);
    setErrorEntrega(err.message || 'Ocurrió un error al enviar la entrega.');
  } finally {
    setEnviandoEntrega(false);
  }
};

  const inscribirseEnCurso = async (idAsignatura: number, nombreCurso: string) => {
    if (!usuario) return;

    const yaMatriculado = misCursos.some(
      (c) => c.id_asignatura === idAsignatura
    );

    if (yaMatriculado) {
      alert('❌ Ya estás inscrito en este curso');
      return;
    }

    if (!confirm(`¿Deseas inscribirte en "${nombreCurso}"?`)) return;

    setLoading(true);
    try {
      const resp = await fetch('http://localhost:5050/matricula/matriculas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_estudiante: usuario.id_usuario,
          id_asignatura: idAsignatura,
        }),
      });

      const data = await resp.json();

      if (resp.ok) {
        alert('✅ ¡Te has inscrito exitosamente!');
        await cargarMisCursos(usuario.id_usuario);
        setSeccion('misCursos');
      } else {
        alert(`❌ ${data.mensaje || 'Error al inscribirse'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al inscribirse en el curso');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('usuario');
    router.push('/');
  };

  const estaInscrito = (idAsignatura: number) => {
    return misCursos.some((c) => c.id_asignatura === idAsignatura);
  };

  return (
    <>
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
      `}</style>

      <div className="min-vh-100" style={{ background: '#f9fafb' }}>
        <div className="d-flex">
          {/* Sidebar */}
          <aside style={{
            width: '280px',
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #2F4858 0%, #1a2f3a 100%)',
            position: 'fixed',
            left: 0,
            top: 0,
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '4px 0 20px rgba(0,0,0,0. 1)',
            zIndex: 1000,
            overflowY: 'auto'
          }}>
            <div className="text-center mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0. 1)' }}>
              <h1 style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #48C9B0 0%, #A855F7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem'
              }}>Synapsis</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: 0 }}>
                Portal Estudiantil
              </p>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '1rem',
              borderRadius: '0.75rem',
              marginBottom: '2rem',
              color: 'white'
            }}>
              <p className="mb-1 fw-semibold">{usuario?.nombre} {usuario?.apellido}</p>
              <p className="mb-0 small" style={{ color: '#A3E635' }}>👨‍🎓 Estudiante</p>
            </div>

            <div style={{ flex: 1 }}>
              {[
                { key: 'dashboard', icon: '🏠', label: 'Inicio' },
                { key: 'misCursos', icon: '📚', label: 'Mis Cursos' },
                { key: 'explorar', icon: '🔍', label: 'Explorar Cursos' },
                { key: 'tareas', icon: '📝', label: 'Tareas' },
                { key: 'calificaciones', icon: '📊', label: 'Notas' }
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => setSeccion(item.key as Seccion)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.75rem',
                    color: seccion === item.key ? 'white' : 'rgba(255,255,255,0.7)',
                    background: seccion === item.key 
                      ? 'linear-gradient(135deg, #48C9B0 0%, #36a893 100%)' 
                      : 'transparent',
                    border: 'none',
                    width: '100%',
                    cursor: 'pointer',
                    marginBottom: '0.5rem',
                    fontWeight: seccion === item.key ? 600 : 400,
                    transition: 'all 0.3s',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (seccion !== item.key) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.color = 'white';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (seccion !== item.key) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                    }
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={logout}
              style={{
                background: 'rgba(236,72,153,0.1)',
                border: '1px solid rgba(236,72,153,0.3)',
                color: '#EC4899',
                padding: '0.875rem',
                borderRadius: '0. 75rem',
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(236,72,153,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(236,72,153,0.1)';
              }}
            >
              🚪 Cerrar Sesión
            </button>
          </aside>

          {/* Main Content */}
          <main style={{
            marginLeft: '280px',
            padding: '2rem',
            minHeight: '100vh',
            background: '#f9fafb',
            width: 'calc(100% - 280px)'
          }}>
            {/* DASHBOARD */}
            {seccion === 'dashboard' && (
              <div>
                <h2 className="mb-4" style={{ color: '#2F4858' }}>
                  Bienvenido, {usuario?.nombre} 👋
                </h2>

                <div className="row g-4 mb-4">
                  <div className="col-sm-6 col-lg-3">
                    <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #48C9B0' }}>
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <p className="text-muted small mb-1">Mis Cursos</p>
                            <h3 className="mb-0 fw-bold" style={{ color: '#48C9B0' }}>
                              {stats.totalCursos}
                            </h3>
                          </div>
                          <div style={{ fontSize: '2. 5rem' }}>📚</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-6 col-lg-3">
                    <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #F4A261' }}>
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <p className="text-muted small mb-1">Pendientes</p>
                            <h3 className="mb-0 fw-bold" style={{ color: '#F4A261' }}>
                              {stats.tareasPendientes}
                            </h3>
                          </div>
                          <div style={{ fontSize: '2.5rem' }}>⏰</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-6 col-lg-3">
                    <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #A3E635' }}>
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <p className="text-muted small mb-1">Completadas</p>
                            <h3 className="mb-0 fw-bold" style={{ color: '#A3E635' }}>
                              {stats.tareasCompletadas}
                            </h3>
                          </div>
                          <div style={{ fontSize: '2.5rem' }}>✅</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-6 col-lg-3">
                    <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #EC4899' }}>
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <p className="text-muted small mb-1">Promedio</p>
                            <h3 className="mb-0 fw-bold" style={{ color: '#EC4899' }}>
                              {stats.promedio > 0 ? stats.promedio.toFixed(1) : '--'}
                            </h3>
                          </div>
                          <div style={{ fontSize: '2.5rem' }}>⭐</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card border-0 shadow-sm">
                  <div className="card-body p-5 text-center">
                    <h3 className="mb-3" style={{ color: '#2F4858' }}>
                      ¿Qué deseas hacer hoy?
                    </h3>
                    <p className="text-muted mb-4">
                      Explora cursos, revisa tus tareas o consulta tus calificaciones
                    </p>
                    <div className="d-flex flex-wrap gap-3 justify-content-center">
                      <button
                        className="btn btn-lg"
                        style={{ backgroundColor: '#48C9B0', color: 'white', borderRadius: '0.75rem' }}
                        onClick={() => setSeccion('misCursos')}
                      >
                        📚 Ver Mis Cursos
                      </button>
                      <button
                        className="btn btn-lg"
                        style={{ backgroundColor: '#A855F7', color: 'white', borderRadius: '0.75rem' }}
                        onClick={() => setSeccion('explorar')}
                      >
                        🔍 Explorar Cursos
                      </button>
                      <button
                        className="btn btn-lg"
                        style={{ backgroundColor: '#F4A261', color: 'white', borderRadius: '0. 75rem' }}
                        onClick={() => setSeccion('tareas')}
                      >
                        📝 Ver Tareas
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MIS CURSOS */}
            {seccion === 'misCursos' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="mb-0" style={{ color: '#2F4858' }}>
                    📚 Mis Cursos Matriculados
                  </h2>
                  <button
                    className="btn"
                    style={{ backgroundColor: '#A855F7', color: 'white', borderRadius: '0. 75rem' }}
                    onClick={() => setSeccion('explorar')}
                  >
                    + Explorar Más Cursos
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" style={{ color: '#48C9B0' }} role="status"></div>
                    <p className="text-muted mt-3">Cargando cursos... </p>
                  </div>
                ) : misCursos.length === 0 ? (
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-5 text-center">
                      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
                      <h4 style={{ color: '#2F4858' }}>No estás inscrito en ningún curso</h4>
                      <p className="text-muted mb-4">
                        Explora nuestro catálogo y comienza tu aprendizaje
                      </p>
                      <button
                        className="btn btn-lg"
                        style={{ backgroundColor: '#A855F7', color: 'white', borderRadius: '0. 75rem' }}
                        onClick={() => setSeccion('explorar')}
                      >
                        🔍 Explorar Cursos
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="row g-4">
                    {misCursos.map((curso) => (
                      <div key={curso.id_matricula} className="col-12 col-md-6 col-lg-4">
                        <div className="card border-0 shadow-sm h-100">
                          <div
                            className="card-header"
                            style={{
                              background: 'linear-gradient(135deg, #48C9B0 0%, #36a893 100%)',
                              color: 'white',
                              padding: '1. 25rem'
                            }}
                          >
                            <h5 className="mb-0">{curso.nombre_asignatura}</h5>
                          </div>
                          <div className="card-body">
                            <p className="mb-2">
                              <strong>Código:</strong>{' '}
                              <span className="badge bg-secondary">{curso.codigo_curso}</span>
                            </p>
                            <p className="mb-2">
                              <strong>Docente:</strong> {curso.docente || 'No asignado'}
                            </p>
                            <p className="mb-2">
                              <strong>Estado:</strong>{' '}
                              <span
                                className="badge"
                                style={{
                                  backgroundColor:
                                    curso.estado === 'activa'
                                      ? '#A3E635'
                                      : curso.estado === 'completada'
                                      ? '#48C9B0'
                                      : '#EC4899',
                                  color: 'white'
                                }}
                              >
                                {curso.estado === 'activa'
                                  ? 'Activa'
                                  : curso.estado === 'completada'
                                  ? 'Completada'
                                  : 'Retirada'}
                              </span>
                            </p>
                            <p className="text-muted small mb-3">
                              <strong>Inscrito:</strong>{' '}
                              {new Date(curso.fecha_matricula).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* EXPLORAR CURSOS */}
            {seccion === 'explorar' && (
              <div>
                <h2 className="mb-4" style={{ color: '#2F4858' }}>
                  🔍 Explorar Cursos Disponibles
                </h2>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" style={{ color: '#A855F7' }} role="status"></div>
                    <p className="text-muted mt-3">Cargando cursos...</p>
                  </div>
                ) : cursosDisponibles.length === 0 ? (
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-5 text-center">
                      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
                      <h4 style={{ color: '#2F4858' }}>No hay cursos disponibles</h4>
                      <p className="text-muted">Vuelve más tarde para ver nuevos cursos</p>
                    </div>
                  </div>
                ) : (
                  <div className="row g-4">
                    {cursosDisponibles.map((curso) => {
                      const yaInscrito = estaInscrito(curso.id_asignatura);

                      return (
                        <div key={curso.id_asignatura} className="col-12 col-md-6 col-lg-4">
                          <div className="card border-0 shadow-sm h-100">
                            <div
                              className="card-header"
                              style={{
                                background: yaInscrito
                                  ? 'linear-gradient(135deg, #A3E635 0%, #8BC825 100%)'
                                  : 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)',
                                color: 'white',
                                padding: '1.25rem'
                              }}
                            >
                              <h5 className="mb-0">{curso.nombre_asignatura}</h5>
                            </div>
                            <div className="card-body">
                              <p className="mb-2">
                                <strong>Código:</strong>{' '}
                                <span className="badge bg-secondary">{curso.codigo_curso}</span>
                              </p>
                              <p className="mb-2">
                                <strong>Docente:</strong>{' '}
                                {curso.docente
                                  ? `${curso.docente.nombre} ${curso.docente.apellido}`
                                  : 'No asignado'}
                              </p>
                              <p className="text-muted mb-3" style={{ minHeight: '60px' }}>
                                {curso.descripcion || 'Sin descripción disponible'}
                              </p>

                              {yaInscrito ?  (
                                <button
                                  className="btn w-100"
                                  style={{
                                    backgroundColor: '#A3E635',
                                    color: 'white',
                                    borderRadius: '0.5rem'
                                  }}
                                  disabled
                                >
                                  ✅ Ya Inscrito
                                </button>
                              ) : (
                                <button
                                  className="btn w-100"
                                  style={{
                                    backgroundColor: '#A855F7',
                                    color: 'white',
                                    borderRadius: '0. 5rem'
                                  }}
                                  onClick={() =>
                                    inscribirseEnCurso(
                                      curso.id_asignatura,
                                      curso.nombre_asignatura
                                    )
                                  }
                                  disabled={loading}
                                >
                                  {loading ? 'Inscribiendo...' : '📝 Inscribirme'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

{/* TAREAS */}
{seccion === 'tareas' && (
  <div>
    <h2 className="mb-4" style={{ color: '#2F4858' }}>📝 Mis Tareas</h2>

    {loadingTareas ? (
      <div className="card border-0 shadow-sm">
        <div className="card-body p-5 text-center">
          <div className="spinner-border" style={{ color: '#F4A261' }} role="status"></div>
          <p className="text-muted mt-3">Cargando tareas...</p>
        </div>
      </div>
    ) : tareas.length === 0 ? (
      <div className="card border-0 shadow-sm">
        <div className="card-body p-5 text-center">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
          <h4 style={{ color: '#2F4858' }}>No tienes tareas asignadas</h4>
          <p className="text-muted">
            Cuando tus docentes creen actividades en tus cursos, aparecerán aquí.
          </p>
        </div>
      </div>
    ) : (
      <div className="row g-4">
        {tareas.map((tarea) => (
          <div key={tarea.id_actividad} className="col-12 col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div
                className="card-header"
                style={{
                  background: 'linear-gradient(135deg, #F4A261 0%, #F97316 100%)',
                  color: 'white',
                  padding: '1.25rem'
                }}
              >
                <h5 className="mb-0">{tarea.titulo}</h5>
                <p className="mb-0 small">
                  {tarea.nombre_asignatura} ({tarea.codigo_curso})
                </p>
              </div>
              <div className="card-body">
                <p className="text-muted small" style={{ minHeight: '60px' }}>
                  {tarea.descripcion || 'Sin descripción'}
                </p>

                <p className="mb-1">
                  <strong>Tipo:</strong>{' '}
                  <span className="badge bg-light text-dark">
                    {tarea.tipo || 'tarea'}
                  </span>
                </p>

                {tarea.fecha_entrega && (
                  <p className="mb-1">
                    <strong>Entrega:</strong>{' '}
                    {String(tarea.fecha_entrega).slice(0, 10)}
                  </p>
                )}

                {tarea.valor_maximo != null && (
                  <p className="mb-3">
                    <strong>Valor máximo:</strong> {tarea.valor_maximo}
                  </p>
                )}

                <button
                  className="btn w-100"
                  style={{
                    backgroundColor: '#48C9B0',
                    color: 'white',
                    borderRadius: '0.5rem'
                  }}
                  onClick={() => abrirModalEntrega(tarea)}
                >
                  ✏️ Responder / Entregar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}


            {/* CALIFICACIONES */}
            {seccion === 'calificaciones' && (
              <div>
                <h2 className="mb-4" style={{ color: '#2F4858' }}>📊 Mis Calificaciones</h2>

                {loadingCalificaciones ? (
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-5 text-center">
                      <div className="spinner-border" style={{ color: '#A855F7' }} role="status"></div>
                      <p className="text-muted mt-3">Cargando calificaciones...</p>
                    </div>
                  </div>
                ) : errorCalificaciones ? (
                  <div className="alert alert-warning">{errorCalificaciones}</div>
                ) : entregasEstudiante.length === 0 ? (
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-5 text-center">
                      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
                      <h4 style={{ color: '#2F4858' }}>Aún no tienes entregas registradas</h4>
                      <p className="text-muted">Cuando entregues actividades, aparecerán aquí.</p>
                    </div>
                  </div>
                ) : (
                  <div className="row g-4">
                    {entregasEstudiante.map((entrega) => {
                      const califNum = toNumber(entrega.calificacion);
                      const valorMax = toNumber(entrega.actividad?.valor_maximo);
                      const asignatura = entrega.actividad?.asignatura;
                      const titulo = entrega.actividad?.titulo || `Actividad #${entrega.id_actividad}`;

                      const calificacionLabel =
                        califNum !== null
                          ? valorMax !== null
                            ? `${califNum} / ${valorMax}`
                            : `${califNum}`
                          : 'Pendiente';

                      const badgeStyle =
                        entrega.estado === 'calificada'
                          ? { backgroundColor: '#A3E635', color: 'white' }
                          : { backgroundColor: '#F4A261', color: 'white' };

                      return (
                        <div key={entrega.id_entrega} className="col-12 col-md-6 col-lg-4">
                          <div className="card border-0 shadow-sm h-100">
                            <div
                              className="card-header"
                              style={{
                                background: 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)',
                                color: 'white',
                                padding: '1.25rem'
                              }}
                            >
                              <h5 className="mb-0">{titulo}</h5>
                              <p className="mb-0 small">
                                {asignatura?.nombre_asignatura || 'Curso'}
                                {asignatura?.codigo_curso ? ` (${asignatura.codigo_curso})` : ''}
                              </p>
                            </div>

                            <div className="card-body">
                              <p className="mb-2">
                                <strong>Estado:</strong>{' '}
                                <span className="badge" style={{ ...badgeStyle }}>
                                  {entrega.estado === 'calificada' ? 'Calificada' : 'Entregada'}
                                </span>
                              </p>

                              <p className="mb-2">
                                <strong>Calificación:</strong>{' '}
                                <span className="badge bg-light text-dark">{calificacionLabel}</span>
                              </p>

                              <p className="text-muted small mb-2">
                                <strong>Entregado:</strong>{' '}
                                {entrega.fecha_entrega ? new Date(entrega.fecha_entrega).toLocaleDateString() : '—'}
                              </p>

                              {entrega.comentario_docente && (
                                <div className="alert alert-secondary py-2" style={{ fontSize: '0.9rem' }}>
                                  <strong>Comentario docente:</strong> {entrega.comentario_docente}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

            {/* Modal Entrega de Tarea */}
      {entregaModalOpen && tareaSeleccionada && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}
            >
              <div>
                <h3 style={{ margin: 0, color: '#2F4858' }}>✏️ Entregar Tarea</h3>
                <p
                  style={{
                    margin: '0.5rem 0 0',
                    color: '#6b7280',
                    fontSize: '0.9rem'
                  }}
                >
                  {tareaSeleccionada.titulo} –{' '}
                  {tareaSeleccionada.nombre_asignatura} ({tareaSeleccionada.codigo_curso})
                </p>
              </div>
              <button
                onClick={() => setEntregaModalOpen(false)}
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

            {errorEntrega && (
              <div className="alert alert-warning" style={{ fontSize: '0.9rem' }}>
                {errorEntrega}
              </div>
            )}

            <form onSubmit={enviarEntrega}>
              <div className="mb-3">
                <label
                  className="form-label"
                  style={{ color: '#2F4858', fontWeight: 500 }}
                >
                  Respuesta / Comentarios
                </label>
                <textarea
                  className="form-control"
                  rows={5}
                  value={contenidoEntrega}
                  onChange={(e) => setContenidoEntrega(e.target.value)}
                  placeholder="Escribe aquí tu respuesta, enlace al documento o explicación de tu trabajo..."
                />
              </div>

              {/* Aquí podrías agregar un input de archivo más adelante */}

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  type="button"
                  className="btn"
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    borderRadius: '0.5rem'
                  }}
                  onClick={() => setEntregaModalOpen(false)}
                  disabled={enviandoEntrega}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{
                    backgroundColor: '#48C9B0',
                    color: 'white',
                    borderRadius: '0.5rem',
                    minWidth: '150px'
                  }}
                  disabled={enviandoEntrega}
                >
                  {enviandoEntrega ? 'Enviando...' : 'Enviar Entrega'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
}
