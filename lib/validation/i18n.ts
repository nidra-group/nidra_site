import { z } from 'zod'

import { locales, type Locale } from '@/i18n/routing'

/**
 * Campo de texto bilingüe.
 *
 * Exige ambos idiomas en el mismo nodo. Esta es la pieza que hace que FR-034
 * (no publicar contenido que exista en un idioma y falte en el otro) se cumpla
 * por construcción y no por disciplina editorial: el esquema rechaza el archivo
 * si falta un idioma, y no se puede agregar un elemento en español sin abrir el
 * hueco en inglés.
 */
export const I18nText = z.object({
  es: z.string().trim().min(1, 'no puede estar vacío'),
  en: z.string().trim().min(1, 'no puede estar vacío'),
})

export type I18nText = z.infer<typeof I18nText>

export function pick(text: I18nText, locale: Locale): string {
  return text[locale]
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}
