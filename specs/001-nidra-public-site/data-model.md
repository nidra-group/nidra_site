# Phase 1 — Data Model: Sitio público de Nidra

**Feature**: `001-nidra-public-site` | **Fecha**: 2026-07-30

Deriva las entidades de [spec.md](./spec.md#key-entities) a estructuras concretas. No hay base de
datos: cada entidad es un archivo versionado en `content/` o un objeto en tránsito. Todas se validan
con Zod en tiempo de build (los archivos) o de ejecución (los objetos en tránsito).

## Convención transversal: campo bilingüe

Toda cadena visible por el usuario que viva en `content/` se modela como un **par de idiomas en el
mismo nodo**:

```yaml
title:
  es: Automatización de flujos de trabajo
  en: Workflow automation
```

```typescript
const I18nText = z.object({ es: z.string().min(1), en: z.string().min(1) })
```

**Por qué importa**: FR-034 prohíbe publicar contenido que exista en un idioma y falte en el otro.
Con esta convención el requisito se cumple **por construcción** — el esquema rechaza el archivo si
falta un idioma, y es imposible agregar un elemento en español sin abrir el hueco en inglés. No
depende de que alguien recuerde traducir.

Las cadenas de interfaz (botones, errores, navegación) no siguen esta convención: viven en
`messages/es.json` y `messages/en.json` por exigencia de `next-intl`. Su paridad se garantiza con un
test que compara los conjuntos de claves y falla ante cualquier diferencia.

---

## 1. Servicio

**Archivo**: `content/services.yaml` · **Cardinalidad**: exactamente 6 (FR-002)

```yaml
- id: conversational-assistants        # estable; se usa en anclas y en el formulario
  order: 1
  icon: message-circle
  name: { es: "...", en: "..." }
  summary: { es: "...", en: "..." }     # una línea, para la grilla de la portada
  problem: { es: "...", en: "..." }     # el problema de negocio que resuelve
  deliverables:                         # qué se entrega
    - { es: "...", en: "..." }
  timeline: { es: "4 a 6 semanas", en: "4 to 6 weeks" }
```

**Reglas de validación**:

| Regla | Motivo |
|---|---|
| Exactamente 6 elementos | FR-002 |
| `id` único, en `kebab-case`, inmutable | Es ancla de URL: cambiarlo rompe enlaces publicados (FR-056) |
| `order` único y contiguo desde 1 | Orden de presentación determinista |
| `summary` ≤ 120 caracteres | Cabe en la tarjeta de la portada sin desbordar a 320 px |
| `problem`, `deliverables` y `timeline` obligatorios y no vacíos | FR-003 |
| `deliverables` con al menos 1 elemento | FR-003 |
| `icon` dentro del conjunto de íconos del sistema de diseño | Principio IV |

**Identidades fijadas** (FR-002): `conversational-assistants`, `workflow-automation`,
`internal-knowledge-base`, `custom-ai-product`, `ai-evaluation-security`, `ai-roadmap`.

**Relaciones**: referenciado por la Consulta en su campo `service`.

---

## 2. Categoría de integración e Integración

**Archivo**: `content/integrations.yaml` · **Origen**: [Anexo A de la spec](./spec.md#anexo-a--catálogo-de-integraciones-v1)

```yaml
categories:
  - id: ai-models
    order: 1
    name: { es: "Modelos y plataformas de IA", en: "AI models and platforms" }
    items:
      - name: OpenAI
        proven: true            # el ★ del Anexo A
        logo: openai.svg
      - name: Anthropic
        proven: false
```

**Reglas de validación**:

| Regla | Motivo |
|---|---|
| `id` de categoría único; `order` único y contiguo | Presentación determinista |
| `name` de integración único en todo el archivo | Una herramienta no puede estar en dos categorías |
| Cada categoría con ≥ 1 elemento | Una categoría vacía es un error de contenido |
| Dentro de cada categoría, `proven: true` se ordena primero | Regla 3 del Anexo A |
| `logo` apunta a un archivo existente en `public/logos/` | Falla el build si falta el activo |
| Ningún campo de texto libre por integración | **Regla 3 del Anexo A**: el esquema no ofrece dónde escribir una afirmación sobre el dominio de una plataforma, así que no se puede exagerar por descuido |

La última regla es una decisión de diseño, no una omisión: la diferencia entre `proven: true` y
`false` se expresa **solo** en el orden de presentación. El modelo no admite adjetivos por
integración.

---

## 3. Organización nombrada (tecnologías)

**Archivo**: `content/technologies.yaml` · **Sección**: "Tecnologías con las que trabajamos" (FR-027)

```yaml
- name: OpenAI
  logo: openai.svg
  relationship: technology       # enum cerrado
```

**Reglas de validación**:

| Regla | Motivo |
|---|---|
| `relationship` ∈ `{ technology, vendor }` | FR-028: el enum **no incluye** `partner` ni `certified`. Declarar una alianza inexistente requeriría cambiar el esquema, no solo el contenido |
| `name` único | — |

El valor `partner` se incorporará al enum cuando exista un acuerdo verificable, junto con un campo
que documente su origen. Hasta entonces, el modelo lo hace imposible.

---

## 4. Consulta

**Naturaleza**: objeto en tránsito. **No se persiste** (FR-014). Vive entre la Server Action y la
llamada a Resend, y desaparece.

```typescript
const InquirySchema = z.object({
  name:    z.string().trim().min(2).max(100),
  email:   z.string().trim().email().max(254),
  company: z.string().trim().max(120).optional(),
  service: z.enum(SERVICE_IDS).or(z.literal('other')),
  message: z.string().trim().min(20).max(2000),
  locale:  z.enum(['es', 'en']),
  // Anti-automatización — no se muestran al visitante
  website:   z.string().max(0),   // campo trampa: debe llegar vacío
  timestamp: z.string(),          // marca temporal firmada
})
```

**Reglas de validación** — se aplican **dos veces**, en cliente y en servidor, desde el mismo esquema
(FR-010):

| Regla | Motivo |
|---|---|
| `message` ≥ 20 caracteres | Descarta envíos vacíos sin frustrar al visitante legítimo |
| `service` dentro de los 6 identificadores o `other` | Coherencia con `content/services.yaml` |
| `website` debe llegar vacío | Campo trampa; un bot que rellena todo se delata (FR-016) |
| `timestamp` firmado y con antigüedad ≥ 3 s | Un envío instantáneo no es humano (FR-016) |
| Límite de frecuencia por IP en el borde | Tercera capa anti-automatización (FR-016) |

**Clave de idempotencia** (FR-017): `sha256(email + message + floor(now / 10 min))`, enviada a Resend
como `Idempotency-Key`. Previene el duplicado **sin almacenar nada**, que es lo que exige RD-004.

**Ciclo de vida**: `recibida → validada → entregada` · o `→ fallida` tras agotar reintentos, con
registro de código de error y marca temporal **sin datos personales** (FR-015).

---

## 5. Perfil profesional

**Archivo**: `content/cv/profile.yaml` · **Fuente única de verdad** (FR-043, FR-047)

```yaml
person:
  name: Juan Mujica
  headline: { es: "Ingeniero de IA / GenAI", en: "AI / GenAI Engineer" }
  location: { es: "Buenos Aires, Argentina · Remoto", en: "Buenos Aires, Argentina · Remote" }
  email: jmujica@nidra.cloud
  links:
    - { type: linkedin, url: "https://www.linkedin.com/in/-jmujica" }

summary: { es: "...", en: "..." }

experiences:
  - id: epam-bayer
    org: EPAM Systems
    client: Bayer                 # opcional
    start: 2019-06
    end: 2025-07                  # ausente = vigente
    role: { es: "...", en: "..." }
    achievements:
      - { es: "...", en: "..." }
    tech: [Java, Spring Boot, Kotlin, Angular, PostgreSQL, Kafka, AWS]

education:
  - institution: UTN — Buenos Aires
    start: 2011
    end: 2018
    degree: { es: "Ingeniería en Sistemas de Información", en: "Information Systems Engineering" }

certifications:
  - name: { es: "Ingeniería de Prompts", en: "Prompt Engineering" }

skills:
  - category: { es: "IA / GenAI", en: "AI / GenAI" }
    order: 1
    items: [OpenAI API, LLMs, RAG, Embeddings, pgvector, Qdrant, MCP, n8n]

languages:
  - name: { es: "Español", en: "Spanish" }
    level: { es: "Nativo", en: "Native" }
```

**Reglas de validación** (FR-048 — se ejecutan en build y rompen la publicación):

| Regla | Motivo |
|---|---|
| `experiences[].id` único e inmutable | Trazabilidad entre versiones del CV |
| `start` en formato `YYYY-MM`, no futuro | Dato imposible |
| `end` ≥ `start` cuando existe | Cronología inconsistente (caso borde de la spec) |
| Como máximo **una** experiencia sin `end` | Solo un puesto puede estar vigente |
| Experiencias ordenadas por `start` descendente | Orden de presentación determinista |
| Ambos idiomas presentes en todo campo bilingüe | FR-034, garantizado por `I18nText` |
| `achievements` con ≥ 1 elemento por experiencia | Una experiencia sin logros no aporta |
| `email` válido y `links[].url` absolutas y `https` | — |
| Ningún campo con la cadena vacía | Un campo vacío es un dato faltante disfrazado |

**Derivadas** — ninguna se escribe a mano:

| Dato | Cómo se obtiene |
|---|---|
| Años de experiencia | Desde la `start` más antigua hasta hoy, calculado en build |
| Vigencia de un puesto | Ausencia de `end` |
| Versión del CV | Hash corto y fecha del último commit que tocó este archivo |

---

## 6. Versión del currículum

**Naturaleza**: derivada del historial de git en tiempo de build. No es un archivo.

```typescript
type CvVersion = {
  hash: string   // git log -1 --format=%h -- content/cv/profile.yaml
  date: string   // YYYY-MM-DD del mismo commit
}
```

**Uso** — nombre del archivo descargado (FR-041):

```text
Juan_Mujica_CV_ES_2026-07-30_a1b2c3d.pdf
Juan_Mujica_CV_EN_2026-07-30_a1b2c3d.pdf
```

**Por qué derivarla y no declararla**: un número de versión escrito a mano se desactualiza en el
primer cambio apurado. Derivarlo del commit hace que FR-045 (toda modificación queda registrada) y
FR-042 (siempre la última versión) sean automáticos. El historial de git **es** el versionado del CV,
que es literalmente lo que pidió el responsable.

**Caso borde**: en un checkout sin historial (algunos entornos de CI clonan superficialmente), el
build debe fallar con un mensaje claro en vez de emitir un PDF con versión desconocida.

---

## 7. Contenido de página y cadenas de interfaz

**Archivos**: `messages/es.json`, `messages/en.json`

Estructura por espacio de nombres, alineada con las rutas:

```json
{
  "nav": { "services": "Servicios", "integrations": "Integraciones" },
  "home": { "hero": { "title": "...", "subtitle": "..." } },
  "contact": { "form": { "errors": { "emailInvalid": "..." } } },
  "cv": { "download": { "selectFormat": "..." } }
}
```

**Reglas de validación**:

| Regla | Motivo |
|---|---|
| Conjuntos de claves idénticos entre `es.json` y `en.json` | FR-034 — test unitario que falla el build |
| Ninguna clave con valor vacío | Una clave vacía se renderiza como hueco silencioso |
| Ninguna clave sin usar en el código | Evita que las traducciones acumulen residuos |
| Tipado generado desde `es.json` | FR-035 — una clave inexistente es error de compilación, no un identificador visible en pantalla |

La última regla es la que hace verificable FR-035: si el tipo de las claves se deriva del archivo de
mensajes, es imposible desplegar una página que muestre `home.hero.titlee` en pantalla, porque `tsc`
lo rechaza antes.

---

## 8. Reserva de reunión

**Naturaleza**: entidad **externa**. Reside en Cal.com y en el Google Calendar del responsable. El
sitio no la modela, no la almacena y no la consulta: solo origina la reserva mediante un enlace.

Se documenta aquí para dejar explícito el límite del sistema. Los atributos que la spec le asigna
—momento, duración, contacto, enlace de videollamada, estado— son responsabilidad del proveedor
externo (R-003).

---

## Mapa de entidades a requisitos

| Entidad | Archivo | Requisitos que cubre |
|---|---|---|
| Servicio | `content/services.yaml` | FR-002, FR-003 |
| Categoría e Integración | `content/integrations.yaml` | FR-024, FR-026, FR-028 |
| Organización nombrada | `content/technologies.yaml` | FR-027, FR-028 |
| Consulta | en tránsito | FR-009, FR-010, FR-013..FR-017 |
| Perfil profesional | `content/cv/profile.yaml` | FR-037, FR-043, FR-047, FR-048 |
| Versión del currículum | derivada de git | FR-041, FR-042, FR-045 |
| Contenido de interfaz | `messages/*.json` | FR-029, FR-034, FR-035, FR-044 |
| Reserva de reunión | externa | FR-018..FR-021 |
