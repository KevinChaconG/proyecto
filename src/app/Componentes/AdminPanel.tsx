"use client";

import React, { useState } from "react";

type Seccion = "usuarios" | "cursos" | "reportes";

interface AdminPanelProps {
  logoSrc?: string;
  logoAlt?: string;
  tituloApp?: string;
}

export default function AdminPanel({
  logoSrc = "/logo.svg",          
  logoAlt = "Logo de Synapsis",
  tituloApp = "Panel de Administración",
}: AdminPanelProps) {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>("usuarios");

  function renderContenido() {
    switch (seccionActiva) {
      case "usuarios":
        return (
          <section>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Gestión de Usuarios</h2>
              {/* Aquí puedes agregar botones de acción, filtros, etc. */}
            </div>

            {/* Contenedor base para que tu compañero agregue la UI */}
            <div className="card shadow-sm">
              <div className="card-body">
                {/* 
                  Aquí va el componente/tabla de usuarios conectado al backend.
                  Ejemplo:
                  <TablaUsuarios />
                */}
              </div>
            </div>
          </section>
        );

      case "cursos":
        return (
          <section>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Gestión de Cursos</h2>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                {/* 
                  Aquí va el componente/tabla de cursos conectado al backend.
                  Ejemplo:
                  <TablaCursos />
                */}
              </div>
            </div>
          </section>
        );

      case "reportes":
        return (
          <section>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Reportes</h2>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                {/* 
                  Aquí van gráficos, tablas o widgets de reportes.
                  Ejemplo:
                  <ResumenReportes />
                */}
              </div>
            </div>
          </section>
        );
    }
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* HEADER SUPERIOR CON LOGO */}
      <header className="border-bottom bg-white">
        <div className="container-fluid py-3 px-4 d-flex flex-wrap align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: 200,
                height: 48,
                borderRadius: "12px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Puedes sustituir <img> por <Image> de Next si quieres */}
              <img
                src={logoSrc}
                alt={logoAlt}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div>
             <h1 className="h4 mb-0 mx-auto text-center">{tituloApp}</h1>

            </div>
          </div>

          {/* Espacio para usuario / botón salir si lo necesitas */}
          <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
            {/* 
              Aquí puedes agregar info de usuario logueado o un botón de logout.
              Ejemplo:
              <span className="text-muted">Admin</span>
              <button className="btn btn-outline-secondary btn-sm">Salir</button>
            */}
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <div className="container-fluid px-4 py-4">
        <div className="row g-3">
          {/* NAV DE SECCIONES (HORIZONTAL) */}
          <div className="col-12">
            <div className="card border-0 bg-transparent">
              <div className="card-body p-0">
                <ul className="nav nav-pills flex-wrap gap-2">
                  <li className="nav-item">
                    <button
                      className={
                        "nav-link " +
                        (seccionActiva === "usuarios" ? "active" : "")
                      }
                      onClick={() => setSeccionActiva("usuarios")}
                    >
                      Gestión de Usuarios
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={
                        "nav-link " +
                        (seccionActiva === "cursos" ? "active" : "")
                      }
                      onClick={() => setSeccionActiva("cursos")}
                    >
                      Gestión de Cursos
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={
                        "nav-link " +
                        (seccionActiva === "reportes" ? "active" : "")
                      }
                      onClick={() => setSeccionActiva("reportes")}
                    >
                      Reportes
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* SECCIÓN ACTIVA */}
          <div className="col-12">{renderContenido()}</div>
        </div>
      </div>
    </div>
  );
}
