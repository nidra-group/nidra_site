import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { locales, pathnames } from '@/i18n/routing'

type Section = { title: string; body: string[] }

function bloque(locale: string) {
  const m = JSON.parse(readFileSync(join(process.cwd(), `messages/${locale}.json`), 'utf8'))
  return m.legal.dataDeletion as {
    meta: { title: string; description: string }
    title: string
    updated: string
    sections: Section[]
    closing: Section[]
  }
}

const texto = (s: Section[]) => s.flatMap((x) => [x.title, ...x.body]).join(' ')

/**
 * La página de eliminación de datos la exige Meta para publicar la app, y la
 * lee dos clases de persona: un revisor que decide si la app se publica, y
 * alguien que quiere que borren lo suyo. Las dos necesitan lo mismo — una
 * dirección a la que escribir y un plazo— y ninguna de las dos puede quedarse
 * sin eso porque alguien editó el texto sin darse cuenta.
 *
 * Estas pruebas cuidan lo que el build no puede: que el texto siga diciendo lo
 * que la página existe para decir, en los dos idiomas.
 */
describe.each(locales)('eliminación de datos (%s)', (locale) => {
  const doc = bloque(locale)
  const todo = `${texto(doc.sections)} ${texto(doc.closing)}`

  it('dice a qué dirección escribir', () => {
    expect(todo).toContain('jmujica@nidra.cloud')
  })

  it('declara un plazo de respuesta y uno de borrado', () => {
    // Sin plazo, «pedí que lo borren» es una invitación sin compromiso, y es
    // lo primero que mira un revisor.
    expect(todo).toMatch(/72|30/)
  })

  it('explica cómo cortar el acceso desde la propia red', () => {
    // Revocar no depende de nosotros y es inmediato: quien quiere cortar ya
    // tiene que poder hacerlo sin esperar un correo.
    expect(todo).toMatch(/Instagram/)
    expect(todo).toMatch(/TikTok/)
  })

  it('no promete que no queda absolutamente nada', () => {
    // Queda la constancia de haber borrado. Decirlo es la diferencia entre una
    // política que se cumple y una que se firma.
    expect(todo).toMatch(/constancia|record/i)
  })

  it('tiene meta title y description', () => {
    expect(doc.meta.title.length).toBeGreaterThan(10)
    expect(doc.meta.description.length).toBeGreaterThan(30)
  })
})

describe('la ruta', () => {
  it('está declarada en el enrutador, en los dos idiomas', () => {
    // Sin esto la página existe y no se puede enlazar: el tipo de `href` la
    // rechaza y el build falla, que es exactamente lo que pasó al crearla.
    const ruta = pathnames['/eliminacion-de-datos']
    expect(ruta).toEqual({ es: '/eliminacion-de-datos', en: '/data-deletion' })
  })
})
