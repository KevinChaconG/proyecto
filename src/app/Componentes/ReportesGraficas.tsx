'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ReportesGraficas() {

  const matriculadosPorClase = {
    labels: ['Matemática', 'Español', 'Ciencias', 'Inglés', 'Historia'],
    datasets: [
      {
        label: 'Estudiantes matriculados',
        data: [25, 18, 30, 22, 15],
      },
    ],
  };

  const promedioCalificaciones = {
    labels: ['Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      {
        label: 'Promedio de calificaciones',
        data: [78, 82, 80, 85, 88],
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4">Reportes</h2>

      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Matriculados por clase</h5>
              <Bar data={matriculadosPorClase} />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Promedio de calificaciones (mensual)</h5>
              <Line data={promedioCalificaciones} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
