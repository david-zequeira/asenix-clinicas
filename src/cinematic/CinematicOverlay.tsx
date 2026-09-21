"use client";

import type { RefObject } from "react";
import type { CinematicCard } from "./types";

type Props = {
  overlayRef: RefObject<HTMLDivElement | null>;
  metaRef: RefObject<HTMLDivElement | null>;
  card?: CinematicCard;
  meta?: string[];
  scrollHint?: string;
};

/** Capa C: tarjeta flotante sobre la ventana y metadatos con la pista de scroll. */
export default function CinematicOverlay({ overlayRef, metaRef, card, meta = [], scrollHint = "Desliza" }: Props) {
  return (
    <>
      {card && (
        <div ref={overlayRef} className="cine-overlay">
          <p className="cine-overlay-label">{card.label}</p>
          <p className="cine-overlay-value">{card.value}</p>
          {card.note && <p className="cine-overlay-note">{card.note}</p>}
        </div>
      )}
      <div ref={metaRef} className="cine-meta" aria-hidden>
        {meta.map((m) => (
          <span key={m}>{m}</span>
        ))}
        <span className="cine-meta-line" />
        <span>{scrollHint}</span>
      </div>
    </>
  );
}
