import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export type CvVersion = {
  hash: string
  date: string
}

const PROFILE_PATH = 'content/cv/profile.yaml'
const VERSION_FILE = join(process.cwd(), 'public', 'downloads', 'version.json')

/**
 * Versión del currículum (FR-041, FR-045).
 *
 * Nadie mantiene un número de versión a mano: se desactualiza en el primer
 * cambio apurado. El historial de git ES el versionado del currículum.
 *
 * Pero git se consulta UNA vez, al generar los documentos, y el resultado se
 * congela en `public/downloads/version.json`, que se versiona junto a los PDF
 * que describe.
 *
 * Antes esta función preguntaba a git en cada render, y la página del
 * currículum es dinámica. En Vercel eso devolvía 500: el repositorio se usa
 * para construir, no viaja al servidor que responde a las visitas. Como el
 * subdominio del perfil sirve esta misma ruta, el espacio profesional entero
 * quedaba caído. Se comprobó levantando el servidor de producción sin `git`
 * en el PATH: la portada respondía 200 y `/cv` respondía 500.
 *
 * La comprobación de que el archivo sigue al día vive en
 * `tests/unit/cv-version.test.ts`, que falla en tu máquina si editaste el
 * perfil y no regeneraste. Es el mismo guardián, pero avisa antes de subir
 * en vez de romper el despliegue.
 */
export function getCvVersion(): CvVersion {
  let raw: string
  try {
    raw = readFileSync(VERSION_FILE, 'utf8')
  } catch {
    throw new Error(
      `Falta public/downloads/version.json.\n` +
        `Es la versión congelada del currículum, y se genera junto a los PDF.\n` +
        `Generala con: pnpm generate:cv`,
    )
  }

  const parsed: unknown = JSON.parse(raw)
  const { hash, date } = (parsed ?? {}) as Partial<CvVersion>

  if (typeof hash !== 'string' || typeof date !== 'string' || !hash || !date) {
    throw new Error(
      `public/downloads/version.json no tiene un hash y una fecha válidos.\n` +
        `Regeneralo con: pnpm generate:cv`,
    )
  }

  return { hash, date }
}

/**
 * La versión según el historial de git, que es la fuente original.
 *
 * La usan el generador de documentos —para saber qué congelar— y la prueba
 * que compara lo congelado contra la realidad. Nunca la usa una página: en
 * tiempo de ejecución no hay repositorio.
 */
export function readGitCvVersion(): CvVersion {
  let output: string
  try {
    output = execFileSync('git', ['log', '-1', '--format=%h|%cs', '--', PROFILE_PATH], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim()
  } catch {
    throw new Error(
      `No se pudo leer el historial de git para ${PROFILE_PATH}.\n` +
        `Este comando se corre en tu máquina, sobre el repositorio completo.`,
    )
  }

  const [hash, date] = output.split('|')

  if (!hash || !date) {
    throw new Error(
      `${PROFILE_PATH} no tiene commits en el historial.\n` +
        `Commiteá el archivo antes de generar: la versión se deriva de su último commit.`,
    )
  }

  return { hash, date }
}

/** Nombre del archivo descargable (FR-041). */
export function cvFileName(locale: string, version: CvVersion, extension = 'pdf'): string {
  return `Juan_Mujica_CV_${locale.toUpperCase()}_${version.date}_${version.hash}.${extension}`
}
