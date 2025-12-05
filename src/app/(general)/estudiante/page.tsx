import React from 'react'

export default function page() {
  return (
    <div style={{border:'1px solid #ddd', padding:'1rem', borderRadius:'12px', width:'250px'}}>
      <h2>Panel del Alumno</h2>
      <div className="card">Tareas asignadas</div>
      <div className="card">Pendientes</div>
      <div className="card">Anuncios del curso</div>
      <div className="card">Calificaciones</div>
    </div>
  )
}
