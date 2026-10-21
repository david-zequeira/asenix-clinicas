import { Loader, Nav, Extras } from "@/components/Chrome";
import { Hero, Intro, Tratamientos, Catalogo, Rostro, Metodo, Espacio, Stats, Doctora, Voces, Experiencia, Footer } from "@/components/Sections";
import Agent from "@/components/Agent";
import Experience from "@/experience/Experience";
import { clinic } from "@/data/clinic";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  name: clinic.name,
  url: clinic.siteUrl,
  description: clinic.description,
  telephone: "+34 " + clinic.contact.phone,
  email: clinic.contact.email,
  medicalSpecialty: "Dermatology",
  address: { "@type": "PostalAddress", streetAddress: "Calle Don Ramón de la Cruz 36, Bajo B", postalCode: "28001", addressLocality: clinic.city, addressCountry: "ES" },
  openingHoursSpecification: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "10:00", closes: "20:00" },
  employee: { "@type": "Physician", name: "Dra. Andrea Marroquín", jobTitle: "Directora médica" },
};

/**
 * Una película en nueve actos: la clínica (portada) → Aruma → tratamientos →
 * el rostro → el método → el espacio → cifras → la doctora → reseñas →
 * la experiencia, que termina en la tarjeta de reserva.
 */
export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Loader />
      <Nav />
      <main>
        <Hero />
        <Intro />
        <Tratamientos />
        <Rostro />
        <Metodo />
        <Espacio />
        <Stats />
        <Doctora />
        <Voces />
        <Experiencia />
      </main>
      <Footer />
      <Catalogo />
      <Agent />
      <Extras />
      <Experience />
    </>
  );
}
