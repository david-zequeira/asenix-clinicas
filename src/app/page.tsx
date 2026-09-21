import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Manifesto from "@/components/sections/Manifesto";
import Treatments from "@/components/sections/Treatments";
import Method from "@/components/sections/Method";
import Booking from "@/components/sections/Booking";
import CinematicScene from "@/cinematic/CinematicScene";
import { clinic } from "@/data/clinic";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dentist",
  name: clinic.name,
  url: clinic.siteUrl,
  description: clinic.description,
  telephone: clinic.contact.phone,
  email: clinic.contact.email,
  address: { "@type": "PostalAddress", streetAddress: clinic.contact.address, addressLocality: clinic.city, addressCountry: "ES" },
};

/**
 * Una película en tres actos con respiros editoriales entre ellos:
 * recepción → manifiesto + tratamientos → consulta → método → equipo → reserva.
 */
export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main>
        <CinematicScene scene={clinic.scenes.hero} priority />
        <Manifesto />
        <Treatments />
        <CinematicScene scene={clinic.scenes.consulta} />
        <Method />
        <CinematicScene scene={clinic.scenes.equipo} />
        <Booking />
      </main>
      <Footer />
    </>
  );
}
