import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import sitemap from '@/app/sitemap'
import robots from '@/app/robots'
import manifest from '@/app/manifest'
import { config } from '@/proxy'
import { getServices } from '@/lib/content'
import { buildMetadata } from '@/lib/seo/metadata'
import { ogImagePath } from '@/lib/seo/og-cards'
import { locales } from '@/i18n/routing'
import { CONTENT_UPDATED } from '@/lib/seo/content-date'
import { buildStructuredData } from '@/lib/seo/structured-data'

/**
 * El mapa del sitio es lo único que le dice a Google qué páginas existen.
 *
 * Se envió a Search Console el 4/8/2026 y descubrió las doce URLs. Si alguna
 * de estas pruebas falla, lo que se rompió es el descubrimiento del sitio
 * entero, no un detalle de formato.
 */
describe('mapa del sitio', () => {
  it('publica las seis rutas en los dos idiomas', () => {
    expect(sitemap()).toHaveLength(6 * locales.length)
  })

  it('publica las rutas traducidas, no la ruta en español con otro prefijo', () => {
    const urls = sitemap().map((e) => e.url)

    expect(urls).toContain('https://nidra.cloud/en/services')
    expect(urls).not.toContain('https://nidra.cloud/en/servicios')
  })

  it('cada entrada declara sus alternos en los dos idiomas', () => {
    for (const entry of sitemap()) {
      const idiomas = Object.keys(entry.alternates?.languages ?? {})
      expect(idiomas, `${entry.url} no declara alternos`).toEqual([...locales])
    }
  })

  /**
   * Esta es la que importa.
   *
   * `lastModified: new Date()` hacía que cada despliegue declarara las doce
   * páginas como recién modificadas, incluso al tocar solo una dependencia.
   * Google deja de creerle al `lastmod` de un sitio que siempre dice «recién»
   * y lo ignora para todo el dominio, así que la señal se pierde justo cuando
   * el contenido cambia de verdad.
   */
  it('la fecha no se mueve entre dos generaciones', () => {
    const primera = sitemap().map((e) => e.lastModified)
    const segunda = sitemap().map((e) => e.lastModified)

    expect(primera).toEqual(segunda)
    expect(primera[0]).toBe(CONTENT_UPDATED)
  })

  it('la fecha de contenido es una fecha real y no futura', () => {
    expect(CONTENT_UPDATED).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(Number.isNaN(Date.parse(CONTENT_UPDATED))).toBe(false)
    expect(Date.parse(CONTENT_UPDATED)).toBeLessThanOrEqual(Date.now())
  })
})

describe('robots', () => {
  it('permite el rastreo y anuncia el mapa del sitio', () => {
    const r = robots()

    expect(r.rules).toMatchObject({ userAgent: '*', allow: '/' })
    expect(r.sitemap).toBe('https://nidra.cloud/sitemap.xml')
  })
})

/**
 * Los datos estructurados son lo que le permite a Google entender que Nidra es
 * una empresa y no una palabra. El nombre compite con yoga nidra, una terapia
 * médica y una consultora india, así que estas señales no son decorativas.
 */
