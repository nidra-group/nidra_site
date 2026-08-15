import { defineRouting } from 'next-intl/routing'

export const locales = ['es', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'es'

/**
 * Traducción de segmentos de ruta.
 *
 * La clave es la ruta interna (el nombre de la carpeta en `app/`), el valor es
 * la URL pública por idioma. Publicar `/en/servicios` cumpliría la letra de
 * FR-030 pero no su propósito: una URL en inglés con el segmento en español es
 * peor para el posicionamiento y le dice al visitante que el sitio no está
 * realmente traducido.
 *
 * Estas URLs son permanentes desde la publicación (FR-056). Cambiar un segmento
 * después exige una redirección en `lib/seo/redirects.ts`.
 */
export const pathnames = {
  '/': '/',
  '/servicios': { es: '/servicios', en: '/services' },
  '/integraciones': { es: '/integraciones', en: '/integrations' },
  '/contacto': { es: '/contacto', en: '/contact' },
  '/privacidad': { es: '/privacidad', en: '/privacy' },
  '/terminos': { es: '/terminos', en: '/terms' },
  // La URL de eliminación de datos la lee un revisor de Meta y la tipea un
  // humano que quiere borrar lo suyo: se escribe entera y sin abreviar.
  '/eliminacion-de-datos': { es: '/eliminacion-de-datos', en: '/data-deletion' },
  '/cv': '/cv',
  '/cv/imprimir': { es: '/cv/imprimir', en: '/cv/print' },
} as const

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
  pathnames,
})
