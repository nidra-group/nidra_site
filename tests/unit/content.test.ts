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
    // Decir «si el retorno no justifica la inversión, lo vas a saber antes de
    // firmar» es el argumento que distingue a un proveedor de alguien que
    // quiere vender igual. Borrarlo sin querer es fácil.
    //
    // La prueba busca el CONCEPTO, no una frase textual: antes exigía «si no
    // da», que era lunfardo, y eso ataba el test a una redacción concreta en
    // vez de a la promesa que hay que conservar.
    const esClose = (es.home as { investment: { close: string } }).investment.close
    const enClose = (en.home as { investment: { close: string } }).investment.close
    expect(esClose, 'falta la condición de retorno').toMatch(/no justifica|no conviene|no da/i)
    expect(esClose, 'falta el momento en que se avisa').toMatch(/antes de firmar|te lo digo/i)
    expect(enClose, 'falta la condición de retorno').toMatch(
      /does not justify|doesn't justify|doesn't add up/i,
    )
    expect(enClose, 'falta el momento en que se avisa').toMatch(/before you sign|I'll say so/i)
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

describe('lenguaje llano en la portada', () => {
  // La portada la lee un dueño de PyME que puede no saber usar una planilla
  // de cálculo. Si encuentra una palabra que no entiende no pregunta: asume
  // que el servicio no es para él y cierra la pestaña.
  //
  // Servicios, integraciones y currículum SÍ pueden ser técnicos: ahí llega
  // quien ya decidió mirar en serio, y bajar el nivel resta credibilidad.
  // Por eso la regla se aplica al espacio `home` y no a todo el archivo.
  // Jerga que no se entiende en ningún idioma.
  const JERGA = [
    /\bAPIs?\b/,
    /interfaz de programación/i,
    /\bRAG\b/,
    /embeddings?/i,
    /base vectorial/i,
    /\bLLMs?\b/,
    /modelos? de lenguaje|language models?/i,
    /microservicios?|microservices?/i,
    /\bpipelines?\b/i,
    /\bstack\b/i,
    /framework/i,
    /onboarding/i,
    // «el código queda a tu nombre» no le dice nada a quien no programa.
    /\bcódigo\b|\bcode\b/i,
  ]

  // Anglicismos: son jerga en español y palabras normales en inglés.
  const ANGLICISMOS = [/\bfeatures\b/i, /\bdeploy\b/i, /escalable/i, /despliegue/i]

  const PATRONES = { es: [...JERGA, ...ANGLICISMOS], en: JERGA }

  it.each([
    ['es', es],
    ['en', en],
  ] as const)('la portada en %s no usa vocabulario técnico', (locale, messages) => {
    const home = JSON.stringify((messages as { home: unknown }).home)
    for (const pattern of PATRONES[locale]) {
      expect(home, `la portada contiene ${pattern}`).not.toMatch(pattern)
    }
  })

  it('los resúmenes de servicio que se muestran en la portada evitan la jerga', () => {
    for (const service of getServices()) {
      for (const locale of ['es', 'en'] as const) {
        for (const pattern of PATRONES[locale]) {
          expect(service.summary[locale], `${service.id} contiene ${pattern}`).not.toMatch(pattern)
        }
      }
    }
  })

  it('ninguna oración de la portada pasa de 25 palabras', () => {
    // Una oración larga obliga a sostener dos ideas a la vez. Quien no está
    // cómodo con el tema abandona antes de llegar al punto.
    const collect = (value: unknown, out: string[] = []): string[] => {
      if (typeof value === 'string') out.push(value)
      else if (Array.isArray(value)) value.forEach((v) => collect(v, out))
      else if (value && typeof value === 'object')
        Object.values(value).forEach((v) => collect(v, out))
      return out
    }

    for (const messages of [es, en]) {
      for (const text of collect((messages as { home: unknown }).home)) {
        for (const sentence of text.split(/(?<=[.?])\s+/)) {
          const words = sentence.trim().split(/\s+/).filter(Boolean)
          expect(words.length, `oración larga: "${sentence}"`).toBeLessThanOrEqual(25)
        }
      }
    }
  })
})

describe('imagen de vista previa para redes', () => {
  // Quien comparte el enlace en LinkedIn o WhatsApp anuncia el titular de
  // esta imagen. Ya se desincronizó dos veces del héroe: cuando pasa, el
  // enlace promete una cosa y la página entrega otra.
  it('repite el titular del héroe', () => {
    const source = readFileSync(join(process.cwd(), 'app/opengraph-image.tsx'), 'utf8')
    const hero = es.home as { hero: { title: string; titleAccent: string } }
    expect(source).toContain(`${hero.hero.title} ${hero.hero.titleAccent}`)
  })
})
