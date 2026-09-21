"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Un solo IntersectionObserver para todos los [data-reveal] de la página:
 * al entrar en pantalla reciben `.is-in` y la CSS hace el resto. Más barato
 * que una timeline de GSAP por bloque de texto.
 */
export default function RevealProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.1 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return <>{children}</>;
}
