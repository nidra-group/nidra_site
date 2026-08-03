import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { ESPACIOS_DE_CLIENTE } from '@/i18n/client-messages'
import { locales } from '@/i18n/routing'

const RAIZ = process.cwd()

/** Todo archivo marcado con 'use client'. */
function componentesDeCliente(): string[] {
  const encontrados: string[] = []

  const recorrer = (dir: string) => {
    for (const entrada of readdirSync(dir, { withFileTypes: true })) {
      const ruta = join(dir, entrada.name)
      if (entrada.isDirectory()) recorrer(ruta)
      else if (/\.tsx?$/.test(entrada.name)) {
        const fuente = readFileSync(ruta, 'utf8')
        if (/^['"]use client['"]/m.test(fuente)) encontrados.push(ruta)
      }
    }
  }

  recorrer(join(RAIZ, 'app'))
  recorrer(join(RAIZ, 'components'))
  return encontrados
}

/** Devuelve la rama de un diccionario, o undefined si el camino no existe. */
function rama(objeto: unknown, ruta: string): unknown {
  return ruta.split('.').reduce<unknown>((n, p) => (n as Record<string, unknown>)?.[p], objeto)
}

/**
 * El navegador recibe solo cuatro espacios de nombres, y eso es una decisión
 * de rendimiento: el diccionario entero son 19 KB serializados en CADA página.
 *
 * El costo de la decisión es que agregar un componente de cliente que traduzca
 * algo fuera de esa lista rompe `useTranslations` EN PRODUCCIÓN. En desarrollo
 * a veces no se nota, porque se navega a la página que sí lo trae.
 *
 * Estas pruebas cierran esa puerta: leen los `useTranslations` que realmente
 * aparecen en los archivos marcados con 'use client' y los comparan contra la
 * lista que el envoltorio envía.
 */
describe('mensajes que llegan al navegador', () => {
  const archivos = componentesDeCliente()

  it('hay componentes de cliente que revisar', () => {
    // Si esto falla, el detector se rompió y las pruebas de abajo pasarían
    // vacías, que es la peor forma de pasar.
    expect(archivos.length).toBeGreaterThan(0)
  })

  it('todo espacio de nombres que pide un componente de cliente se envía', () => {
    const faltantes: string[] = []

    for (const archivo of archivos) {
      const fuente = readFileSync(archivo, 'utf8')
      const pedidos = [...fuente.matchAll(/useTranslations\(\s*['"]([^'"]+)['"]\s*\)/g)].map(
        (m) => m[1]!,
      )

      for (const pedido of pedidos) {
        // Se envía si coincide, o si lo cubre un ancestro: enviar `contact`
        // cubre a `contact.form`.
        const cubierto = ESPACIOS_DE_CLIENTE.some(
          (enviado) => enviado === pedido || enviado.startsWith(`${pedido}.`),
        )
        if (!cubierto) faltantes.push(`${archivo.replace(`${RAIZ}/`, '')} → ${pedido}`)
      }
    }

    expect(
      faltantes,
      'Estos componentes corren en el navegador y piden textos que no le llegan.\n' +
        'Agregá su espacio de nombres a ESPACIOS_DE_CLIENTE en app/[locale]/layout.tsx:\n' +
        faltantes.join('\n'),
    ).toEqual([])
  })

  it.each(locales)('cada espacio enviado existe en %s', (locale) => {
    const diccionario = JSON.parse(readFileSync(join(RAIZ, `messages/${locale}.json`), 'utf8'))

    for (const ruta of ESPACIOS_DE_CLIENTE) {
      expect(rama(diccionario, ruta), `messages/${locale}.json no tiene "${ruta}"`).toBeTruthy()
    }
  })

  it('la poda sigue valiendo la pena', () => {
    const todo = readFileSync(join(RAIZ, 'messages/es.json'), 'utf8')
    const diccionario = JSON.parse(todo)
    const podado = JSON.stringify(
      Object.fromEntries(ESPACIOS_DE_CLIENTE.map((r) => [r, rama(diccionario, r)])),
    )

    // Si algún día la poda deja de ahorrar, es que casi todo pasó a ser
    // cliente, y entonces hay un problema más grande que este archivo.
    expect(podado.length).toBeLessThan(todo.length / 2)
  })
})
