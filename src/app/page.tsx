'use client'
import { usuarioContext } from "./Provider/ProviderUsuario";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {

const [correo, setCorreo]=useState<string>('')
const [password, setPassword]=useState<string>('')
const [cargando, setCargando]=useState<boolean>(false);

const router=useRouter()

const {nombreUsuario, setNombreUsuario} = usuarioContext()

async function iniciarSesion(){

  if (correo==='' || password===''){
    alert('Ingrese sus credenciales')
    return
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

      const data=await resp.json();
      console.log('Respuesta login:', data)

      if (!resp.ok){
        alert(data.mensaje || 'Error al iniciar sesión');
        return;
      }

            const nombreCompleto = data.usuario
        ? `${data.usuario.nombre} ${data.usuario.apellido}`
        : correo;

        setNombreUsuario(nombreCompleto);

        router.push('/admin')

    } catch (error) {
      console.error(error);
      alert('No se pudo conectar con el servidor')
    } finally {
      setCargando(false)
    }
}

  return (
    <div>
      <main>
        <div className="container">
          <h1>Inicio de Sesión</h1>

          <form className="form-control" onSubmit={(e) => e.preventDefault()}>
            <input
              className="form-control"
              placeholder="Ingrese su correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
            <br />

            <input
              type="password"
              className="form-control"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />

            <button
              className="btn btn-success"
              onClick={iniciarSesion}
              type="button"
              disabled={cargando}
            >
              {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
