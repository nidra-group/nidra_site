import { getPathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { publicEnv } from '@/lib/env'

type Href = Parameters<typeof getPathname>[0]['href']

/**
 * La ruta de migas de pan de una página interior, para el buscador.
 *
 * Es lo que hace que el resultado en Google se lea «Nidra › Servicios» en vez
 * de mostrar la URL cruda. No hay migas visibles en la interfaz —el sitio es
 * plano, un solo nivel— y no hace falta que las haya: el dato describe la
 * jerarquía real, que existe aunque la navegación no la dibuje.
 *
 * Dos niveles, que es toda la profundidad que tiene el sitio. Si algún día hay
 * páginas de tercer nivel, esto pasa a recibir una lista.
 */
export function BreadcrumbJsonLd({
  locale,
  href,
  name,
}: {
  locale: Locale
  href: Href
  /** El nombre de la sección tal como lo ve el visitante, no el del archivo. */
  name: string
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        // La raíz es la marca, no una palabra traducible: es lo que Google
        // dibuja como primer eslabón y lo que el visitante reconoce.
        name: 'Nidra',
        item: `${publicEnv.SITE_URL}${getPathname({ href: '/', locale })}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name,
        item: `${publicEnv.SITE_URL}${getPathname({ href, locale })}`,
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      // Objeto construido en el servidor desde el catálogo de rutas, no entrada
      // de usuario: no hay superficie de inyección.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
