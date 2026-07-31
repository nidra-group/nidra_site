import { describe, expect, it } from 'vitest'

import {
  InquirySchema,
  idempotencyKey,
  issueTimestamp,
  verifyTimestamp,
} from '@/lib/validation/inquiry'

const valid = {
  name: 'Juan Pérez',
  email: 'juan@ejemplo.com',
  company: 'Acme',
  service: 'workflow-automation' as const,
  message: 'Tenemos un proceso de carga manual que consume seis horas por semana.',
  locale: 'es' as const,
}

describe('esquema de consulta', () => {
  it('acepta una consulta válida', () => {
    expect(InquirySchema.safeParse(valid).success).toBe(true)
  })

  it('rechaza un correo mal formado con la clave de traducción esperada', () => {
    const result = InquirySchema.safeParse({ ...valid, email: 'no-es-un-correo' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('emailInvalid')
    }
  })

  it('rechaza un mensaje demasiado corto', () => {
    const result = InquirySchema.safeParse({ ...valid, message: 'hola' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('messageTooShort')
    }
  })

  it('rechaza un servicio que no está en el catálogo', () => {
    expect(InquirySchema.safeParse({ ...valid, service: 'inventado' }).success).toBe(false)
  })

  it('la empresa es opcional', () => {
    const { company: _company, ...sinEmpresa } = valid
    expect(InquirySchema.safeParse(sinEmpresa).success).toBe(true)
  })
})

describe('marca temporal firmada', () => {
  const now = 1_800_000_000_000

  it('acepta un token con antigüedad suficiente', () => {
    const token = issueTimestamp(now)
    expect(verifyTimestamp(token, now + 5_000)).toBe(true)
  })

  it('rechaza un envío instantáneo: ningún humano completa en menos de 3 s', () => {
    const token = issueTimestamp(now)
    expect(verifyTimestamp(token, now + 500)).toBe(false)
  })

  it('rechaza un formulario de hace más de una hora', () => {
    const token = issueTimestamp(now)
    expect(verifyTimestamp(token, now + 61 * 60 * 1000)).toBe(false)
  })

  it('rechaza una firma alterada', () => {
    const token = issueTimestamp(now)
    const [value] = token.split('.')
    expect(verifyTimestamp(`${value}.0000000000000000000000000000ffff`, now + 5_000)).toBe(false)
  })

  it('rechaza una marca temporal adelantada sin firma válida', () => {
    expect(verifyTimestamp(`${now}.deadbeef`, now + 5_000)).toBe(false)
  })
})

describe('clave de idempotencia', () => {
  const now = 1_800_000_000_000

  it('dos envíos idénticos en la misma ventana comparten clave', () => {
    expect(idempotencyKey(valid, now)).toBe(idempotencyKey(valid, now + 60_000))
  })

  it('cambia al cambiar el contenido', () => {
    expect(idempotencyKey(valid, now)).not.toBe(
      idempotencyKey({ ...valid, message: `${valid.message} Otra cosa más.` }, now),
    )
  })

  it('cambia al pasar a la ventana siguiente', () => {
    expect(idempotencyKey(valid, now)).not.toBe(idempotencyKey(valid, now + 11 * 60 * 1000))
  })
})
