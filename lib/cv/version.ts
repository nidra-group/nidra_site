import { execFileSync } from 'node:child_process'

export type CvVersion = {
  hash: string
  date: string
}

const PROFILE_PATH = 'content/cv/profile.yaml'

/**
 * Versión del currículum, derivada del historial de git (FR-041, FR-045).
 *
 * Nadie mantiene un número de versión a mano: se desactualiza en el primer
 * cambio apurado. El historial de git ES el versionado del currículum.
 *
 * Si el checkout no tiene historial —algunos entornos de CI clonan de forma
 * superficial— el build falla con un mensaje explícito en vez de emitir un
 * documento con versión desconocida. Un archivo sin versión verificable es peor
 * que un build roto.
 */
export function getCvVersion(): CvVersion {
  let output: string
  try {
    output = execFileSync('git', ['log', '-1', '--format=%h|%cs', '--', PROFILE_PATH], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim()
  } catch {
    throw new Error(
      `No se pudo derivar la versión del currículum desde git.\n` +
        `El build necesita el historial de ${PROFILE_PATH}.\n` +
        `Si estás en CI, configurá el checkout con historial completo (fetch-depth: 0).`,
    )
  }

  const [hash, date] = output.split('|')

  if (!hash || !date) {
    throw new Error(
      `${PROFILE_PATH} no tiene commits en el historial.\n` +
        `Commiteá el archivo antes de construir: la versión del currículum se deriva de su último commit.`,
    )
  }

  return { hash, date }
}

/** Nombre del archivo descargable (FR-041). */
export function cvFileName(locale: string, version: CvVersion, extension = 'pdf'): string {
  return `Juan_Mujica_CV_${locale.toUpperCase()}_${version.date}_${version.hash}.${extension}`
}
