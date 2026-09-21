import { clinic } from "@/data/clinic";
import { splitEmphasis } from "@/cinematic/utils";

/** Cierre: dos formas de reservar y los datos prácticos. Sin formularios. */
export default function Booking() {
  const b = clinic.booking;
  const c = clinic.contact;
  return (
    <section id="reserva" className="bg-cream px-[6%] py-[clamp(5rem,14vw,11rem)] text-ink md:px-[8%]" data-nav="light">
      <p className="eyebrow text-clay" data-reveal>{b.eyebrow}</p>
      <h2 className="display mt-6 max-w-[14ch] text-[clamp(2.8rem,7vw,7rem)]" data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>
        {splitEmphasis(b.title).map((p, i) => (p.em ? <em key={i}>{p.text}</em> : <span key={i}>{p.text}</span>))}
      </h2>
      <div className="mt-12 grid gap-12 md:grid-cols-[1.2fr_1fr] md:gap-20">
        <div>
          <p className="max-w-[46ch] text-[clamp(1rem,1.25vw,1.2rem)] leading-relaxed text-clay" data-reveal>{b.text}</p>
          <div className="mt-8 flex flex-wrap gap-4" data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
            <a href={c.whatsapp} target="_blank" rel="noopener" className="btn btn-dark">
              Escribir por WhatsApp <span aria-hidden>→</span>
            </a>
            <a href={c.phoneHref} className="btn btn-ghost">
              Llamar {c.phone}
            </a>
          </div>
        </div>
        <dl className="grid gap-6 self-end text-sm sm:grid-cols-2 md:grid-cols-1">
          {[
            ["Dirección", c.address],
            ["Horario", c.hours],
            ["Correo", c.email],
          ].map(([k, v], i) => (
            <div key={k} className="border-t border-stone/60 pt-4" data-reveal style={{ "--d": `${140 + i * 80}ms` } as React.CSSProperties}>
              <dt className="eyebrow text-clay">{k}</dt>
              <dd className="mt-2 text-base">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
