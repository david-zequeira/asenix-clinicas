/* eslint-disable @next/next/no-img-element -- export estático: las imágenes ya salen optimizadas del pipeline */
import { clinic, img } from "@/data/clinic";

/** Barra superior: marca, índice de capítulos en mono y la cita siempre a mano. */
export function Nav() {
  return (
    <>
      <div className="progress" data-progress />
      <nav className="nav" data-nav>
        <a className="brand" href="#atlas" aria-label={`${clinic.name}, inicio`}><img src={img("logo-aruma-texto")} alt="" width={720} height={315} /></a>
        <div className="menu" data-menu>
          <a href="#atlas">Atlas</a>
          <a href="#consulta">Consulta</a>
          <a href="#clinica">Clínica</a>
          <a href="#doctora">Doctora</a>
          <a href="#indice">Índice</a>
        </div>
        <div className="end"><a className="pill" href="#consulta"><span className="dot" />Reservar</a></div>
      </nav>
    </>
  );
}

export function Cursor() {
  return <div className="cursor" data-cursor aria-hidden="true"><i /></div>;
}
