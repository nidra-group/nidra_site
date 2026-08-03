import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { CONTACT_EMAIL, SENDER_EMAIL } from '@/lib/contact'
import { SERVICE_OPTIONS } from '@/lib/validation/inquiry'

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')

/** Toda dirección de correo que aparezca en un archivo publicable. */
function emailsIn(path: string): string[] {
  return read(path).match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? []
}

const PUBLISHED = [
  'messages/es.json',
  'messages/en.json',
  'content/cv/profile.yaml',
]

describe('dirección de contacto', () => {
  // El correo estaba escrito a mano en siete archivos. Cambiarlo y olvidarse de
  // uno publica una dirección muerta justo donde alguien intenta escribir, y
  // nada lo detecta: el sitio construye y se ve bien.
  it('ningún texto publicado nombra otra dirección', () => {
    const permitidas = new Set([CONTACT_EMAIL, SENDER_EMAIL])
    for (const path of PUBLISHED) {
      const ajenas = emailsIn(path).filter((email) => !permitidas.has(email))
      expect({ path, ajenas }).toEqual({ path, ajenas: [] })
    }
  })

  it('los documentos legales publican la dirección canónica', () => {
    // Exigido por normativa: la política de privacidad tiene que decir a dónde
    // se ejercen los derechos de acceso y supresión.
    for (const path of ['messages/es.json', 'messages/en.json']) {
      expect(read(path)).toContain(CONTACT_EMAIL)
    }
  })

  it('el remitente y el buzón viven en el dominio del sitio', () => {
    expect(CONTACT_EMAIL.endsWith('@nidra.cloud')).toBe(true)
    expect(SENDER_EMAIL.endsWith('@nidra.cloud')).toBe(true)
  })
})

/**
 * El aviso de una consulta tiene que nombrar el servicio, no su identificador.
 *
 * Durante la primera prueba real del formulario en producción, el asunto que
 * llegó al teléfono decía «Consulta — other — Lucas». El asunto es lo único
 * que se ve antes de decidir si abrir el correo ahora o más tarde, y
 * `workflow-automation` no ayuda a tomar esa decisión.
 *
 * La causa fue que la acción escribía `inquiry.service` crudo. Estas pruebas
 * comprueban que cada opción del formulario tenga una etiqueta legible en los
 * dos idiomas, que es lo que la acción resuelve antes de enviar.
 */
describe('etiqueta del servicio en el aviso', () => {
  const IDIOMAS = ['es', 'en'] as const

  function etiqueta(locale: string, option: string): string | undefined {
    const m = JSON.parse(read(`messages/${locale}.json`))
    return option === 'other' ? m.contact?.form?.serviceOther : m.services?.items?.[option]
  }

  for (const locale of IDIOMAS) {
    it(`toda opción del formulario tiene nombre en ${locale}`, () => {
      for (const option of SERVICE_OPTIONS) {
        const texto = etiqueta(locale, option)

        expect(
          texto,
          `La opción "${option}" no tiene etiqueta en messages/${locale}.json.\n` +
            'Sin ella, el asunto del aviso mostraría el identificador crudo.',
        ).toBeTruthy()

        // El identificador nunca es la etiqueta: si alguien "resuelve" el
        // hueco copiando la clave, esto lo detecta.
        expect(texto).not.toBe(option)
      }
    })
  }

  it('la acción no envía el identificador crudo', () => {
    const accion = read('actions/submit-inquiry.ts')

    expect(
      accion.includes('${inquiry.service}'),
      'actions/submit-inquiry.ts vuelve a interpolar inquiry.service.\n' +
        'Usá serviceLabel(), que lo traduce al idioma de quien consultó.',
    ).toBe(false)
  })
})
