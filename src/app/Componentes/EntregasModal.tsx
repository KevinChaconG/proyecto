// src/app/Componentes/EntregasModal.tsx

'use client';
import React, { useEffect, useState } from 'react';
import { getEntregasByActividad, EntregaItem } from '@/app/services/entregaService';
import CalificarModal from '@/app/Componentes/CalificarModal';

type Props = {
  open: boolean;
  onClose: () => void;
  idActividad: number | null;
  onRefresh?: () => void;
};

export default function EntregasModal({ open, onClose, idActividad, onRefresh }: Props) {
  const [loading, setLoading] = useState(false);
  const [entregas, setEntregas] = useState<EntregaItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntrega, setSelectedEntrega] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!open || !idActividad) return;
    setLoading(true);
    setError(null);
    getEntregasByActividad(idActividad)
      .then((data) => {
        if (!cancelled) setEntregas(data.entregas || []);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        if (!cancelled) setError(msg);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, idActividad]);

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Entregas — Actividad #{String(idActividad)}</h3>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading && <p>Cargando entregas...</p>}
          {error && <p className="text-danger">{error}</p>}
          {!loading && entregas.length === 0 && <p>No hay entregas aún.</p>}

          <ul className="list-group">
            {entregas.map((e) => (
              <li key={e.id_entrega} className="list-group-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <strong>{e.estudiante ? `${e.estudiante.nombre} ${e.estudiante.apellido}` : `Estudiante ${e.id_estudiante}`}</strong>
                    <div className="small text-muted">{e.estudiante?.email}</div>
                    <div className="small">Fecha entrega: {new Date(e.fecha_entrega).toLocaleString()}</div>
                    {e.comentario_estudiante && <div className="small">Comentario: {e.comentario_estudiante}</div>}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="small">Estado: {e.estado}</div>
                    <div className="small">Calificación: {e.calificacion ?? '—'}</div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <button
                        className="btn btn-sm"
                        onClick={() => setSelectedEntrega(e.id_entrega)}
                      >
                        Calificar
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cerrar</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (onRefresh) onRefresh();
              onClose();
            }}
          >
            Actualizar
          </button>
        </div>

        {selectedEntrega !== null && (
          <CalificarModal
            open={true}
            idEntrega={selectedEntrega}
            onClose={() => {
              setSelectedEntrega(null);
              // refrescar la lista después de cerrar la modal de calificar
              if (idActividad) {
                setLoading(true);
                getEntregasByActividad(idActividad)
                  .then((data) => setEntregas(data.entregas || []))
                  .catch(() => {})
                  .finally(() => setLoading(false));
              }
              if (onRefresh) onRefresh();
            }}
            onCalificado={() => {
              if (idActividad) {
                setLoading(true);
                getEntregasByActividad(idActividad)
                  .then((data) => setEntregas(data.entregas || []))
                  .catch(() => {})
                  .finally(() => setLoading(false));
              }
              if (onRefresh) onRefresh();
            }}
          />
        )}
      </div>
    </div>
  );
}