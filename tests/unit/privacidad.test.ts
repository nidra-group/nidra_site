import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { locales } from '@/i18n/routing'

type Section = { title: string; body: string[] }

function privacidad(locale: string) {
  const m = JSON.parse(readFileSync(join(process.cwd(), `messages/${locale}.json`), 'utf8'))
  return m.legal.privacy as {
    sections: Section[]
    assistantPending: Section[]
    assistant: Section[]
    closing: Section[]
  }
}

const texto = (s: Section[]) => s.flatMap((x) => [x.title, ...x.body]).join(' ')

/**
 * La política de privacidad tiene dos estados y ninguno puede mentir.
 *
 * Con el asistente apagado el sitio no tiene base de datos. Con el asistente
 * encendido guarda transcripciones completas en Estados Unidos. `LegalDocument`
 * elige el bloque con `NEXT_PUBLIC_CHAT_EMBED_URL`, la misma variable que monta
 * el widget, para que sea imposible publicar uno sin la otra.
 *
 * Estas pruebas cuidan lo que ese mecanismo no puede cuidar solo: que el texto
 * del estado encendido diga efectivamente lo que hay que declarar.
 */
describe('política de privacidad', () => {
  it.each(locales)('los cuatro bloques existen en %s', (locale) => {
    const p = privacidad(locale)

    for (const bloque of ['sections', 'assistantPending', 'assistant', 'closing'] as const) {
      expect(p[bloque]?.length, `Falta o está vacío "${bloque}" en ${locale}`).toBeGreaterThan(0)
    }
  })

  it('los dos idiomas tienen la misma cantidad de secciones', () => {
    const [es, en] = [privacidad('es'), privacidad('en')]

    for (const bloque of ['sections', 'assistantPending', 'assistant', 'closing'] as const) {
      expect(es[bloque].length, `"${bloque}" no coincide entre idiomas`).toBe(en[bloque].length)
    }
  })

  it.each(locales)('con el asistente encendido se declara lo que exige la ley, en %s', (locale) => {
    const t = texto(privacidad(locale).assistant)

    // La transferencia internacional es el punto que más pesa para la Ley
    // 25.326: omitirlo es lo que convierte la política en incompleta.
    expect(t, 'No declara que los datos salen del país').toMatch(
      locale === 'es' ? /transferencia internacional/i : /international transfer/i,
    )
    expect(t, 'No nombra dónde se almacenan').toMatch(
      locale === 'es' ? /Estados Unidos/i : /United States/i,
    )
    // Los tres destinatarios reales del contenido de la conversación.
    expect(t, 'No nombra a OpenAI, que es quien más contenido ve').toMatch(/OpenAI/)
    expect(t, 'No nombra a Supabase, donde viven las conversaciones').toMatch(/Supabase/)
    expect(t, 'No menciona Cal.com, que recibe datos al hacer clic en agendar').toMatch(/Cal\.com/)
    // El plazo tiene que estar escrito: sin plazo no hay derecho de supresión
    // verificable.
    expect(t, 'No dice cuánto se conservan las conversaciones').toMatch(
      locale === 'es' ? /doce meses/i : /twelve months/i,
    )
  })

  it.each(locales)('el estado apagado no promete de más, en %s', (locale) => {
    const p = privacidad(locale)
    const visibleHoy = texto([...p.sections, ...p.assistantPending, ...p.closing])

    // Mientras el asistente no exista, la política NO debe hablar de
    // transcripciones ni de proveedores que todavía no procesan nada.
    for (const proveedor of ['OpenAI', 'Supabase']) {
      expect(
        visibleHoy,
        `Con el asistente apagado, la política nombra a ${proveedor} sin que procese nada.`,
      ).not.toMatch(new RegExp(proveedor))
    }
  })

  it.each(locales)('la afirmación sobre la base de datos sigue siendo cierta en %s', (locale) => {
    const t = texto(privacidad(locale).sections)

    // Antes decía «el sitio no guarda las consultas en ninguna base de datos»,
    // en absoluto. Con el asistente eso pasa a ser falso, así que la frase se
    // acotó al formulario, que es donde sigue siendo verdad en ambos estados.
    const absoluta = locale === 'es' ? /el sitio no guarda las consultas/i : /the site stores no/i
    expect(
      t,
      'La frase volvió a ser absoluta. Con el asistente encendido sería falsa:\n' +
        'acotala al formulario de consulta.',
    ).not.toMatch(absoluta)
  })
})
