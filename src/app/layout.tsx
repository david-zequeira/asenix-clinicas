import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { clinic, img } from "@/data/clinic";

// Cormorant: la serifa de la marca Aruma, fina y con cursiva propia
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(clinic.siteUrl),
  title: `${clinic.name} — ${clinic.tagline}`,
  description: clinic.description,
  alternates: { canonical: "./" },
  icons: { icon: img("isotipo", "png"), apple: img("isotipo", "png") },
  openGraph: {
    title: `${clinic.name} — ${clinic.tagline}`,
    description: clinic.description,
    type: "website",
    locale: "es_ES",
    url: "./",
    siteName: clinic.name,
    images: [{ url: img("og", "jpg"), width: 1200, height: 630, alt: clinic.name }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#1d1814", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${cormorant.variable} ${manrope.variable}`}>
      <head>
        <link rel="preload" as="image" href={img("hero-poster")} />
      </head>
      <body suppressHydrationWarning className="is-loading">
        {children}
      </body>
    </html>
  );
}
