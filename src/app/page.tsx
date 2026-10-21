import { Nav, Cursor } from "@/components/Chrome";
import { Atlas, Consulta, Film, Doctora, Indice, Voces, Visita, Footer } from "@/components/Sections";
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
  address: { "@type": "PostalAddress", streetAddress: clinic.contact.street, postalCode: "28001", addressLocality: clinic.city, addressCountry: "ES" },
  openingHoursSpecification: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "10:00", closes: "20:00" },
  employee: { "@type": "Physician", name: "Dra. Andrea Marroquín", jobTitle: "Directora médica" },
};

/**
 * «Atlas del rostro»: la home es el rostro y sus zonas; debajo, una consulta
 * que se escribe con lo que cuentas, la clínica en 26 segundos, la doctora,
 * el índice completo, las voces y la visita.
 */
export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <main>
        <Atlas />
        <Consulta />
        <Film />
        <Doctora />
        <Indice />
        <Voces />
        <Visita />
      </main>
      <Footer />
      <Agent />
      <Cursor />
      <Experience />
    </>
  );
}