describe('datos estructurados', () => {
  const [organizacion, sitio] = buildStructuredData()

  it('declara la empresa como prestadora de servicios, no solo como entidad', () => {
    // `ProfessionalService` es subtipo de `LocalBusiness`: sin él, la dirección
    // y la zona de servicio no significan nada para el buscador.
    expect(organizacion['@type']).toContain('ProfessionalService')
    expect(organizacion['@type']).toContain('Organization')
  })

  it('la empresa y el sitio quedan unidos por @id', () => {
    // Sin este enlace son dos fichas separadas que compiten entre sí en vez de
    // describir a la misma entidad.
    expect(sitio.publisher).toEqual({ '@id': organizacion['@id'] })
  })

  it('lleva logo, que es lo que Google pide para el panel de conocimiento', () => {
    expect(organizacion.logo).toBe('https://nidra.cloud/apple-icon')
  })

  /**
   * El `sameAs` de la EMPRESA no es el mismo que el del fundador.
   *
   * Uno dice «esta empresa es la de linkedin.com/company/nidracloud»; el otro,
   * «la fundó esta persona». Confundirlos fusiona las dos entidades, que es
   * justo lo que el subdominio del perfil existe para evitar.
   */
  it('la empresa enlaza a SU página de LinkedIn, no a la del fundador', () => {
    const empresa = organizacion.sameAs as string[]

    expect(empresa).toContain('https://www.linkedin.com/company/nidracloud')
    expect(empresa.some((u) => u.includes('/in/'))).toBe(false)
  })

  it('el fundador enlaza a LinkedIn, la única presencia con antigüedad', () => {
    const fundador = organizacion.founder as { sameAs?: string[] }

    expect(fundador.sameAs?.[0]).toMatch(/linkedin\.com/)
  })

  it('el perfil del fundador no apunta a la home de la empresa', () => {
    // Diría que la página personal de Juan Mujica es la de Nidra, y fusionaría
    // las dos entidades en el índice.
    const fundador = organizacion.founder as { url: string }

    expect(fundador.url).not.toBe('https://nidra.cloud')
  })

  /**
   * La ficha no puede prometer una zona que la web no ofrece, ni callarse una
   * que sí. Nació al revés: se declaró solo Argentina mientras la portada decía
   * «Argentina y América Latina», y eso deja fuera de alcance búsquedas que sí
   * se pueden tomar.
   *
   * Se comprueba contra el texto publicado y no contra una lista fija, para que
   * cambiar la portada sin tocar la ficha rompa acá y no en silencio.
   */
  it('la zona de servicio coincide con lo que dice la portada', () => {
    const home = JSON.parse(
      readFileSync(join(process.cwd(), 'messages/es.json'), 'utf8'),
    ).home.credibility.locationDetail as string

    const zonas = (organizacion.areaServed as { name: string }[]).map((z) => z.name)

    expect(zonas).toContain('Argentina')
    for (const zona of zonas) {
      expect(home, `la portada no menciona «${zona}»`).toContain(zona)
    }
  })

  it('la fundación coincide con el año declarado en LinkedIn', () => {
    // LinkedIn admite solo año y dice 2025. Si acá se pone otro, las dos fichas
    // se contradicen y el buscador tiene un motivo para no unirlas.
    expect(organizacion.foundingDate).toMatch(/^2025(-\d{2})?$/)
  })

  it('declara los dos idiomas del sitio', () => {
    expect(organizacion.knowsLanguage).toEqual([...locales])
    expect(sitio.inLanguage).toEqual([...locales])
  })
})

/**
 * Lo que ve quien recibe un enlace del sitio por WhatsApp, LinkedIn o Slack.
 *
 * Estas comprobaciones existen porque el síntoma de que se rompan es
 * invisible: la página sigue funcionando, el enlace sigue abriendo, y lo único
 * que cambia es que la tarjeta pierde el logotipo o se queda en la versión
 * chica. Nadie revisa la vista previa de un enlace que ya funcionaba.
 */
