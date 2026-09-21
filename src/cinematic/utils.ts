const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Antepone el basePath (GitHub Pages sirve bajo /<repo>/) a una ruta pública. */
export const withBase = (path: string) => (path.startsWith("/") ? `${BASE}${path}` : path);

/** «La *calma* también se diseña» → segmentos con `em` marcado. */
export function splitEmphasis(text: string): { text: string; em: boolean }[] {
  return text
    .split("*")
    .map((chunk, i) => ({ text: chunk, em: i % 2 === 1 }))
    .filter((c) => c.text.length > 0);
}
