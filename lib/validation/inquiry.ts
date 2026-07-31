import { createHmac, createHash, timingSafeEqual } from 'node:crypto'

import { z } from 'zod'

import { SERVICE_IDS } from '@/lib/content/schemas'

export const SERVICE_OPTIONS = [...SERVICE_IDS, 'other'] as const

/**
 * Esquema de la consulta.
 *
 * Los mensajes son CLAVES DE TRADUCCIÓN, no texto renderizado: el componente
 * las resuelve en el idioma activo. Devolver texto desde acá haría aparecer
 * mensajes en español dentro de la página en inglés (FR-029).
 */
export const InquirySchema = z.object({
  name: z.string().trim().min(2, 'nameTooShort').max(100, 'nameTooShort'),
  email: z.string().trim().min(1, 'emailRequired').max(254).pipe(z.email('emailInvalid')),
  company: z.string().trim().max(120).optional().or(z.literal('')),
  service: z.enum(SERVICE_OPTIONS, { message: 'serviceRequired' }),
  message: z
    .string()
    .trim()
    .min(20, 'messageTooShort')
    .max(2000, 'messageTooLong'),
  locale: z.enum(['es', 'en']),
})

export type Inquiry = z.infer<typeof InquirySchema>

/* -------------------------------------------------------------------------- */
/* Marca temporal firmada (FR-016, capa 2)                                     */
/* -------------------------------------------------------------------------- */

const MIN_AGE_MS = 3_000 // menos de 3 s no es humano
const MAX_AGE_MS = 60 * 60 * 1000 // más de 1 h es un formulario viejo

function secret(): string {
  // En desarrollo no hay secreto configurado; se usa uno fijo para que el
  // formulario funcione localmente. En producción llega por entorno.
  return process.env.FORM_SECRET ?? 'nidra-dev-secret'
}

export function issueTimestamp(now = Date.now()): string {
  const value = String(now)
  const signature = createHmac('sha256', secret()).update(value).digest('hex').slice(0, 32)
  return `${value}.${signature}`
}

export function verifyTimestamp(token: string, now = Date.now()): boolean {
  const [value, signature] = token.split('.')
  if (!value || !signature) return false

  const expected = createHmac('sha256', secret()).update(value).digest('hex').slice(0, 32)
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false

  const age = now - Number(value)
  return age >= MIN_AGE_MS && age <= MAX_AGE_MS
}

/* -------------------------------------------------------------------------- */
/* Idempotencia (FR-017)                                                       */
/* -------------------------------------------------------------------------- */

const WINDOW_MS = 10 * 60 * 1000

/**
 * Clave derivada del contenido del envío y de una ventana de diez minutos.
 *
 * Dos envíos idénticos dentro de la misma ventana producen un solo correo, y se
 * consigue SIN almacenar nada: la clave viaja al proveedor de correo, que la
 * deduplica. Es lo que permite cumplir FR-017 respetando la decisión de no
 * persistir consultas (RD-004).
 */
export function idempotencyKey(inquiry: Inquiry, now = Date.now()): string {
  const window = Math.floor(now / WINDOW_MS)
  return createHash('sha256')
    .update(`${inquiry.email}|${inquiry.message}|${window}`)
    .digest('hex')
    .slice(0, 40)
}
