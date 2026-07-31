import { z } from 'zod'

import { I18nText } from '@/lib/validation/i18n'

const YearMonth = z
  .string()
  .regex(/^\d{4}-\d{2}$/, 'debe tener formato YYYY-MM')
  .refine((value) => {
    const now = new Date()
    const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return value <= current
  }, 'fecha futura')

const Experience = z.object({
  id: z.string().trim().min(1),
  org: z.string().trim().min(1),
  client: z.string().trim().min(1).optional(),
  start: YearMonth,
  // Ausente = puesto vigente.
  end: YearMonth.optional(),
  role: I18nText,
  achievements: z.array(I18nText).min(1, 'una experiencia sin logros no aporta'),
  tech: z.array(z.string().trim().min(1)).default([]),
})

export const Profile = z
  .object({
    person: z.object({
      name: z.string().trim().min(1),
      headline: I18nText,
      location: I18nText,
      email: z.email('correo inválido'),
      phone: z.string().trim().min(1).optional(),
      links: z
        .array(
          z.object({
            type: z.string().trim().min(1),
            label: z.string().trim().min(1),
            url: z.url().startsWith('https://', 'los enlaces deben ser https'),
          }),
        )
        .default([]),
    }),
    summary: I18nText,
    experiences: z.array(Experience).min(1),
    education: z
      .array(
        z.object({
          institution: z.string().trim().min(1),
          start: z.union([z.number().int(), z.string()]),
          end: z.union([z.number().int(), z.string()]).optional(),
          degree: I18nText,
        }),
      )
      .default([]),
    certifications: z.array(z.object({ name: I18nText })).default([]),
    skills: z
      .array(
        z.object({
          order: z.number().int().positive(),
          category: I18nText,
          items: z.array(z.string().trim().min(1)).min(1),
        }),
      )
      .default([]),
    languages: z.array(z.object({ name: I18nText, level: I18nText })).default([]),
  })
  .superRefine((profile, ctx) => {
    // FR-048: cronología consistente.
    profile.experiences.forEach((exp, index) => {
      if (exp.end && exp.end < exp.start) {
        ctx.addIssue({
          code: 'custom',
          path: ['experiences', index, 'end'],
          message: `end (${exp.end}) anterior a start (${exp.start})`,
        })
      }
    })

    const current = profile.experiences.filter((e) => !e.end)
    if (current.length > 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['experiences'],
        message: `${current.length} puestos vigentes (${current
          .map((e) => e.id)
          .join(', ')}). Solo uno puede estarlo`,
      })
    }

    const ids = profile.experiences.map((e) => e.id)
    const duplicated = ids.filter((id, i) => ids.indexOf(id) !== i)
    if (duplicated.length > 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['experiences'],
        message: `id duplicado: ${[...new Set(duplicated)].join(', ')}`,
      })
    }
  })

export type Profile = z.infer<typeof Profile>
export type Experience = z.infer<typeof Experience>
