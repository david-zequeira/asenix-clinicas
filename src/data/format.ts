import { treatments } from "./treatments";

/** Un dato publicado de un tratamiento («Sesión», «Efecto», «Precio»…), si lo hay. */
export const fact = (slug: string, k: string) => treatments[slug]?.facts.find((f) => f.k === k)?.v;

/** Una línea de fichas en mono: «30 min · 9–12 meses · desde 390 € · por vial». */
export const factLine = (slug: string) =>
  [fact(slug, "Sesión"), fact(slug, "Efecto"), fact(slug, "Precio")?.replace("Desde", "desde")].filter(Boolean).join(" · ");
