import { clinic } from "@/data/clinic";
import { splitEmphasis } from "@/cinematic/utils";

/** Declaración editorial sobre crema: el respiro tras la primera película. */
export default function Manifesto() {
  const m = clinic.manifesto;
  return (
    <section className="bg-cream px-[6%] py-[clamp(5rem,14vw,11rem)] text-ink md:px-[8%]" data-nav="light">
      <p className="eyebrow text-clay" data-reveal>{m.eyebrow}</p>
      <h2 className="display mt-6 max-w-[22ch] text-[clamp(2rem,4.6vw,4.6rem)]" data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>
        {splitEmphasis(m.title).map((p, i) => (p.em ? <em key={i}>{p.text}</em> : <span key={i}>{p.text}</span>))}
      </h2>
      <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-[1fr_1fr] md:gap-16">
        <p className="max-w-[48ch] text-[clamp(1rem,1.25vw,1.2rem)] leading-relaxed text-clay" data-reveal>
          {m.text}
        </p>
        <ul className="grid gap-6 self-end sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
          {m.facts.map((f, i) => (
            <li key={f.value} className="border-t border-stone/60 pt-4" data-reveal style={{ "--d": `${120 + i * 90}ms` } as React.CSSProperties}>
              <p className="display text-[1.6rem]">{f.value}</p>
              <p className="mt-1 text-sm text-clay">{f.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
