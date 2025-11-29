'use client'
import { usuarioContext } from "./Provider/ProviderUsuario";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {

const [correo, setCorreo]=useState<string>('')
const [password, setPassword]=useState<string>('')
const router=useRouter()

const {nombreUsuario, setNombreUsuario} = usuarioContext()

function iniciarSesion(){

  if (correo=='' || password==''){
    alert('Ingrese sus credenciales')
    return
  }

  setNombreUsuario(correo)
  router.push('/productos')

}

  return (
    <div>
      <main>

        <div className="container">
          <h1>Inicio de Sesión</h1>

          <form className="form-control">

            <input className="form-control" placeholder="Ingrese su correo" type="email" value={correo} onChange={(e)=>setCorreo(e.target.value)}></input> <br></br>
            <input type="password" className="form-control" placeholder="Ingrese su contraseña" value={password} onChange={(e)=>setPassword(e.target.value)}></input> <br></br>

            <button className="btn btn-success" onClick={iniciarSesion} type="button">Iniciar Sesión</button>

          </form>
        </div>
      </main>
    </div>
  );
}
