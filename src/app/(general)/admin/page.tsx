import React from 'react'

export default function page() {
  return (
    <div style={{border:'1px solid #ddd', padding:'1rem', borderRadius:'12px', width:'250px'}}>
      <h2>Panel del Administrador</h2>
      <div className="card">Gestión de Alumnos</div>
      <div className="card">Gestión de Docentes</div>
      <div className="card">Configuración</div>
    </div>
  )
}
