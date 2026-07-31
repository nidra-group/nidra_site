import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import es from '@/messages/es.json'
import en from '@/messages/en.json'
import { getServices, getIntegrations, getTechnologies, getProfile, getYearsOfExperience } from '@/lib/content'
import { ServicesFile, TechnologiesFile } from '@/lib/content/schemas'
import { Profile } from '@/lib/content/profile-schema'

function keys(value: unknown, prefix = ''): Set<string> {
  const out = new Set<string>()
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [k, v] of Object.entries(value)) {
      out.add(prefix + k)
      for (const nested of keys(v, `${prefix}${k}.`)) out.add(nested)
    }
  }
  return out
}

describe('paridad de idiomas', () => {
  it('los archivos de mensajes tienen exactamente las mismas claves', () => {
    const esKeys = keys(es)
    const enKeys = keys(en)
    const soloEs = [...esKeys].filter((k) => !enKeys.has(k))
    const soloEn = [...enKeys].filter((k) => !esKeys.has(k))
    expect({ soloEs, soloEn }).toEqual({ soloEs: [], soloEn: [] })
  })
})

describe('servicios', () => {
  it('son exactamente seis y validan contra el esquema', () => {
    const services = getServices()
    expect(services).toHaveLength(6)
  })

  it('rechaza un catálogo con siete servicios', () => {
    const services = getServices()
    const result = ServicesFile.safeParse([...services, services[0]])
    expect(result.success).toBe(false)
  })

  it('cada resumen entra en la tarjeta de la portada', () => {
    for (const service of getServices()) {
      expect(service.summary.es.length).toBeLessThanOrEqual(120)
      expect(service.summary.en.length).toBeLessThanOrEqual(120)
    }
  })

  it('cada servicio tiene una entrada de traducción para el formulario', () => {
    const items = (es.services as { items: Record<string, string> }).items
    for (const service of getServices()) {
      expect(items[service.id]).toBeTruthy()
    }
  })
})

describe('integraciones y tecnologías', () => {
  it('ninguna herramienta aparece en dos categorías', () => {
    const names = getIntegrations().flatMap((c) => c.items.map((i) => i.name))
    expect(new Set(names).size).toBe(names.length)
  })

  it('las probadas se presentan primero dentro de su categoría', () => {
    for (const category of getIntegrations()) {
      const flags = category.items.map((i) => i.proven)
      const sorted = [...flags].sort((a, b) => Number(b) - Number(a))
      expect(flags).toEqual(sorted)
    }
  })

  it('el esquema rechaza declarar una alianza comercial inexistente', () => {
    // FR-028: el enum no contiene `partner`. Declararla exige cambiar código,
    // no solo contenido.
    const result = TechnologiesFile.safeParse([{ name: 'OpenAI', relationship: 'partner' }])
    expect(result.success).toBe(false)
  })

  it('el contenido publicado no usa la palabra partner', () => {
    const raw = readFileSync(join(process.cwd(), 'content/technologies.yaml'), 'utf8')
    expect(raw).not.toMatch(/relationship:\s*partner/)
    expect(getTechnologies().length).toBeGreaterThan(0)
  })
})

describe('perfil profesional', () => {
  it('valida y tiene un solo puesto vigente', () => {
    const profile = getProfile()
    expect(profile.experiences.filter((e) => !e.end)).toHaveLength(1)
  })

  it('rechaza una experiencia que termina antes de empezar', () => {
    const profile = getProfile()
    const broken = structuredClone(profile) as unknown as Record<string, unknown>
    const experiences = broken.experiences as { start: string; end?: string }[]
    experiences[0]!.start = '2020-01'
    experiences[0]!.end = '2019-01'
    expect(Profile.safeParse(broken).success).toBe(false)
  })

  it('rechaza dos puestos vigentes a la vez', () => {
    const broken = structuredClone(getProfile()) as unknown as Record<string, unknown>
    const experiences = broken.experiences as { end?: string }[]
    delete experiences[1]!.end
    expect(Profile.safeParse(broken).success).toBe(false)
  })

  it('los años declarados en la prosa coinciden con los calculados', () => {
    // La portada CALCULA los años; el resumen del CV los tiene escritos. Sin
    // esta prueba, el 1 de enero se desincronizan solos y nadie se entera.
    const profile = getProfile()
    const years = getYearsOfExperience(profile)
    expect(profile.summary.es).toContain(`${years} años`)
    expect(profile.summary.en).toContain(`${years}+ years`)
  })
})

describe('relato comercial', () => {
  // El sitio le habla a dueños de PyME, no a directores de tecnología. Estas
  // construcciones son las que vacían un texto comercial: se pueden copiar al
  // sitio de cualquier competidor sin que quede mal, así que no dicen nada.
  const VACIAS = [
    /soluciones innovadoras/i,
    /tecnología de vanguardia/i,
    /transformación digital/i,
    /llevar tu (empresa|negocio) al siguiente nivel/i,
    /potenciar tu negocio/i,
    /somos (líderes|apasionados)/i,
    /cutting[- ]edge/i,
    /next level/i,
    /industry[- ]leading/i,
    /state of the art/i,
  ]

  it.each([
    ['es', es],
    ['en', en],
  ])('los mensajes de %s no usan frases de relleno', (_locale, messages) => {
    const raw = JSON.stringify(messages)
    for (const pattern of VACIAS) {
      expect(raw, `coincide con ${pattern}`).not.toMatch(pattern)
    }
  })

  it('la portada nombra un dolor concreto antes de ofrecer servicios', () => {
    // Orden del relato: reconocimiento -> oferta. Si `pain` desaparece, la
    // página vuelve a arrancar hablando de sí misma.
    for (const messages of [es, en]) {
      const home = messages.home as { pain?: { items?: unknown[]; cost?: string } }
      expect(home.pain?.items).toHaveLength(5)
      expect(home.pain?.cost).toBeTruthy()
    }
  })

  it('la sección de inversión conserva el límite honesto', () => {
    // «Si no da, te lo digo» es el argumento que distingue a un proveedor de
    // alguien que quiere vender igual. Borrarlo sin querer es fácil.
    const esClose = (es.home as { investment: { close: string } }).investment.close
    const enClose = (en.home as { investment: { close: string } }).investment.close
    expect(esClose).toMatch(/si no da/i)
    expect(enClose).toMatch(/doesn't add up/i)
  })
})

describe('cotización', () => {
  // Decisión comercial: los precios NO se publican, se cotizan por correo.
  // Un precio publicado resolvía el miedo a que el número dependa de la cara
  // del cliente; sin precio, eso lo tiene que resolver el texto diciendo de
  // qué depende la cotización. Si esa promesa desaparece, el sitio se queda
  // sin respuesta para la objeción más común.
  it('el sitio explica cómo se cotiza aunque no publique números', () => {
    const esItems = (es.home as { investment: { items: { title: string }[] } }).investment.items
    const enItems = (en.home as { investment: { items: { title: string }[] } }).investment.items
    expect(esItems.some((i) => /esfuerzo/i.test(i.title))).toBe(true)
    expect(enItems.some((i) => /effort/i.test(i.title))).toBe(true)
  })

  it('promete la cotización por escrito en ambos idiomas', () => {
    const esSteps = (es.contact as { next: { steps: string[] } }).next.steps
    const enSteps = (en.contact as { next: { steps: string[] } }).next.steps
    expect(esSteps.at(-1)).toMatch(/por escrito/i)
    expect(enSteps.at(-1)).toMatch(/in writing/i)
  })
})
