import { clinic } from "@/data/clinic";
import { splitEmphasis } from "@/cinematic/utils";

/** Tres pasos con el titular pegado (sticky) mientras la lista pasa por delante. */
export default function Method() {
  const m = clinic.method;
  return (
    <section className="bg-cream px-[6%] py-[clamp(5rem,12vw,10rem)] text-ink md:px-[8%]" data-nav="light">
      <div className="grid gap-12 md:grid-cols-[1fr_1.1fr] md:gap-20">
        <div className="md:sticky md:top-32 md:self-start">
          <p className="eyebrow text-clay" data-reveal>{m.eyebrow}</p>
          <h2 className="display mt-6 text-[clamp(2.4rem,5vw,5rem)]" data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>
            {splitEmphasis(m.title).map((p, i) => (p.em ? <em key={i}>{p.text}</em> : <span key={i}>{p.text}</span>))}
          </h2>
        </div>
        <ol className="grid gap-10 md:gap-14">
          {m.steps.map((s, i) => (
            <li key={s.n} className="grid grid-cols-[3.5rem_1fr] gap-4 border-t border-stone/60 pt-6" data-reveal style={{ "--d": `${i * 100}ms` } as React.CSSProperties}>
              <span className="display text-[1.4rem] text-oak">{s.n}</span>
              <div>
                <h3 className="display text-[clamp(1.6rem,2.6vw,2.4rem)]">{s.title}</h3>
                <p className="mt-3 max-w-[46ch] text-[0.98rem] leading-relaxed text-clay">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
