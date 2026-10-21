/* eslint-disable @next/next/no-img-element -- export estático */
import { clinic, img } from "@/data/clinic";
import { Bubble, Close, Arrow } from "./Icons";

/** La asistente de Aruma: el sello para llamar, el botón de escribir y sus dos ventanas. */
export default function Agent() {
  const n = clinic.agent.name;
  const mark = <img src={img("isotipo", "png")} alt="" aria-hidden="true" />;
  return (
    <>
      <button className="voz-fab" type="button" data-voz-open aria-label={`Llamar a ${n}: reservas y dudas sobre tratamientos por voz`}>
        {mark}<span className="t" aria-hidden="true">Hablar con {n}</span>
      </button>
      <div className="voz" data-voz data-state="idle" role="dialog" aria-modal="true" aria-label={`Llamada con ${n}`} hidden>
        <div className="voz-in">
          <div className="voz-brand">Reservas y tratamientos<img src={img("logo-aruma-texto")} alt={clinic.name} /></div>
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
            <button type="button" data-chat-open>Escribir</button>
            <button type="button" data-voz-close>Cerrar</button>
          </div>
          <p className="voz-legal">Te atiende una asistente virtual. La llamada se graba para atención al paciente y gestión de citas.</p>
        </div>
      </div>

      <button className="chat-fab" type="button" data-chat-open aria-label={`Escribir a ${n}: reservas y dudas sobre tratamientos por chat`}>
        <Bubble /><span className="t" aria-hidden="true">Escribir</span>
      </button>
      <section className="chat" data-chat role="dialog" aria-modal="false" aria-labelledby="chat-title" data-busy="false" data-lenis-prevent hidden>
        <header className="chat-head">
          <span className="dot" aria-hidden="true">{mark}</span>
          <div className="who"><b id="chat-title">{n}</b><small>Concierge · citas y tratamientos</small></div>
          <button className="chat-x" type="button" data-chat-close aria-label="Cerrar el chat"><Close /></button>
        </header>
        <div className="chat-list" data-chat-list aria-label={`Conversación con ${n}`} />
        <div className="chat-chips" data-chat-chips>
          {clinic.chips.map((c) => <button type="button" key={c}>{c}</button>)}
        </div>
        <form className="chat-form" data-chat-form>
          <textarea rows={1} maxLength={2000} placeholder="Escribe tu mensaje…" aria-label={`Tu mensaje para ${n}`} autoComplete="off" enterKeyHint="send" data-chat-input />
          <button className="chat-send" type="submit" aria-label="Enviar" data-chat-send disabled><Arrow w={1.9} /></button>
        </form>
        <p className="chat-legal">Te atiende una asistente virtual. No sustituye a la valoración médica. Guardamos la conversación para gestionar tu cita.</p>
        <p className="sr-only" data-chat-live aria-live="polite" />
      </section>
    </>
  );
}
