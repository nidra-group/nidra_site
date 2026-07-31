import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { parse } from 'yaml'
import type { ZodType } from 'zod'

import { ServicesFile, IntegrationsFile, TechnologiesFile } from './schemas'
import { Profile } from './profile-schema'

const CONTENT_DIR = join(process.cwd(), 'content')

/**
 * Lee y valida un archivo de contenido.
 *
 * Un archivo inválido rompe el build con un mensaje que nombra la ruta exacta
 * del dato. Un error de validación que obliga a buscar a mano dónde está el
 * problema es un error de validación mal escrito.
 */
function load<T>(relativePath: string, schema: ZodType<T>): T {
  const absolute = join(CONTENT_DIR, relativePath)
  const raw = parse(readFileSync(absolute, 'utf8'))
  const result = schema.safeParse(raw)

  if (!result.success) {
    const detail = result.error.issues
      .map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join('.') : '(raíz)'
        return `  content/${relativePath} → ${path}: ${issue.message}`
      })
      .join('\n')

    throw new Error(`Contenido inválido en content/${relativePath}:\n${detail}`)
  }

  return result.data
}

export function getServices() {
  return load('services.yaml', ServicesFile).sort((a, b) => a.order - b.order)
}

export function getIntegrations() {
  const file = load('integrations.yaml', IntegrationsFile)
  return file.categories
    .sort((a, b) => a.order - b.order)
    .map((category) => ({
      ...category,
      // Las probadas primero dentro de su categoría (Anexo A, regla 3).
      items: [...category.items].sort((a, b) => Number(b.proven) - Number(a.proven)),
    }))
}

export function getTechnologies() {
  return load('technologies.yaml', TechnologiesFile)
}

export function getProfile() {
  const profile = load('cv/profile.yaml', Profile)
  return {
    ...profile,
    experiences: [...profile.experiences].sort((a, b) => b.start.localeCompare(a.start)),
    skills: [...profile.skills].sort((a, b) => a.order - b.order),
  }
}

/** Años de experiencia, derivados de la experiencia más antigua. */
export function getYearsOfExperience(profile: Profile): number {
  const earliest = profile.experiences.reduce(
    (min, exp) => (exp.start < min ? exp.start : min),
    profile.experiences[0]?.start ?? '',
  )
  const startYear = Number(earliest.slice(0, 4))
  return new Date().getFullYear() - startYear
}
