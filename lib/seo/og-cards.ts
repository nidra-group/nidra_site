import es from '@/messages/es.json'
import en from '@/messages/en.json'
import { getProfile, getYearsOfExperience } from '@/lib/content'
import type { Locale } from '@/i18n/routing'
import type { Tarjeta } from '@/lib/seo/og-card'

/**
 * Qué texto lleva la tarjeta de cada página.
 *
 * ── POR QUÉ ESTAS RUTAS Y NO LAS DEL SITIO ────────────────────────────────
 * La tarjeta NO vive en el segmento de su página. La convención de Next
 * —`opengraph-image.tsx` dentro de la carpeta— serviría la imagen inglesa en
 * `/en/servicios/opengraph-image`, porque la traducción del segmento la hace
 * el proxy y solo para rutas que estén en el mapa. La imagen no está en el
 * mapa, así que la dirección pública de la página en inglés no tendría
 * tarjeta.
 *
 * Por eso viven en `/og/<idioma>/<página>`, fuera del espacio traducido y
 * fuera del proxy (ver el `matcher` de `proxy.ts`). Son direcciones de un
 * activo, no del sitio: nadie las escribe ni las comparte.
 *
 * ── DE DÓNDE SALE EL TEXTO ────────────────────────────────────────────────
 * De los mismos mensajes que ve el visitante, no de una copia. Una tarjeta con
 * su propio texto se desincroniza del titular al primer cambio de redacción, y
 * el síntoma es invisible: nadie revisa la vista previa de un enlace que ya
 * funcionaba.
 */

const MENSAJES = { es, en } as const

/** Las páginas con tarjeta propia. El resto hereda la de la portada. */
export const OG_SLUGS = ['home', 'services', 'integrations', 'contact', 'cv'] as const

export type OgSlug = (typeof OG_SLUGS)[number]

/**
 * La dirección de la tarjeta, para anunciarla en los metadatos.
 *
 * El identificador de página es el mismo en los dos idiomas —`services`, no
 * `servicios`— porque esto no es una dirección del sitio: es la de un activo.
 * Traducirlo daría dos nombres para el mismo archivo sin que nadie lo lea.
 */
export function ogImagePath(slug: OgSlug, locale: Locale): string {
  return `/og/${locale}/${slug}`
}

/**
 * La primera oración de la descripción.
 *
 * Las descripciones para buscadores van hasta 160 caracteres, que a 29 px son
 * cuatro líneas y tapan el titular. La primera oración es, en todas, la que
 * dice qué es la página; el resto amplía.
 */
function primeraOracion(texto: string): string {
  const corte = texto.indexOf('. ')
  return corte === -1 ? texto : texto.slice(0, corte + 1)
}

/** El titular real de la página: el sitio lo parte en dos para poder acentuar la segunda mitad. */
function titular(seccion: { title: string; titleAccent: string }): string {
  return `${seccion.title} ${seccion.titleAccent}`
}

export function ogCopy(slug: OgSlug, locale: Locale): Tarjeta {
  const m = MENSAJES[locale]

  switch (slug) {
    case 'home':
      return {
        eyebrow: m.home.hero.eyebrow,
        title: titular(m.home.hero),
        subtitle: primeraOracion(m.home.meta.description),
      }
    case 'services':
      return {
        eyebrow: m.services.eyebrow,
        title: titular(m.services),
        subtitle: primeraOracion(m.services.meta.description),
      }
    case 'integrations':
      return {
        eyebrow: m.integrations.eyebrow,
        title: titular(m.integrations),
        subtitle: primeraOracion(m.integrations.meta.description),
      }
    case 'contact':
      return {
        eyebrow: m.contact.eyebrow,
        title: titular(m.contact),
        subtitle: primeraOracion(m.contact.meta.description),
      }
    /**
     * El currículum no tiene la forma de las demás: es el espacio del fundador,
     * no una sección del sitio comercial, y su título ya trae las dos partes
     * separadas por raya —«Juan Mujica — Ingeniero de IA»—. Se parte ahí en vez
     * de agregar claves nuevas a los dos diccionarios para decir lo mismo.
     *
     * Los años se calculan del propio currículum: escritos a mano se
     * desincronizan solos el 1 de enero.
     */
    case 'cv': {
      const [nombre, cargo] = m.cv.meta.title.split('—').map((parte) => parte.trim())
      const years = getYearsOfExperience(getProfile())
      return {
        eyebrow: nombre ?? 'Nidra',
        title: cargo ?? m.cv.meta.title,
        subtitle: primeraOracion(m.cv.meta.description.replace('{years}', String(years))),
      }
    }
  }
}