describe('vista previa al compartir', () => {
  const meta = buildMetadata({
    locale: 'en',
    href: '/servicios',
    title: 'Services — Nidra',
    description: 'Lo que sea.',
    imagePath: ogImagePath('services', 'en'),
  })

  /**
   * Open Graph pide `idioma_TERRITORIO`. El sitio publicaba `es` a secas, que
   * no es un valor válido: el rastreador de Facebook —el mismo de WhatsApp y
   * Messenger— descarta el campo cuando no puede interpretarlo.
   */
  it('el idioma va en la forma que pide Open Graph', () => {
    expect(meta.openGraph?.locale).toBe('en_US')
    expect(buildMetadata({ locale: 'es', href: '/', title: 't', description: 'd' }).openGraph?.locale).toBe('es_AR')
  })

  it('anuncia que la página existe en el otro idioma', () => {
    expect(meta.openGraph?.alternateLocale).toEqual(['es_AR'])
  })

  /**
   * La URL de la tarjeta no termina en `.png`: es una ruta generada. Un
   * rastreador que decide por la extensión no tiene de dónde deducir el tipo, y
   * varios descartan la imagen y muestran la tarjeta chica, sin logotipo.
   */
  it('la imagen declara tamaño y tipo', () => {
    const imagenes = meta.openGraph?.images as { width: number; height: number; type: string }[]

    expect(imagenes[0]).toMatchObject({ width: 1200, height: 630, type: 'image/png' })
  })

  it('cada página anuncia su propia tarjeta, no la de la portada', () => {
    expect(JSON.stringify(meta.openGraph?.images)).toContain('/og/en/services')
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image' })
  })

  /**
   * Sin `max-image-preview: large`, Google muestra una miniatura de unos 100 px
   * o ninguna. Es el mismo activo que ya existe, mostrado grande.
   */
  it('le pide a Google la imagen grande en los resultados', () => {
    const robots = meta.robots as { googleBot: Record<string, unknown> }

    expect(robots.googleBot['max-image-preview']).toBe('large')
    expect(robots.googleBot['max-snippet']).toBe(-1)
  })

  it('las páginas que no se indexan lo dicen', () => {
    const oculta = buildMetadata({ locale: 'es', href: '/', title: 't', description: 'd', index: false })

    expect(oculta.robots).toMatchObject({ index: false, follow: false })
  })

  /**
   * Las tarjetas viven fuera del espacio traducido a propósito: si el proxy las
   * tomara, un rastreador que espera un PNG recibiría una redirección de
   * negociación de idioma. Ver `lib/seo/og-cards.ts`.
   */
  it('el proxy no toca las tarjetas', () => {
    // Next ancla el patrón a la ruta completa; `new RegExp` no lo hace solo.
    const patron = new RegExp(`^${config.matcher[0]}$`)

    expect(patron.test('/og/es/home'), '/og/es/home entra al proxy').toBe(false)
    expect(patron.test('/es/servicios')).toBe(true)
  })
})

describe('manifiesto de aplicación web', () => {
  const m = manifest()

  it('los iconos son PNG: ningún Android lee el SVG del manifiesto', () => {
    expect(m.icons?.length).toBeGreaterThan(0)
    for (const icono of m.icons ?? []) {
      expect(icono.type, `${icono.src} no es PNG`).toBe('image/png')
    }
  })

  it('los archivos que declara existen de verdad', () => {
    for (const icono of m.icons ?? []) {
      const ruta = join(process.cwd(), 'public', icono.src!)
      expect(existsSync(ruta), `falta ${icono.src} — corré pnpm build:brand`).toBe(true)
    }
  })

  /**
   * Android recorta el icono a la forma del sistema. Sin una entrada
   * `maskable`, recorta el `any` y se come las esquinas de la placa.
   */
  it('trae una versión para el recorte de Android', () => {
    expect(m.icons?.some((i) => i.purpose === 'maskable')).toBe(true)
  })
})

/**
 * El catálogo de servicios dentro de la ficha de la empresa. Es lo que
 * convierte «una empresa que existe» en «una empresa que vende estas seis
 * cosas»: sin él, el buscador tiene el nombre y la dirección, y ninguna señal
 * de qué se hace.
 */
describe('catálogo de servicios en la ficha', () => {
  it('lista los seis servicios del catálogo, no una copia escrita a mano', () => {
    const [organizacion] = buildStructuredData('es')
    const catalogo = organizacion.hasOfferCatalog as {
      itemListElement: { itemOffered: { name: string } }[]
    }

    const nombres = catalogo.itemListElement.map((o) => o.itemOffered.name)

    expect(nombres).toEqual(getServices().map((s) => s.name.es))
  })

  it('se traduce con el sitio', () => {
    const [ingles] = buildStructuredData('en')
    const catalogo = ingles.hasOfferCatalog as {
      itemListElement: { itemOffered: { name: string } }[]
    }

    expect(catalogo.itemListElement[0]?.itemOffered.name).toBe(getServices()[0]?.name.en)
  })
})
