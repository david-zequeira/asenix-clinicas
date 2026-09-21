"use client";

import { useState } from "react";
import clsx from "clsx";
import { clinic } from "@/data/clinic";
import { withBase } from "@/cinematic/utils";

/**
 * Lista editorial numerada. En escritorio, al pasar por una fila aparece un
 * fotograma de la película a la derecha: el catálogo sigue dentro del mismo mundo.
 */
export default function Treatments() {
  const [active, setActive] = useState(0);
  const items = clinic.treatments;

  return (
    <section id="tratamientos" className="bg-cream px-[6%] pb-[clamp(5rem,12vw,10rem)] text-ink md:px-[8%]" data-nav="light">
      <div className="flex items-end justify-between border-b border-stone/60 pb-6">
        <p className="eyebrow text-clay" data-reveal>Tratamientos</p>
        <p className="hidden text-sm text-clay md:block" data-reveal>Cinco especialidades, un mismo criterio.</p>
      </div>

      <div className="mt-10 grid gap-12 md:grid-cols-[1.2fr_1fr] md:gap-16">
        <ol>
          {items.map((t, i) => (
            <li
              key={t.n}
              className={clsx("treatment-row grid grid-cols-[3rem_1fr] items-baseline gap-4 py-6 md:grid-cols-[4rem_1fr_1.2fr] md:py-7")}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              data-reveal
              style={{ "--d": `${i * 60}ms` } as React.CSSProperties}
            >
              <span className="text-xs tracking-[0.2em] text-clay">{t.n}</span>
              <h3 className="display text-[clamp(1.7rem,3vw,2.8rem)]">{t.name}</h3>
              <p className="col-start-2 max-w-[40ch] text-sm leading-relaxed text-clay md:col-start-3 md:text-[0.95rem]">{t.text}</p>
            </li>
          ))}
        </ol>

        <div className="relative hidden aspect-[4/5] overflow-hidden rounded-[20px] bg-sand md:block" aria-hidden data-reveal>
          {items.map((t, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={t.n}
              src={withBase(t.still)}
              alt=""
              className={clsx(
                "treatment-still absolute inset-0 h-full w-full object-cover",
                i === active ? "opacity-100 scale-100" : "opacity-0 scale-[1.06]",
              )}
              loading="lazy"
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-bone">
            <span className="eyebrow">{items[active].name}</span>
            <span className="text-xs tracking-[0.2em]">{items[active].n} / {String(items.length).padStart(2, "0")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
