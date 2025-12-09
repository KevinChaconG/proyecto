// src/app/Componentes/DocenteCursosCards.tsx

import React from 'react';

type Props = {
  curso: {
    id_asignatura: number;
    nombre_asignatura: string;
    codigo_curso: string;
    descripcion?: string;
    activo: number | boolean;
  };
  onVerEstudiantes: (idCurso: number) => void;
  onVerActividades: (idCurso: number) => void;
};

export default function DocenteCursoCard({ curso, onVerEstudiantes, onVerActividades }: Props) {
  return (
    <div style={{
      borderRadius: 8,
      padding: '1rem',
      background: '#fff',
      boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div>
        <h5 style={{ margin: 0 }}>{curso.nombre_asignatura}</h5>
        <p style={{ margin: '6px 0', color: '#6b7280' }}>
          Código: <span style={{ fontWeight: 600 }}>{curso.codigo_curso}</span>
        </p>
        <p style={{ margin: 0, color: '#374151' }}>
          {curso.descripcion || 'Sin descripción'}
        </p>
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => onVerEstudiantes(curso.id_asignatura)}
          style={{
            flex: 1,
            padding: '0.5rem',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          Ver Estudiantes
        </button>
        <button
          onClick={() => onVerActividades(curso.id_asignatura)}
          style={{
            flex: 1,
            padding: '0.5rem',
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          Actividades
        </button>
      </div>
    </div>
  );
}