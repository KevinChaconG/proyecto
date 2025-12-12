// src/app/services/entregaService.ts

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

export type EntregaItem = {
  id_entrega: number;
  id_actividad: number;
  id_estudiante: number;
  fecha_entrega: string;
  comentario_estudiante?: string | null;
  calificacion?: string | null;
  comentario_docente?: string | null;
  estado: string;
  estudiante?: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    email: string;
  };
};

type EntregaResponse = {
  entregas: EntregaItem[];
  mensaje?: string;
  total?: number;
  actividad?: any;
};

async function parseJsonOrThrow(resp: Response) {
  const text = await resp.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Invalid JSON response: ${text}`);
  }
}

function buildHeaders() {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  // Si usas token en localStorage:
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch {}
  return headers;
}

export async function getEntregasByActividad(idActividad: number): Promise<EntregaResponse> {
  const resp = await fetch(`${API}/entrega/actividad/${idActividad}/entregas`, {
    method: 'GET',
    headers: buildHeaders(),
  });
  if (!resp.ok) {
    const body = await parseJsonOrThrow(resp);
    throw new Error(body?.mensaje || `HTTP ${resp.status}`);
  }
  return resp.json();
}

export async function getEntregaById(idEntrega: number) {
  const resp = await fetch(`${API}/entrega/entregas/${idEntrega}`, {
    method: 'GET',
    headers: buildHeaders(),
  });
  if (!resp.ok) {
    const body = await parseJsonOrThrow(resp);
    throw new Error(body?.mensaje || `HTTP ${resp.status}`);
  }
  return resp.json();
}

export async function crearEntrega(payload: {
  id_actividad: number;
  id_estudiante: number;
  comentario_estudiante?: string;
  archivo_url?: string | null;
}) {
  const resp = await fetch(`${API}/entrega/entregas`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const body = await parseJsonOrThrow(resp);
    throw new Error(body?.mensaje || `HTTP ${resp.status}`);
  }
  return resp.json();
}

export async function calificarEntrega(idEntrega: number, calificacion: number, comentario_docente?: string) {
  const resp = await fetch(`${API}/entrega/entregas/${idEntrega}/calificar`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify({ calificacion, comentario_docente }),
  });
  if (!resp.ok) {
    const body = await parseJsonOrThrow(resp);
    throw new Error(body?.mensaje || `HTTP ${resp.status}`);
  }
  return resp.json();
}