import { CONTACT_EMAIL } from '@/lib/contact'
import { publicEnv } from '@/lib/env'

export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Nidra',
    url: publicEnv.SITE_URL,
    description:
      'Desarrollo de software con inteligencia artificial para pequeñas y medianas empresas.',
    email: CONTACT_EMAIL,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Buenos Aires',
      addressCountry: 'AR',
    },
    founder: {
      '@type': 'Person',
      name: 'Juan Mujica',
      // Sin subdominio configurado, el perfil vive dentro del sitio. Apuntar a
      // la home diría que la página personal de Juan Mujica es la de la empresa.
      url: `${publicEnv.PROFILE_URL ?? `${publicEnv.SITE_URL}/es/cv`}`,
    },
  }

  return (
    <script
      type="application/ld+json"
      // El contenido es un objeto construido en el servidor, no entrada de
      // usuario: no hay superficie de inyección.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
