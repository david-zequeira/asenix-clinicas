/* eslint-disable @next/next/no-img-element -- export estático */
import { clinic, img } from "@/data/clinic";

/** La voz de la asistente: el sello para llamar y su ventana. Por escrito, la asistente vive en «La consulta». */
export default function Agent() {
  const n = clinic.agent.name;
  const mark = <img src={img("isotipo", "png")} alt="" aria-hidden="true" />;
  return (
    <>
      <button className="voz-fab" type="button" data-voz-open aria-label={`Llamar a ${n}: citas y dudas sobre tratamientos por voz`}>
        {mark}<span className="t" aria-hidden="true">Hablar con {n}</span>
      </button>
      <div className="voz" data-voz data-state="idle" role="dialog" aria-modal="true" aria-label={`Llamada con ${n}`} hidden>
        <div className="voz-in">
          <div className="voz-brand">Citas y tratamientos<img src={img("logo-aruma-texto")} alt={clinic.name} /></div>
          <div className="voz-orb" data-voz-orb><i>{mark}</i></div>
          <div className="voz-status" data-voz-status aria-live="polite" />
          <p className="voz-line" data-voz-line aria-live="polite" />
          <form className="voz-form" data-voz-form hidden>
            <div className="row">
              <input type="email" inputMode="email" autoComplete="email" placeholder="tu@correo.com" aria-label="Tu correo" data-voz-email required />
              <button type="submit">Enviar</button>
            </div>
            <small data-voz-form-note aria-live="polite" />
          </form>
          <div className="voz-actions">
            <button type="button" data-voz-mute aria-pressed="false" hidden><span>Silenciar</span></button>
            <button type="button" className="hang" data-voz-hang hidden>Colgar</button>
            <button type="button" data-voz-retry hidden>Volver a llamar</button>
            <button type="button" data-voz-write>Escribir</button>
            <button type="button" data-voz-close>Cerrar</button>
          </div>
          <p className="voz-legal">Te atiende una asistente virtual. La llamada se graba para atención al paciente y gestión de citas.</p>
        </div>
      </div>
    </>
  );
}
