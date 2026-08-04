import { buildStructuredData } from '@/lib/seo/structured-data'

/** Publica los datos estructurados del sitio. La forma vive en `lib/seo/structured-data.ts`. */
export function OrganizationJsonLd() {
  return (
    <>
      {buildStructuredData().map((data) => (
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
