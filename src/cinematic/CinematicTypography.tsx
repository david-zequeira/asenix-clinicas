"use client";

import type { RefObject } from "react";
import { splitEmphasis } from "./utils";

type Props = {
  titleRef: RefObject<HTMLDivElement | null>;
  subtitleRef: RefObject<HTMLParagraphElement | null>;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** La portada lleva h1; el resto de escenas, h2. */
  level?: "h1" | "h2";
};

/** Capa C: titular sobre el borde de la ventana y subtítulo en la base. */
export default function CinematicTypography({ titleRef, subtitleRef, eyebrow, title, subtitle, level = "h2" }: Props) {
  const Heading = level;
  return (
    <>
      <div ref={titleRef} className="cine-title">
        {eyebrow && <p className="cine-eyebrow">{eyebrow}</p>}
        <Heading className="cine-heading">
          {splitEmphasis(title).map((part, i) => (part.em ? <em key={i}>{part.text}</em> : <span key={i}>{part.text}</span>))}
        </Heading>
      </div>
      {subtitle && (
        <p ref={subtitleRef} className="cine-subtitle">
          {subtitle}
        </p>
      )}
    </>
  );
}
