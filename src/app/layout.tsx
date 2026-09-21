import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import RevealProvider from "@/components/providers/RevealProvider";
import { clinic } from "@/data/clinic";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(clinic.siteUrl),
  title: `${clinic.name} — ${clinic.tagline}`,
  description: clinic.description,
  alternates: { canonical: "./" },
  openGraph: {
    title: `${clinic.name} — ${clinic.tagline}`,
    description: clinic.description,
    type: "website",
    locale: "es_ES",
    url: "./",
    siteName: clinic.name,
    images: [{ url: clinic.scenes.hero.media.poster, width: 1920, height: 1080, alt: clinic.name }],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body suppressHydrationWarning className={`${fraunces.variable} ${instrument.variable}`}>
        <SmoothScroll>
          <RevealProvider>{children}</RevealProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
