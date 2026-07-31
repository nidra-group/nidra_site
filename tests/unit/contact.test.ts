import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { CONTACT_EMAIL, SENDER_EMAIL } from '@/lib/contact'

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
