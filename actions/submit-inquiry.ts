'use server'

import { headers } from 'next/headers'
import { Resend } from 'resend'

import { SENDER_EMAIL } from '@/lib/contact'
import { getEmailConfig } from '@/lib/env'
import {
  InquirySchema,
  idempotencyKey,
  verifyTimestamp,
  type Inquiry,
} from '@/lib/validation/inquiry'

export type InquiryResult =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'invalid'; errors: Record<string, string>; values: Record<string, string> }
  | { status: 'failed'; reason: 'delivery' | 'rate_limit' | 'rejected' | 'unavailable'; values: Record<string, string> }

/* -------------------------------------------------------------------------- */
/* Límite de frecuencia (FR-016, capa 3)                                       */
/* -------------------------------------------------------------------------- */

const RATE_LIMIT = 5
const RATE_WINDOW_MS = 10 * 60 * 1000
const hits = new Map<string, number[]>()

/**
 * Limitador en memoria, por instancia.
 *
 * Es deliberadamente simple: sin almacén compartido no puede ser exacto entre
 * instancias. Para el volumen de un sitio institucional alcanza, y evita meter
 * una base de datos solo para contar envíos —lo que contradiría la decisión de
 * no persistir nada (RD-004) y el principio de simplicidad.
 */
function withinRateLimit(fingerprint: string, now = Date.now()): boolean {
  const recent = (hits.get(fingerprint) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  if (recent.length >= RATE_LIMIT) {
    hits.set(fingerprint, recent)
    return false
  }
  recent.push(now)
  hits.set(fingerprint, recent)
  return true
}

function textBody(inquiry: Inquiry): string {
  return [
    `Nombre:   ${inquiry.name}`,
    `Correo:   ${inquiry.email}`,
    `Empresa:  ${inquiry.company || '—'}`,
    `Servicio: ${inquiry.service}`,
    `Idioma:   ${inquiry.locale}`,
    '',
    'Consulta:',
    inquiry.message,
  ].join('\n')
}

async function deliver(inquiry: Inquiry): Promise<boolean> {
  const config = getEmailConfig()
  if (!config) return false

  const resend = new Resend(config.apiKey)
  const key = idempotencyKey(inquiry)

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const { error } = await resend.emails.send(
        {
          from: `Nidra <${SENDER_EMAIL}>`,
          to: config.inbox,
          replyTo: inquiry.email,
          subject: `[Nidra] Consulta — ${inquiry.service} — ${inquiry.name}`,
          // El contenido del visitante se envía como texto plano: nunca se
          // interpreta como HTML.
          text: textBody(inquiry),
        },
        { idempotencyKey: key },
      )

      if (!error) return true

      // Registro sin datos personales (FR-015).
      console.error('[inquiry] fallo de entrega', {
        attempt: attempt + 1,
        code: error.name,
        at: new Date().toISOString(),
      })
    } catch (cause) {
      console.error('[inquiry] excepción de entrega', {
        attempt: attempt + 1,
        code: cause instanceof Error ? cause.name : 'unknown',
        at: new Date().toISOString(),
      })
    }

    // Retroceso exponencial: 1 s, 4 s.
    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, (attempt + 1) ** 2 * 1000))
    }
  }

  return false
}

export async function submitInquiry(
  _previous: InquiryResult,
  formData: FormData,
): Promise<InquiryResult> {
  const raw = Object.fromEntries(formData.entries())
  const values: Record<string, string> = {
    name: String(raw.name ?? ''),
    email: String(raw.email ?? ''),
    company: String(raw.company ?? ''),
    service: String(raw.service ?? ''),
    message: String(raw.message ?? ''),
  }

  // Capa 1: campo trampa. Un bot que rellena todo campo del DOM se delata.
  if (String(raw.website ?? '') !== '') {
    return { status: 'failed', reason: 'rejected', values }
  }

  // Capa 2: marca temporal firmada.
  if (!verifyTimestamp(String(raw.ts ?? ''))) {
    return { status: 'failed', reason: 'rejected', values }
  }

  const parsed = InquirySchema.safeParse({ ...values, locale: String(raw.locale ?? 'es') })

  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? 'form')
      errors[field] ??= issue.message
    }
    return { status: 'invalid', errors, values }
  }

  // Capa 3: límite de frecuencia.
  const headerList = await headers()
  const fingerprint = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!withinRateLimit(fingerprint)) {
    return { status: 'failed', reason: 'rate_limit', values }
  }

  if (!getEmailConfig()) {
    return { status: 'failed', reason: 'unavailable', values }
  }

  const delivered = await deliver(parsed.data)
  if (!delivered) {
    return { status: 'failed', reason: 'delivery', values }
  }

  return { status: 'success' }
}
