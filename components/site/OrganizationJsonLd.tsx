import { publicEnv } from '@/lib/env'

export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Nidra',
    url: publicEnv.SITE_URL,
    description:
      'Agencia de desarrollo de software con inteligencia artificial para pequeñas y medianas empresas.',
    email: 'hola@nidra.cloud',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Buenos Aires',
      addressCountry: 'AR',
    },
    founder: {
      '@type': 'Person',
      name: 'Juan Mujica',
      url: publicEnv.PROFILE_URL,
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
