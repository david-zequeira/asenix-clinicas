"use client";

import { useEffect, useState } from "react";
import { clinic } from "@/data/clinic";

type Theme = "dark" | "light";

/**
 * Barra fija y transparente. Observa qué sección hay bajo ella (cada sección
 * declara data-nav="dark|light") y cambia la tinta para leerse siempre.
 */
export default function Navbar() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-nav]"));
    const read = () => {
      const y = 40; // punto de lectura: la altura del texto de la barra
      const under = sections.find((s) => {
        const r = s.getBoundingClientRect();
        return r.top <= y && r.bottom > y;
      });
      if (under) setTheme((under.dataset.nav as Theme) ?? "dark");
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, []);

  return (
    <header className="nav fixed inset-x-0 top-0 z-50 flex items-center justify-between px-[4%] py-5 md:px-[8%]" data-theme={theme}>
      <a href="#inicio" className="font-display text-xl tracking-tight md:text-2xl">
        {clinic.name}
      </a>
      <nav className="hidden items-center gap-8 text-[0.72rem] uppercase tracking-[0.24em] md:flex" aria-label="Secciones">
        <a href="#tratamientos" className="opacity-80 transition-opacity hover:opacity-100">Tratamientos</a>
        <a href="#espacio" className="opacity-80 transition-opacity hover:opacity-100">El espacio</a>
        <a href="#equipo" className="opacity-80 transition-opacity hover:opacity-100">Equipo</a>
      </nav>
      <a href="#reserva" className="nav-pill rounded-full px-4 py-2 text-[0.72rem] uppercase tracking-[0.2em]">
        Reservar
      </a>
    </header>
  );
}
