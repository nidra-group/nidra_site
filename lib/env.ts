import { z } from 'zod'

/**
 * Validación de variables de entorno.
 *
 * Falla al arrancar nombrando la variable faltante, en lugar de romperse más
 * tarde en una ruta al azar. La constitución prohíbe secretos en el
 * repositorio: todo valor sensible llega por entorno.
 */
const serverSchema = z.object({
  RESEND_API_KEY: z.string().min(1).optional(),
  CONTACT_INBOX: z.email().optional(),
})

/**
 * El secreto que firma la marca temporal anti-bot se valida AL CARGAR EL
 * MÓDULO, no al renderizar el formulario.
 *
 * Validarlo dentro de la función que lo usa hacía que un despliegue sin la
 * variable pasara cualquier comprobación de salud —portada, servicios y CV
 * respondían 200— y solo fallara /contacto. El sitio parecía sano mientras
 * perdía el 100% de las consultas.
 */
function assertFormSecret(): void {
  if (typeof window !== 'undefined') return
  const value = process.env.FORM_SECRET
  if (process.env.NODE_ENV === 'production' && (!value || value.length < 16)) {
    throw new Error(
      'FORM_SECRET no está definida o tiene menos de 16 caracteres.\n' +
        'Es la clave que firma la marca temporal anti-bot del formulario.\n' +
        'Generá una con: openssl rand -hex 32',
    )
  }
}

assertFormSecret()

/**
 * `BOOKING_URL` y `PROFILE_URL` son OPCIONALES a propósito, y no tienen valor
 * por defecto.
 *
 * Un valor por defecto plausible pero inexistente —una página de agenda que
 * todavía no se creó, un subdominio cuyo DNS no resuelve— se publica en
 * silencio y convierte la llamada a la acción principal del sitio en un 404 sin
 * que nadie se entere. Es peor que la ausencia del enlace.
 *
 * Cuando faltan, la interfaz se adapta: la reserva no se ofrece y el perfil
 * enlaza a la ruta interna. Ver `components/site/Footer.tsx` y el uso de
 * `bookingUrl` en las páginas.
 */
const publicSchema = z.object({
  SITE_URL: z.url(),
  PROFILE_URL: z.url().optional(),
  BOOKING_URL: z.url().optional(),
  CHAT_EMBED_URL: z.url().optional(),
})

function readPublic() {
  const parsed = publicSchema.safeParse({
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://nidra.cloud',
    PROFILE_URL: process.env.NEXT_PUBLIC_PROFILE_URL || undefined,
    BOOKING_URL: process.env.NEXT_PUBLIC_BOOKING_URL || undefined,
    CHAT_EMBED_URL: process.env.NEXT_PUBLIC_CHAT_EMBED_URL || undefined,
  })

  if (!parsed.success) {
    const detail = parsed.error.issues.map((i) => `NEXT_PUBLIC_${i.path.join('.')}: ${i.message}`)
    throw new Error(`Variables de entorno públicas inválidas:\n${detail.join('\n')}`)
  }

  return parsed.data
}

export const publicEnv = readPublic()

/**
 * Configuración del canal de correo.
 *
 * Es opcional a propósito: el sitio se construye y se publica sin credenciales
 * de correo. Sin ellas el formulario informa que el canal no está disponible y
 * ofrece la vía alternativa, en vez de romper el build.
 */
export function getEmailConfig(): { apiKey: string; inbox: string } | null {
  const parsed = serverSchema.safeParse({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_INBOX: process.env.CONTACT_INBOX,
  })

  if (!parsed.success || !parsed.data.RESEND_API_KEY || !parsed.data.CONTACT_INBOX) {
    return null
  }

  return { apiKey: parsed.data.RESEND_API_KEY, inbox: parsed.data.CONTACT_INBOX }
}

export const isChatEnabled = Boolean(publicEnv.CHAT_EMBED_URL)

/** Enlace de agenda, o `null` si todavía no se configuró. */
export const bookingUrl = publicEnv.BOOKING_URL ?? null

/** Base del espacio profesional. Sin subdominio configurado, vive en el sitio. */
export const profileBaseUrl = publicEnv.PROFILE_URL ?? publicEnv.SITE_URL

/**
 * A dónde lleva «ver el perfil completo», según dónde viva el perfil.
 *
 * Con subdominio configurado es su raíz —`jmujica.nidra.cloud/es`—, que es la
 * dirección limpia que el proxy sirve. Sin subdominio es la ruta interna
 * `/es/cv`.
 *
 * Existe porque no es una simple concatenación: en el subdominio el perfil
 * vive en la raíz y agregarle `/cv` daría una dirección que solo redirige.
 * Cada página que arme ese enlace a mano se equivoca en uno de los dos casos.
 */
export function profileHref(locale: string): string {
  return publicEnv.PROFILE_URL ? `${publicEnv.PROFILE_URL}/${locale}` : `/${locale}/cv`
}
