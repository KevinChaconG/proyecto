'use client'
import { usuarioContext } from "./Provider/ProviderUsuario";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {

  const [correo, setCorreo] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [cargando, setCargando] = useState<boolean>(false);

  const router = useRouter()

  const { nombreUsuario, setNombreUsuario } = usuarioContext()

  async function iniciarSesion() {

  if (correo === '' || password === '') {
    alert('Ingrese sus credenciales');
    return;
  }

  try {
    setCargando(true);

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

    if (!resp.ok) {
      alert(data.mensaje || 'Error al iniciar sesión');
      return;
    }

    const nombreCompleto = data.usuario
      ? `${data.usuario.nombre} ${data.usuario.apellido}`
      : correo;

    setNombreUsuario(nombreCompleto);

    const idRol = data.usuario?.id_rol;

    if (!idRol) {
      alert('No se recibió el rol del usuario desde el servidor');
      return;
    }

    switch (idRol) {
      case 1: 
        router.push('/admin');
        break;

      case 2: 
        router.push('/docente');
        break;

      case 3: 
        router.push('/estudiante');
        break;

      default:
        alert(`Rol no reconocido: ${idRol}`);

        break;
    }

  } catch (error) {
    console.error(error);
    alert('No se pudo conectar con el servidor');
  } finally {
    setCargando(false);
  }
}

  return (

<div className="min-vh-100 d-flex align-items-center bg-light">
  <main className="w-100">
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow border-0 rounded-4">
            <div className="card-body p-4">

              <div className="text-center mb-3">
                <img
                  src="logo.svg"
                  alt="Logo de Synapsis"
                  className="img-fluid mb-2"
                  style={{ maxWidth: '200px' }}
                />
                <h3 className="h5 fw-bold mb-4">Portal</h3>
              </div>

              <hr />

              <form
                className="mt-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  iniciarSesion();
                }}
              >
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Correo electrónico
                  </label>
                  <input
                    className="form-control"
                    placeholder="correo@synapsis.com"
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <small className="text-muted">
                    ¿Olvidaste tu contraseña? <span className="text-primary">Contacta a tu Administrador</span>
                  </small>
                </div>

                <button
                  className="btn btn-success w-100 py-2 fw-semibold"
                  type="submit"
                  disabled={cargando}
                >
                  {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
                </button>
              </form>

            </div>
          </div>

          {/* Texto inferior opcional */}
          <p className="text-center text-muted mt-3 small">
            © {new Date().getFullYear()} Synapsis. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  </main>
</div>

  );
}
