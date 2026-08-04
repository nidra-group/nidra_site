import { CONTACT_EMAIL } from '@/lib/contact'
import { getProfile } from '@/lib/content'
import { publicEnv } from '@/lib/env'

const DESCRIPTION =
  'Agencia de desarrollo de software con inteligencia artificial para pequeñas y medianas empresas.'

/**
 * Datos estructurados del sitio comercial.
 *
 * Se publican dos objetos enlazados por `@id` en lugar de uno solo:
 *
 * - `Organization` + `ProfessionalService` describe a la EMPRESA. El segundo
 *   tipo es un subtipo de `LocalBusiness`, y es lo que convierte a la dirección
 *   y a `areaServed` en señales de negocio local en vez de datos sueltos.
 * - `WebSite` describe al SITIO, y existe sobre todo por el nombre. «Nidra»
 *   compite en los buscadores con yoga nidra, una terapia médica y una
 *   consultora india: declarar el nombre de forma explícita es lo que permite
 *   que aparezca como «Nidra» y no como «nidra.cloud» en los resultados.
 *
 * El enlace por `@id` le dice al buscador que la empresa y el sitio son la
 * misma entidad. Sin él son dos fichas separadas que compiten entre sí.
 *
 * Vive fuera del componente para que las pruebas puedan leerlo: el entorno de
 * pruebas es Node y no renderiza React.
 */
type Entidad = Record<string, unknown> & { '@id': string }

/** Siempre son dos —empresa y sitio—, y el tipo lo dice para que quien las lea no tenga que comprobarlo. */
export function buildStructuredData(): [organizacion: Entidad, sitio: Entidad] {
  const profile = getProfile()
  const linkedin = profile.person.links.find((link) => link.type === 'linkedin')

  const organizationId = `${publicEnv.SITE_URL}/#organization`

  const organization = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'ProfessionalService'],
    '@id': organizationId,
    name: 'Nidra',
    url: publicEnv.SITE_URL,
    description: DESCRIPTION,
    email: CONTACT_EMAIL,
    // Google exige un logo cuadrado de al menos 112 px para el panel de
    // conocimiento. `/apple-icon` ya lo genera a 180×180.
    logo: `${publicEnv.SITE_URL}/apple-icon`,
    image: `${publicEnv.SITE_URL}/opengraph-image`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Buenos Aires',
      addressCountry: 'AR',
    },
    // Sale de `content/cv/profile.yaml`, que declara «Buenos Aires, Argentina ·
    // Remoto». Si mañana se atiende fuera del país, esto hay que ampliarlo: una
    // zona declarada de más es peor que ninguna, porque atrae consultas que no
    // se pueden tomar.
    areaServed: { '@type': 'Country', name: 'Argentina' },
    knowsLanguage: ['es', 'en'],
    founder: {
      '@type': 'Person',
      name: profile.person.name,
      // Sin subdominio configurado, el perfil vive dentro del sitio. Apuntar a
      // la home diría que la página personal de Juan Mujica es la de la empresa.
      url: publicEnv.PROFILE_URL ?? `${publicEnv.SITE_URL}/es/cv`,
      // `sameAs` es lo que le permite al buscador unir esta ficha con el perfil
      // de LinkedIn, que hoy es la única presencia con antigüedad y enlaces.
      ...(linkedin ? { sameAs: [linkedin.url] } : {}),
    },
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${publicEnv.SITE_URL}/#website`,
    name: 'Nidra',
    url: publicEnv.SITE_URL,
    description: DESCRIPTION,
    inLanguage: ['es', 'en'],
    publisher: { '@id': organizationId },
  }

  return [organization, website]
}
