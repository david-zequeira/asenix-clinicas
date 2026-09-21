"use client";

import type { RefObject } from "react";
import type { CinematicReveal as Reveal } from "./types";
import { splitEmphasis } from "./utils";

type Props = {
  ref?: RefObject<HTMLDivElement | null>;
  reveal: Reveal;
  /** Sin animación: bloque en flujo normal en lugar de capa sobre el vídeo. */
  variant?: "layer" | "static";
};

/** Cierre de escena: lo que se lee cuando la película ya ocupa la pantalla. */
export default function CinematicReveal({ ref, reveal, variant = "layer" }: Props) {
  return (
    <div ref={ref} className={variant === "layer" ? "cine-layer cine-reveal" : "cine-static-reveal"}>
      {reveal.eyebrow && <p className="cine-eyebrow">{reveal.eyebrow}</p>}
      <h3 className="cine-reveal-title" style={{ marginTop: reveal.eyebrow ? "1rem" : 0 }}>
        {splitEmphasis(reveal.title).map((part, i) => (part.em ? <em key={i}>{part.text}</em> : <span key={i}>{part.text}</span>))}
      </h3>
      {reveal.text && <p className="cine-reveal-text">{reveal.text}</p>}
      {reveal.cta && (
        <div className="cine-reveal-cta">
          <a href={reveal.cta.href} className="btn btn-light">
            {reveal.cta.label}
            <span aria-hidden>→</span>
          </a>
        </div>
      )}
    </div>
  );
}
