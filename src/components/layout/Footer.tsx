import { clinic } from "@/data/clinic";

export default function Footer() {
  return (
    <footer className="bg-night px-[6%] py-10 text-bone md:px-[8%]" data-nav="dark">
      <div className="flex flex-col gap-6 border-t border-bone/15 pt-8 text-xs tracking-[0.12em] md:flex-row md:items-center md:justify-between">
        <p className="font-display text-lg tracking-tight">{clinic.name}</p>
        <div className="flex flex-wrap gap-6 uppercase opacity-70">
          <a href="#">Aviso legal</a>
          <a href="#">Privacidad</a>
          <a href="#">Cookies</a>
        </div>
        <p className="opacity-50">© {new Date().getFullYear()} · Web por Asenix</p>
      </div>
    </footer>
  );
}
