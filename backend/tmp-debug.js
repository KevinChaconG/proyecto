const API = "http://localhost:5050";
(async () => {
  const uj = await (await fetch(API + "/usuario/usuarios")).json();
  const estudiantes = (uj.usuarios || []).filter(u => Number(u.id_rol) === 3);
  console.log("total usuarios", uj.total, "estudiantes", estudiantes.length);
  console.log("sample estudiante", estudiantes[0]);

  const aj = await (await fetch(API + "/asignatura/asignaturas")).json();
  console.log("sample asignatura", aj.asignaturas?.[0]);

  const idAsignatura = aj.asignaturas?.[0]?.id_asignatura;
  if (idAsignatura) {
    const actsj = await (await fetch(API + `/actividad/asignatura/${idAsignatura}/actividades`)).json();
    console.log("sample actividad", actsj.actividades?.[0]);
  }
})();
