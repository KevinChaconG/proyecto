// src/app/Componentes/CalificarModal.tsx

'use client';
import React, { useState } from 'react';
import { calificarEntrega } from '@/app/services/entregaService';

type Props = {
  open: boolean;
  idEntrega: number;
  onClose: () => void;
  onCalificado: () => void;
};

export default function CalificarModal({ open, idEntrega, onClose, onCalificado }: Props) {
  const [calificacion, setCalificacion] = useState<number | ''>('');
  const [comentario, setComentario] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalificar = async () => {
    if (calificacion === '' || typeof calificacion !== 'number') {
      setError('Ingresa una calificación válida');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await calificarEntrega(idEntrega, calificacion, comentario || undefined);
      onCalificado();
      setCalificacion('');
      setComentario('');
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al calificar';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Calificar Entrega #{idEntrega}</h3>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {error && <p className="text-danger">{error}</p>}

          <div className="mb-3">
            <label className="form-label">Calificación</label>
            <input
              type="number"
              className="form-control"
              placeholder="Ingresa la calificación"
              value={calificacion}
              onChange={(e) => setCalificacion(e.target.value ? Number(e.target.value) : '')}
              disabled={loading}
              min="0"
              step="0.1"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Comentario</label>
            <textarea
              className="form-control"
              placeholder="Comentario para el estudiante (opcional)"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose} disabled={loading}>Cancelar</button>
          <button
            className="btn btn-primary"
            onClick={handleCalificar}
            disabled={loading}
          >
            {loading ? 'Calificando...' : 'Calificar'}
          </button>
        </div>
      </div>
    </div>
  );
}