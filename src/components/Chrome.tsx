/* eslint-disable @next/next/no-img-element -- export estático: las imágenes ya salen optimizadas del pipeline */
import { clinic, img } from "@/data/clinic";

/** Lo que envuelve la película: fondo que cambia de color, cargador, barra de progreso y navegación. */
export function Loader() {
  return (
    <>
      <div className="bgm" data-bgm aria-hidden="true" />
      <div className="loader" data-loader>
        <div className="panel t" />
        <div className="panel b" />
        <div className="center">
          <div className="word" data-loader-word>
            <img className="mk" src={img("isotipo", "png")} alt="" data-ld-mark />
            <img className="wd" src={img("logo-aruma-texto")} alt="" data-ld-word />
          </div>
        </div>
        <div className="meta">
          <span>{clinic.tagline}</span>
          <span className="count" data-count-loader>00</span>
        </div>
        <div className="bar" data-loader-bar />
      </div>
      <div className="progress" data-progress />
    </>
  );
}

export function Nav() {
  return (
    <nav className="nav" data-nav>
      <a className="brand" href="#top" data-cursor="Inicio" aria-label={`${clinic.name}, inicio`}>
        <img className="wd" src={img("logo-aruma-texto")} alt="" width={720} height={315} />
        <img className="mk" src={img("isotipo", "png")} alt="" width={480} height={475} />
      </a>
      <ul>
        <li><a href="#tratamientos"><small>01</small>tratamientos</a></li>
        <li><a href="#doctora"><small>02</small>la doctora</a></li>
        <li><a href="#reserva"><small>03</small>reservar</a></li>
      </ul>
    </nav>
  );
}

export function Extras() {
  return (
    <>
      <div className="cursor" data-cursor-el aria-hidden="true"><div className="ring" data-ring /><div className="dot" data-dot /></div>
      <div className="grain" aria-hidden="true" />
    </>
  );
}
