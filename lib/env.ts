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
  CONTACT_INBOX: z.string().email().optional(),
})

const publicSchema = z.object({
  SITE_URL: z.string().url(),
  PROFILE_URL: z.string().url(),
  BOOKING_URL: z.string().url(),
  CHAT_EMBED_URL: z.string().url().optional(),
})

function readPublic() {
  const parsed = publicSchema.safeParse({
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nidra.cloud',
    PROFILE_URL: process.env.NEXT_PUBLIC_PROFILE_URL ?? 'https://jmujica.nidra.cloud',
    BOOKING_URL: process.env.NEXT_PUBLIC_BOOKING_URL ?? 'https://cal.com/nidra/30min',
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
