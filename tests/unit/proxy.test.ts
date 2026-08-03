import { NextRequest, NextResponse } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

/**
 * `next-intl/middleware` no resuelve bajo vitest: importa `next/server` con un
 * especificador que el resolvedor de Node rechaza. Se sustituye por un doble
 * que marca sus respuestas, lo que además permite AFIRMAR que el dominio
 * comercial se le entrega intacto, en vez de solo comprobar que no se rompió.
 */
const marcado = () => {
  const r = NextResponse.next()
  r.headers.set('x-doble-intl', 'sí')
  return r
}
vi.mock('next-intl/middleware', () => ({ default: () => marcado }))

const { default: middleware } = await import('@/proxy')

/**
 * El subdominio del perfil tiene UNA sola forma de cada dirección.
 *
 * Se escribió después de encontrar en producción que el botón «volver al
 * sitio» del currículum no hacía nada y que el selector de idioma sacaba a la
 * vista el `/cv` que el subdominio existe para esconder. Las dos cosas eran el
 * mismo error: enlaces internos resueltos contra la ruta ya reescrita.
 *
 * La parte que le toca al proxy es que ninguna dirección con `/cv` sobreviva
 * en la barra: venga de donde venga el enlace, termina en la forma limpia.
 */
function pedir(url: string) {
  const { host } = new URL(url)
  return middleware(new NextRequest(url, { headers: { host, 'accept-language': 'es' } }))
}

const SUB = 'https://jmujica.nidra.cloud'

describe('subdominio del perfil', () => {
  it('sirve el currículum en la raíz del idioma, sin redirigir', () => {
    const r = pedir(`${SUB}/es`)
    expect(r.headers.get('location')).toBeNull()
    expect(r.headers.get('x-middleware-rewrite')).toContain('/es/cv')
  })

  it.each([
    [`${SUB}/es/cv`, '/es'],
    [`${SUB}/en/cv`, '/en'],
    [`${SUB}/es/cv/imprimir`, '/es/imprimir'],
  ])('%s se manda a la forma limpia %s', (desde, hacia) => {
    const r = pedir(desde)
    expect(r.status).toBe(308)
    expect(new URL(r.headers.get('location') ?? '').pathname).toBe(hacia)
  })

  it('sin idioma en la ruta, negocia uno', () => {
    const r = pedir(`${SUB}/`)
    expect(new URL(r.headers.get('location') ?? '').pathname).toBe('/es')
  })

  it('la vista de impresión sigue llegando a su ruta real', () => {
    const r = pedir(`${SUB}/es/imprimir`)
    expect(r.headers.get('x-middleware-rewrite')).toContain('/es/cv/imprimir')
  })
})

describe('el dominio comercial no se toca', () => {
  it.each(['https://nidra.cloud/es', 'https://nidra.cloud/es/cv', 'https://nidra.cloud/en/services'])(
    '%s se entrega al enrutado por idioma, sin reescribir ni redirigir',
    (url) => {
      const r = pedir(url)
      expect(r.headers.get('x-doble-intl')).toBe('sí')
      expect(r.headers.get('location')).toBeNull()
    },
  )
})
