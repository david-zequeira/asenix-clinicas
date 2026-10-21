/** Iconos de trazo fino, del mismo juego que la web de Ozio. */
const stroke = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const Arrow = ({ w = 1.75 }: { w?: number }) => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth={w} aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const ArrowLeft = () => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth={1.6} aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
);
export const Spark = () => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth={1.6} aria-hidden="true"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.4 2.4M15.3 15.3l2.4 2.4M6.3 17.7l2.4-2.4M15.3 8.7l2.4-2.4" /></svg>
);
export const Bubble = () => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth={1.6} aria-hidden="true"><path d="M20 12.5a7.5 7.5 0 0 1-11.2 6.5L4 20l1.1-4.3A7.5 7.5 0 1 1 20 12.5Z" /><path d="M9 11.5h6M9 14.5h4" /></svg>
);
export const Close = () => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth={1.6} aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const Mic = () => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth={1.6} aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
);
export const Quote = () => (
  <svg className="mark" viewBox="0 0 62 52" fill="currentColor" aria-hidden="true"><path d="M0 52V27C0 11 7 3 22 0l2 8c-8 3-11 8-11 15h11v29zM38 52V27c0-16 7-24 22-27l2 8c-8 3-11 8-11 15h11v29z" /></svg>
);
