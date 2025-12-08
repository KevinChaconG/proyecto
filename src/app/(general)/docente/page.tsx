'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Seccion = 'dashboard' | 'cursos' | 'actividades' | 'calificaciones';

export default function DocentePage() {
  const router = useRouter();
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('dashboard');
  const [cursos, setCursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);

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

  const cargarCursos = async (idDocente: number) => {
    setLoading(true);
    try {
      const resp = await fetch('http://localhost:5050/asignatura/asignaturas');
      const data = await resp.json();
      const misCursos = data.filter((c: any) => c.id_docente === idDocente);
      setCursos(misCursos);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    router.push('/');
  };

  const renderDashboard = () => (
    <div>
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #48C9B0' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Mis Cursos</p>
                  <h3 className="mb-0 fw-bold" style={{ color: '#48C9B0' }}>{cursos.length}</h3>
                </div>
                <div style={{ fontSize: '2.  5rem' }}>📚</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #F4A261' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Actividades</p>
                  <h3 className="mb-0 fw-bold" style={{ color: '#F4A261' }}>0</h3>
                </div>
                <div style={{ fontSize: '2. 5rem' }}>📋</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #A3E635' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Entregas</p>
                  <h3 className="mb-0 fw-bold" style={{ color: '#A3E635' }}>0</h3>
                </div>
                <div style={{ fontSize: '2.5rem' }}>✍️</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #EC4899' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Estudiantes</p>
                  <h3 className="mb-0 fw-bold" style={{ color: '#EC4899' }}>0</h3>
                </div>
                <div style={{ fontSize: '2.5rem' }}>👨‍🎓</div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
            <div key={curso.id_asignatura} className="col-12 col-md-6 col-lg-4">
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
                  <button className="btn btn-sm w-100" style={{ backgroundColor: '#48C9B0', color: 'white' }}>
                    Ver Detalles
                  </button>
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
        <button className="btn" style={{ backgroundColor: '#F4A261', color: 'white', borderRadius: '0. 75rem' }}>
          + Nueva Actividad
        </button>
      </div>
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <div style={{ fontSize: '4rem' }}>📋</div>
          <h4 style={{ color: '#2F4858' }}>No hay actividades creadas</h4>
        </div>
      </div>
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
                  color: seccionActiva === item ?  'white' : 'rgba(255,255,255,0. 7)',
                  background: seccionActiva === item ?  'linear-gradient(135deg, #48C9B0 0%, #5DADE2 100%)' : 'transparent',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  marginBottom: '0.5rem',
                  fontWeight: seccionActiva === item ? 600 : 400
                }}
              >
                <span style={{ fontSize: '1. 25rem' }}>
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
              borderRadius: '0. 75rem',
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
    </div>
  );
}