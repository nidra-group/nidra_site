import { describe, expect, it } from 'vitest'

import sitemap from '@/app/sitemap'
import robots from '@/app/robots'
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

  it('declara los dos idiomas del sitio', () => {
    expect(organizacion.knowsLanguage).toEqual([...locales])
    expect(sitio.inLanguage).toEqual([...locales])
  })
})
