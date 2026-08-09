import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { locales } from '@/i18n/routing'
import { cvFileName, getCvVersion, readGitCvVersion } from '@/lib/cv/version'

/**
 * El guardián de los documentos del currículum.
 *
 * Los PDF se generan en la máquina de quien edita, no en el despliegue, y se
 * versionan en el repositorio. Eso los expone al problema clásico de todo
 * archivo derivado que se versiona: envejecer en silencio.
 *
 * Estas pruebas cierran esa puerta. Si `content/cv/profile.yaml` cambió y
 * nadie corrió `pnpm generate:cv`, fallan acá —en tu máquina, antes de subir—
 * en lugar de publicar un currículum viejo o romper el build en Vercel.
 *
 * Reemplazan al guardián anterior, que vivía dentro del generador y detenía
 * el despliegue. Detener el despliegue no arregla nada: para entonces el
 * cambio ya se subió.
 */
describe('versión del currículum', () => {
  it('está congelada en public/downloads/version.json', () => {
    expect(() => getCvVersion()).not.toThrow()
  })

  it('coincide con el último commit del perfil', () => {
    const congelada = getCvVersion()
    const real = readGitCvVersion()

    // El mensaje importa: quien lo lea tiene que saber qué hacer sin abrir
    // este archivo.
    expect(
      congelada,
      'El currículum cambió y los documentos no se regeneraron.\n' +
        `Congelado: ${congelada.date} · ${congelada.hash}\n` +
        `Perfil:    ${real.date} · ${real.hash}\n` +
        'Corré: pnpm generate:cv',
    ).toEqual(real)
  })

  it('tiene un PDF por idioma, con el nombre que la versión dicta', () => {
    const version = getCvVersion()

    for (const locale of locales) {
      const fileName = cvFileName(locale, version)
      const ruta = join(process.cwd(), 'public', 'downloads', fileName)

      expect(existsSync(ruta), `Falta ${fileName}. Corré: pnpm generate:cv`).toBe(true)
    }
  })
})

/**
 * Ninguna página puede volver a preguntarle a git en tiempo de ejecución.
 *
 * Ese fue el fallo que dejó `/cv` devolviendo 500 en producción —y con él el
 * subdominio del perfil entero—, porque en el servidor que atiende las
 * visitas no hay repositorio. La regla es fácil de romper de nuevo sin querer:
 * `readGitCvVersion` está a un autocompletado de distancia.
 */
describe('git no se consulta al atender una visita', () => {
  it('ninguna página importa readGitCvVersion', async () => {
    const { readFileSync, readdirSync } = await import('node:fs')

    const paginas: string[] = []
    const recorrer = (dir: string) => {
      for (const entrada of readdirSync(dir, { withFileTypes: true })) {
        const ruta = join(dir, entrada.name)
        if (entrada.isDirectory()) recorrer(ruta)
        else if (/\.(tsx?|jsx?)$/.test(entrada.name)) paginas.push(ruta)
      }
    }
    recorrer(join(process.cwd(), 'app'))
    recorrer(join(process.cwd(), 'components'))

    const culpables = paginas.filter((ruta) =>
      readFileSync(ruta, 'utf8').includes('readGitCvVersion'),
    )

    expect(
      culpables,
      'readGitCvVersion lee el historial de git, que no existe en el servidor.\n' +
        'Usá getCvVersion(), que lee la versión ya congelada.',
    ).toEqual([])
  })
})

/**
 * El retrato.
 *
 * Se comprueba acá y no en `brand.test.ts` porque el guardián real es el mismo
 * que el de los PDF: los dos archivos son artefactos generados que se versionan
 * en el repositorio, y el modo de fallar es idéntico —alguien cambia la foto,
 * no corre el script, y lo que se publica es la anterior—.
 */
describe('retrato del currículum', () => {
  const RETRATOS = [
    'public/brand/retrato/juan-mujica-web.png',
    'public/brand/retrato/juan-mujica-impresion.png',
  ]

  it('los dos archivos existen', () => {
    for (const ruta of RETRATOS) {
      expect(
        existsSync(join(process.cwd(), ruta)),
        `falta ${ruta} — corré pnpm build:portrait`,
      ).toBe(true)
    }
  })

  it('salen del original que vive en el repositorio', () => {
    // Sin el original no se pueden regenerar, y el día que haya que cambiar el
    // encuadre no quedaría de dónde partir.
    expect(existsSync(join(process.cwd(), 'content/cv/retrato-original.jpg'))).toBe(true)
  })

  /**
   * Cada vista usa SU variante. Cruzarlas es el error silencioso de este
   * diseño: el de impresión sobre el fondo oscuro de la web se ve plano, y el
   * de web sobre papel imprime un cerco gris alrededor de la cara.
   */
  it('cada vista usa su propia variante', () => {
    const web = readFileSync(join(process.cwd(), 'app/[locale]/(profile)/cv/page.tsx'), 'utf8')
    const impresion = readFileSync(
      join(process.cwd(), 'app/[locale]/(profile)/cv/imprimir/page.tsx'),
      'utf8',
    )

    expect(web).toMatch(/destino="web"/)
    expect(impresion).toMatch(/destino="impresion"/)
  })

  /**
   * La versión del currículum se deriva del historial de `content/cv/`. Si
   * alguien la vuelve a atar solo a `profile.yaml`, cambiar la foto deja de
   * mover la versión y quedan dos PDF distintos con el mismo sello.
   */
  it('la versión cubre todo el contenido del currículum, no solo el perfil', () => {
    const fuente = readFileSync(join(process.cwd(), 'lib/cv/version.ts'), 'utf8')

    expect(fuente).toMatch(/const PROFILE_PATH = 'content\/cv'/)
  })
})
