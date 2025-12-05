import React from 'react'

export default function page() {
  return (
    <div style={{border:'1px solid #ddd', padding:'1rem', borderRadius:'12px', width:'250px'}}>
      <h2>Panel del Docente</h2>
      <div className="card">Subir tarea</div>
      <div className="card">Crear examen</div>
      <div className="card">Revisar entregas</div>
      <div className="card">Enviar anuncio</div>
    </div>
  )
}
