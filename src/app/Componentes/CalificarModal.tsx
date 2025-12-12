// src/app/Componentes/CalificarModal.tsx

'use client';

import React, { useEffect, useState } from 'react';

type Props = {
  open: boolean;
  idEntrega: number | null;
  onClose: () => void;
  onCalificado?: () => void;
};

type EntregaDetalle = {
  id_entrega: number;
  calificacion: number | null;
  comentario_docente: string | null;
  estudiante?: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    email: string;
  };
  actividad?: {
    id_actividad: number;
    titulo: string;
    tipo?: string;
    valor_maximo?: number | null;
  };
};

export default function CalificarModal({
  open,
  idEntrega,
  onClose,
  onCalificado,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [entrega, setEntrega] = useState<EntregaDetalle | null>(null);
  const [calificacion, setCalificacion] = useState<string>('');
  const [comentarioDocente, setComentarioDocente] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const maxValor = entrega?.actividad?.valor_maximo ?? null;

  // Cargar detalle de la entrega al abrir
  useEffect(() => {
    if (!open || !idEntrega) return;

    let cancelado = false;
    setLoading(true);
    setError(null);

    fetch(`http://localhost:5050/entrega/entregas/${idEntrega}`)
      .then(async (resp) => {
        const data = await resp.json();
        if (!resp.ok) {
          throw new Error(data.mensaje || 'Error al cargar la entrega');
        }
        if (!cancelado) {
          const e = data.entrega || data;
          setEntrega(e);
          // precargar calificación/comentario si ya existían
          if (e.calificacion != null) {
            setCalificacion(String(e.calificacion));
          } else {
            setCalificacion('');
          }
          setComentarioDocente(e.comentario_docente || '');
        }
      })
      .catch((err: unknown) => {
        if (!cancelado) {
          const msg = err instanceof Error ? err.message : String(err);
          setError(msg);
        }
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [open, idEntrega]);

  if (!open || !idEntrega) return null;

  const manejarGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!calificacion.trim()) {
      setError('La calificación es obligatoria.');
      return;
    }

    const valor = Number(calificacion);
    if (Number.isNaN(valor)) {
      setError('La calificación debe ser un número válido.');
      return;
    }

    if (valor < 0) {
      setError('La calificación no puede ser negativa.');
      return;
    }

    if (maxValor != null && valor > maxValor) {
      setError(`La calificación no puede superar ${maxValor}.`);
      return;
    }

    try {
      setSaving(true);

      const resp = await fetch(
        `http://localhost:5050/entrega/entregas/${idEntrega}/calificar`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            calificacion: valor,
            comentario_docente: comentarioDocente || null,
          }),
        }
      );

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.mensaje || 'Error al calificar la entrega');
      }

      if (onCalificado) onCalificado();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al calificar la entrega.');
    } finally {
      setSaving(false);
    }
  };

  const nombreEstudiante = entrega?.estudiante
    ? `${entrega.estudiante.nombre} ${entrega.estudiante.apellido}`
    : 'Estudiante';

  const tituloActividad = entrega?.actividad?.titulo ?? `Entrega #${idEntrega}`;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        {/* HEADER */}
        <div className="modal-header">
          <h3>Calificar Entrega</h3>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          {loading && <p>Cargando datos de la entrega...</p>}

          {error && (
            <div className="alert alert-warning" style={{ fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {!loading && entrega && (
            <>
              <div className="mb-3">
                <p className="mb-1" style={{ color: '#2F4858', fontWeight: 600 }}>
                  {tituloActividad}
                </p>
                <p className="mb-1 small text-muted">
                  Estudiante: <strong>{nombreEstudiante}</strong>
                </p>
                {entrega.estudiante?.email && (
                  <p className="mb-1 small text-muted">
                    Email: {entrega.estudiante.email}
                  </p>
                )}
                {entrega.actividad?.tipo && (
                  <p className="mb-0 small text-muted">
                    Tipo de actividad: {entrega.actividad.tipo}
                  </p>
                )}
                {maxValor != null && (
                  <p className="mb-0 small" style={{ marginTop: '0.5rem' }}>
                    <strong>Valor máximo:</strong> {maxValor}
                  </p>
                )}
              </div>

              <form onSubmit={manejarGuardar}>
                <div className="mb-3">
                  <label
                    className="form-label"
                    style={{ color: '#2F4858', fontWeight: 500 }}
                  >
                    Calificación
                    {maxValor != null && (
                      <span className="text-muted" style={{ marginLeft: '0.25rem', fontSize: '0.85rem' }}>
                        (sobre {maxValor})
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={calificacion}
                    onChange={(e) => setCalificacion(e.target.value)}
                    min={0}
                    {...(maxValor != null ? { max: maxValor } : {})}
                    step="0.01"
                  />
                </div>

                <div className="mb-3">
                  <label
                    className="form-label"
                    style={{ color: '#2F4858', fontWeight: 500 }}
                  >
                    Comentario para el estudiante (opcional)
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={comentarioDocente}
                    onChange={(e) => setComentarioDocente(e.target.value)}
                    placeholder="Retroalimentación, fortalezas, áreas de mejora..."
                  />
                </div>

                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button
                    type="button"
                    className="btn"
                    style={{
                      backgroundColor: '#6b7280',
                      color: 'white',
                      borderRadius: '0.5rem',
                    }}
                    onClick={onClose}
                    disabled={saving}
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
                      minWidth: '140px',
                    }}
                    disabled={saving}
                  >
                    {saving ? 'Guardando...' : 'Guardar Calificación'}
                  </button>
                </div>
              </form>
            </>
          )}

          {!loading && !entrega && !error && (
            <p>No se pudo cargar la información de la entrega.</p>
          )}
        </div>
      </div>
    </div>
  );
}
