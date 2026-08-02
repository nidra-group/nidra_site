import { z } from 'zod'

import { I18nText } from '@/lib/validation/i18n'

/* -------------------------------------------------------------------------- */
/* Servicios                                                                   */
/* -------------------------------------------------------------------------- */

export const SERVICE_IDS = [
  'ai-roadmap',
  'conversational-assistants',
  'workflow-automation',
  'internal-knowledge-base',
  'custom-ai-product',
  'ai-evaluation-security',
] as const

export type ServiceId = (typeof SERVICE_IDS)[number]

const Service = z.object({
  id: z.enum(SERVICE_IDS),
  order: z.number().int().positive(),
  name: I18nText,
  // <= 120 caracteres: tiene que entrar en la tarjeta de la portada sin
  // desbordar a 320 px de ancho.
  summary: z.object({
    es: z.string().trim().min(1).max(120),
    en: z.string().trim().min(1).max(120),
  }),
  problem: I18nText,
  deliverables: z.array(I18nText).min(1, 'un servicio necesita al menos un entregable'),
  timeline: I18nText,
})

export const ServicesFile = z
  .array(Service)
  .length(6, 'FR-002: el sitio presenta exactamente seis servicios')
  .superRefine((services, ctx) => {
    const orders = services.map((s) => s.order)
    if (new Set(orders).size !== orders.length) {
      ctx.addIssue({ code: 'custom', message: 'hay valores de `order` repetidos' })
    }
    const ids = services.map((s) => s.id)
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({ code: 'custom', message: 'hay identificadores repetidos' })
    }
  })

export type Service = z.infer<typeof Service>

/* -------------------------------------------------------------------------- */
/* Integraciones                                                               */
/* -------------------------------------------------------------------------- */

const Integration = z.object({
  name: z.string().trim().min(1),
  proven: z.boolean(),
})

const IntegrationCategory = z.object({
  id: z.string().trim().min(1),
  order: z.number().int().positive(),
  name: I18nText,
  items: z.array(Integration).min(1, 'una categoría vacía es un error de contenido'),
})

export const IntegrationsFile = z
  .object({ categories: z.array(IntegrationCategory).min(1) })
  .superRefine((file, ctx) => {
    const names = file.categories.flatMap((c) => c.items.map((i) => i.name))
    const duplicated = names.filter((n, i) => names.indexOf(n) !== i)
    if (duplicated.length > 0) {
      ctx.addIssue({
        code: 'custom',
        message: `una herramienta no puede estar en dos categorías: ${[...new Set(duplicated)].join(', ')}`,
      })
    }
  })

export type Integration = z.infer<typeof Integration>
export type IntegrationCategory = z.infer<typeof IntegrationCategory>

/* -------------------------------------------------------------------------- */
/* Tecnologías                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * El enum NO incluye `partner` ni `certified`, y no es un olvido (FR-028).
 *
 * Declarar una alianza comercial inexistente exigiría cambiar este archivo, no
 * solo el contenido. El esquema hace que exagerar sea un cambio de código
 * visible en la revisión, en vez de una palabra que se cuela en un YAML.
 */
const Technology = z.object({
  name: z.string().trim().min(1),
  relationship: z.enum(['technology', 'vendor']),
  category: z.enum(['ai', 'data', 'cloud', 'dev']),
  /**
   * Identificador del logotipo en Simple Icons. Opcional a propósito: sin él
   * la tecnología se muestra como marca denominativa en texto.
   *
   * OpenAI y Amazon Web Services van sin icono porque esas empresas pidieron
   * ser retiradas de Simple Icons. Nombrarlas en texto es uso nominativo y es
   * legítimo; reproducir su logotipo sin licencia, no.
   */
  icon: z.string().trim().min(1).optional(),
})

export const TechnologiesFile = z.array(Technology).min(1)

export type Technology = z.infer<typeof Technology>
