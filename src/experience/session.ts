/**
 * Un solo identificador por visitante para la medición, el chat y la llamada:
 * así el panel de ng-agent une la visita, su origen y lo que pasó después.
 */
const KEY = "aruma.session";

export function sessionId(): string {
  try {
    let id = sessionStorage.getItem(KEY);
    if (!id) { id = "web-" + crypto.randomUUID(); sessionStorage.setItem(KEY, id); }
    return id;
  } catch {
    return "web-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

export const $ = <T extends Element = HTMLElement>(s: string, c: ParentNode = document) => c.querySelector<T>(s) as T;
export const $$ = <T extends Element = HTMLElement>(s: string, c: ParentNode = document) => [...c.querySelectorAll<T>(s)];
export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
