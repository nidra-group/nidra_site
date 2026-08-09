import type { Locale } from '@/i18n/routing'
import { buildStructuredData } from '@/lib/seo/structured-data'

/**
 * Publica los datos estructurados del sitio. La forma vive en
 * `lib/seo/structured-data.ts`.
 *
 * Recibe el idioma porque el catálogo de servicios va nombrado: la ficha en
 * inglés tiene que decir «Assessment and roadmap», no el nombre en español.
 */
export function OrganizationJsonLd({ locale }: { locale: Locale }) {
  return (
    <>
      {buildStructuredData(locale).map((data) => (
        <script
          key={String(data['@id'])}
          type="application/ld+json"
          // El contenido es un objeto construido en el servidor, no entrada de
          // usuario: no hay superficie de inyección.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </>
  )
}
