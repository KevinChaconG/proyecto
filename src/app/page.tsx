// /src/app/page.tsx

'use client'
import { usuarioContext } from "./Provider/ProviderUsuario";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {

  const [correo, setCorreo] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const router = useRouter()

  const { setNombreUsuario } = usuarioContext()

  async function iniciarSesion() {

    if (correo === '' || password === '') {
      setError('Por favor ingresa tus credenciales');
      return;
    }

    try {
      setCargando(true);
      setError('');

      const resp = await fetch('http://localhost:5050/usuario/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: correo,
          password: password
        })
      });

      const data = await resp.json();
      console.log('Respuesta login:', data);

      if (! resp.ok) {
        setError(data.mensaje || 'Error al iniciar sesión');
        return;
      }

      // Verificar que el usuario exista en la respuesta
      if (! data.usuario) {
        setError('No se recibieron datos del usuario');
        return;
      }

      // Guardar nombre completo en el contexto
      const nombreCompleto = `${data.usuario.nombre} ${data.usuario.apellido}`;
      setNombreUsuario(nombreCompleto);

      // ✅ GUARDAR USUARIO EN LOCALSTORAGE (CRÍTICO)
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      const idRol = data.usuario. id_rol;

      // Verificar que el rol exista
      if (!idRol) {
        setError('No se recibió el rol del usuario desde el servidor');
        return;
      }

      // Redirigir según el rol
      switch (idRol) {
        case 1: 
          console.log('Redirigiendo a admin...');
          router.push('/admin');
          break;

        case 2: 
          console.log('Redirigiendo a docente.. .');
          router.push('/docente');
          break;

        case 3: 
          console.log('Redirigiendo a estudiante...');
          router.push('/estudiante');
          break;

        default:
          setError(`Rol no reconocido: ${idRol}`);
          break;
      }

    } catch (error) {
      console. error('Error en iniciarSesion:', error);
      setError('No se pudo conectar con el servidor');
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      {/* Loading and background animations styles */}
      <style jsx>{`
        . animated-bg {
          position: relative;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #2F4858 75%, #48C9B0 100%);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
          overflow: hidden;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .wave {
          position: absolute;
          width: 200%;
          height: 200%;
          top: -50%;
          left: -50%;
          background: radial-gradient(circle, rgba(72, 201, 176, 0.08) 0%, transparent 70%);
          animation: wave 15s ease-in-out infinite;
        }

        . wave:nth-child(2) {
          animation: wave 12s ease-in-out infinite reverse;
          background: radial-gradient(circle, rgba(244, 162, 97, 0.06) 0%, transparent 70%);
        }

        .wave:nth-child(3) {
          animation: wave 18s ease-in-out infinite;
          background: radial-gradient(circle, rgba(93, 173, 226, 0. 07) 0%, transparent 70%);
        }

        @keyframes wave {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(5%, -5%) rotate(3deg);
          }
          50% {
            transform: translate(-3%, 3%) rotate(-2deg);
          }
          75% {
            transform: translate(-5%, -3%) rotate(2deg);
          }
        }

        .particles {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          animation: float linear infinite;
        }

        . particle:nth-child(1) { left: 10%; animation-duration: 8s; animation-delay: 0s; }
        .particle:nth-child(2) { left: 20%; animation-duration: 12s; animation-delay: 2s; }
        .particle:nth-child(3) { left: 30%; animation-duration: 10s; animation-delay: 4s; }
        .particle:nth-child(4) { left: 40%; animation-duration: 14s; animation-delay: 1s; }
        . particle:nth-child(5) { left: 50%; animation-duration: 9s; animation-delay: 3s; }
        .particle:nth-child(6) { left: 60%; animation-duration: 11s; animation-delay: 5s; }
        .particle:nth-child(7) { left: 70%; animation-duration: 13s; animation-delay: 2s; }
        . particle:nth-child(8) { left: 80%; animation-duration: 10s; animation-delay: 4s; }
        .particle:nth-child(9) { left: 90%; animation-duration: 15s; animation-delay: 1s; }

        @keyframes float {
          0% {
            transform: translateY(100vh) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) scale(1);
            opacity: 0;
          }
        }

        .content-wrapper {
          position: relative;
          z-index: 10;
        }

        .logo-placeholder {
          width: 180px;
          height: auto;
          margin: 0 auto;
        }
      `}</style>

      <div className="animated-bg" style={{ 
        minHeight: '100vh', 
        height: '100vh',
        display: 'flex', 
        alignItems: 'center'
      }}>
        {/* Background waves */}
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>

        {/* Floating particles */}
        <div className="particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>

        {/* Main content */}
        <main className="w-100 content-wrapper">
          <div className="container" style={{ maxWidth: '1200px' }}>
            <div className="row justify-content-center">
              <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                
                {/* Main card */}
                <div className="card shadow-lg border-0" style={{ 
                  borderRadius: '1.5rem',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                }}>
                  <div className="card-body px-4 py-4 px-md-5 py-md-4">

                    {/* Logo and title */}
                    <div className="text-center mb-3">
                      <img
                        src="/logo.svg"
                        alt="Logo de Synapsis"
                        className="img-fluid mb-2 logo-placeholder"
                      />
                      <h3 className="fw-bold mb-1" style={{ color: '#2F4858', fontSize: '1.5rem' }}>
                        Portal Synapsis
                      </h3>
                      <p className="text-muted small mb-0">Plataforma Estudiantil</p>
                    </div>

                    {/* Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        iniciarSesion();
                      }}
                    >
                      {/* Email */}
                      <div className="mb-3">
                        <label className="form-label fw-semibold small" style={{ color: '#2F4858' }}>
                          Correo electrónico
                        </label>
                        <input
                          className="form-control"
                          placeholder="correo@synapsis.com"
                          type="email"
                          value={correo}
                          onChange={(e) => {
                            setCorreo(e.target. value);
                            setError('');
                          }}
                          style={{
                            borderRadius: '0.75rem',
                            border: '2px solid #E5E7EB',
                            padding: '0.65rem 1rem',
                            transition: 'all 0.3s',
                            fontSize: '0. 95rem'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#48C9B0';
                            e.target.style.boxShadow = '0 0 0 3px rgba(72, 201, 176, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#E5E7EB';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </div>

                      {/* Password */}
                      <div className="mb-3">
                        <label className="form-label fw-semibold small" style={{ color: '#2F4858' }}>
                          Contraseña
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Ingresa tu contraseña"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setError('');
                          }}
                          style={{
                            borderRadius: '0.75rem',
                            border: '2px solid #E5E7EB',
                            padding: '0. 65rem 1rem',
                            transition: 'all 0.3s',
                            fontSize: '0.95rem'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#48C9B0';
                            e.target. style.boxShadow = '0 0 0 3px rgba(72, 201, 176, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style. borderColor = '#E5E7EB';
                            e. target.style.boxShadow = 'none';
                          }}
                        />
                      </div>

                      {/* Error message */}
                      {error && (
                        <div 
                          className="alert d-flex align-items-center mb-3" 
                          style={{
                            backgroundColor: 'rgba(236, 72, 153, 0.1)',
                            border: '1px solid rgba(236, 72, 153, 0.2)',
                            borderRadius: '0.75rem',
                            color: '#EC4899',
                            padding: '0.65rem 1rem'
                          }}
                        >
                          <svg width="18" height="18" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                            <path d="M7. 002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-. 35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                          </svg>
                          <small style={{ fontSize: '0.85rem' }}>{error}</small>
                        </div>
                      )}

                      {/* Forgot password link */}
                      <div className="mb-3">
                        <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                          ¿Olvidaste tu contraseña?  {' '}
                          <span style={{ color: '#48C9B0', cursor: 'pointer', fontWeight: '500' }}>
                            Contacta a tu Administrador
                          </span>
                        </small>
                      </div>

                      {/* Submit button */}
                      <button
                        className="btn w-100 py-2 fw-semibold"
                        type="submit"
                        disabled={cargando}
                        style={{
                          backgroundColor: '#F4A261',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.75rem',
                          fontSize: '0.95rem',
                          transition: 'all 0.3s',
                          boxShadow: '0 4px 6px rgba(244, 162, 97, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          if (! cargando) {
                            e.currentTarget.style.backgroundColor = '#E9B872';
                            e.currentTarget.style.boxShadow = '0 0 20px rgba(244, 162, 97, 0.4)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#F4A261';
                          e.currentTarget.style. boxShadow = '0 4px 6px rgba(244, 162, 97, 0.2)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {cargando ? (
                          <span className="d-flex align-items-center justify-content-center gap-2">
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Ingresando...
                          </span>
                        ) : (
                          'Iniciar Sesión'
                        )}
                      </button>
                    </form>

                    {/* Test users */}
                    <div className="mt-3 p-3" style={{ 
                      backgroundColor: '#F9FAFB', 
                      borderRadius: '0.75rem',
                      border: '1px solid #E5E7EB'
                    }}>
                      <p className="small fw-semibold mb-2" style={{ color: '#2F4858', fontSize: '0.85rem' }}>
                        👤 Usuarios de prueba:
                      </p>
                      <div className="small text-muted" style={{ fontSize: '0.75rem', lineHeight: '1.5' }}>
                        <p className="mb-1">• <strong>Admin:</strong> admin@admin.com / 123456</p>
                        <p className="mb-1">• <strong>Docente:</strong> docente@test.com / 123456</p>
                        <p className="mb-0">• <strong>Estudiante:</strong> estudiante@test.com / 123456</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Footer */}
                <p className="text-center mt-3 small mb-0" style={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  fontSize: '0.8rem', 
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)' 
                }}>
                  © {new Date().getFullYear()} Synapsis. Todos los derechos reservados.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}