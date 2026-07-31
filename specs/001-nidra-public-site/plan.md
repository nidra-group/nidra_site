# Implementation Plan: Sitio público de Nidra (v1)

**Branch**: `001-nidra-public-site` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-nidra-public-site/spec.md`

## Summary

Sitio institucional bilingüe (es/en) de una agencia de desarrollo de software con IA, publicado en
`nidra.cloud`, más un espacio profesional del fundador en `jmujica.nidra.cloud` desde el que se
descarga su currículum eligiendo idioma y formato.

El enfoque técnico se ordena alrededor de tres decisiones que atraviesan todo el diseño:

1. **Todo el contenido es estático y vive en el repositorio.** Las páginas se generan en build; los
   textos, los servicios, las integraciones y los datos del currículum son archivos versionados. No
   hay base de datos, CMS ni backend propio.
2. **La fuente del currículum es única y bilingüe en el mismo nodo.** Un solo YAML con campos `es`/`en`
   en línea hace que la paridad entre idiomas sea estructural: no se puede agregar experiencia en un
   idioma sin crear el hueco en el otro. La página web, la vista de impresión y el PDF derivan de ahí,
   y el PDF se genera imprimiendo la propia vista web en tiempo de build — una sola maquetación.
3. **Nada de terceros está en la ruta crítica.** La reserva de reuniones enlaza a Cal.com en vez de
   incrustarlo, y el asistente conversacional se carga diferido contra un contrato que reserva su
   espacio. El sitio se publica, convierte y funciona sin JavaScript aunque ninguno de los dos exista.

## Technical Context

**Language/Version**: TypeScript 5.x en modo `strict`, Node.js 22 LTS

**Primary Dependencies**: Next.js 16 (App Router), React 19, Tailwind CSS 4, `next-intl`, `zod`,
`resend` + `react-email`, `yaml`, `@vercel/analytics`

**Storage**: N/A — sin base de datos. El contenido son archivos YAML/JSON versionados en git. Las
consultas del formulario son objetos en tránsito que no se persisten (FR-014).

**Testing**: Vitest (unitarias y paridad de contenido), Playwright (E2E, recorrido sin JavaScript,
generación del PDF), `@axe-core/playwright` (WCAG), Lighthouse CI (puertas de calidad)

**Target Platform**: Web. Navegadores en sus dos últimas versiones mayores; contenido legible sin
JavaScript. Despliegue en Vercel.

**Project Type**: Aplicación web estática con una función de servidor para el formulario

**Performance Goals**: LCP ≤ 2,5 s · CLS ≤ 0,1 · INP ≤ 200 ms · JS inicial ≤ 120 KB comprimido por
ruta · Lighthouse móvil ≥ 90 en las cuatro categorías

**Constraints**: Renderizado estático por defecto · contenido y navegación operativos sin JavaScript ·
WCAG 2.1 AA · sin cookies ni identificadores persistentes · usable desde 320 px y con texto al 200% ·
sin secretos en el repositorio

**Scale/Scope**: 2 dominios · 2 idiomas · 6 páginas comerciales + 2 legales + espacio profesional +
página de error ≈ **22 rutas generadas** · tráfico bajo a moderado, sin requisitos de concurrencia

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluado contra [constitution.md](../../.specify/memory/constitution.md) v1.0.0.

| Principio | Puerta | Estado | Cómo lo satisface el diseño |
|---|---|---|---|
| **I. Contenido y accesibilidad primero** | Contenido esencial sin JS | ✅ | SSG en todas las rutas; el formulario usa una Server Action que se envía por HTTP estándar sin JS; la reserva es un enlace, no una incrustación |
| | WCAG 2.1 AA | ✅ | `@axe-core/playwright` en CI, sin violaciones A ni AA; recorrido por teclado verificado en E2E |
| | Contenido separado de la presentación | ✅ | `content/` y `messages/` fuera de `components/`; ningún texto embebido en componentes |
| **II. Presupuesto de rendimiento** | LCP/CLS/INP y JS ≤ 120 KB | ✅ | Sin biblioteca de UI, sin animaciones, sin gestor de estado; Cal.com enlazado; widget del chatbot diferido con espacio reservado |
| | Imágenes modernas con dimensiones | ✅ | `next/image` con AVIF/WebP; logos de integraciones como SVG en línea |
| **III. SEO verificable** | Metadatos por ruta | ✅ | `generateMetadata` por página y locale, con canónica y `hreflang` |
| | Sitemap y robots generados | ✅ | `app/sitemap.ts` y `app/robots.ts` derivados de las rutas reales, uno por dominio |
| | JSON-LD Organization | ✅ | En el layout del sitio comercial; `Person` en el espacio profesional |
| **IV. Sistema de diseño único** | Tokens, sin valores mágicos | ✅ | Tokens en `@theme` de Tailwind 4; regla de lint que prohíbe clases arbitrarias con valores tokenizables |
| | Componente compartido antes del 2.º uso | ✅ | `components/ui/` para botón, tarjeta, sección y campo de formulario |
| | Legible desde 320 px | ✅ | Verificado en E2E en 320/768/1280 |
| **V. Simplicidad y YAGNI** | Dependencias justificadas | ✅ | Tabla completa en [research.md](./research.md#resumen-de-dependencias-nuevas); 8 dependencias, cada una con su razón |
| | Sin CMS, base de datos, auth ni backend | ✅ | Ninguno de los cuatro aparece en el diseño |
| | Abstracción al tercer caso | ✅ | Sin capas de servicio ni repositorios: lectura directa de archivos en build |

**Restricciones técnicas de la constitución**:

| Restricción | Estado | Nota |
|---|---|---|
| Stack Next.js App Router + TS `strict` + Tailwind | ✅ | — |
| SSG por defecto; dinámico requiere justificación | ⚠️ **Justificado** | Ver Complexity Tracking |
| Sin `any` explícito | ✅ | `strict` + regla de lint |
| Sin secretos en el repositorio | ✅ | `RESEND_API_KEY` y `CONTACT_INBOX` por variable de entorno, validadas al arrancar con Zod |
| Analítica sin cookies | ✅ **Resuelto** | Vercel Web Analytics (R-007); cierra el `TODO(ANALYTICS_VENDOR)` de la constitución |
| Formularios degradan a HTTP y validan en servidor | ✅ | Server Action con mejora progresiva + Zod compartido |

**Veredicto (pre-Phase 0)**: **PASA**. Desviaciones documentadas en Complexity Tracking.

### Re-evaluación post-diseño (Phase 1)

Revisado tras generar `research.md`, `data-model.md`, `contracts/` y `quickstart.md`.

| Principio | Resultado | Evidencia surgida del diseño |
|---|---|---|
| I | ✅ **Reforzado** | El diseño del modelo de datos separa `content/` de `components/` de forma que un cambio de texto no puede tocar presentación — verificable en V7 del quickstart |
| II | ✅ **Reforzado** | Enlazar Cal.com en vez de incrustarlo (0 KB) y diferir el widget con espacio reservado de 64×64 px eliminan las dos fuentes previsibles de desplazamiento y de peso |
| III | ✅ | Sin cambios respecto de la evaluación previa |
| IV | ✅ | El sistema de diseño queda acotado a `components/ui/`; la vista de impresión del CV reutiliza los mismos bloques que la web |
| V | ✅ **Reforzado** | El recuento final es de 8 dependencias, ninguna de UI. Playwright cubre tres necesidades (E2E, accesibilidad y PDF) en vez de sumar una biblioteca por cada una |

**Hallazgo del diseño que no estaba en la evaluación previa**: el modelado de contenido resultó ser
un mecanismo de cumplimiento, no solo de estructura. Tres requisitos que parecían depender de
disciplina editorial pasaron a estar garantizados por el esquema:

- **FR-034** (paridad de idiomas): los campos bilingües en el mismo nodo hacen imposible agregar
  contenido en un idioma sin abrir el hueco en el otro.
- **FR-028** (no declarar alianzas inexistentes): el enum de `relationship` no contiene `partner`.
  Mentir exigiría cambiar código, no contenido.
- **Anexo A, regla 3** (no exagerar dominio de plataformas): el modelo de integración no tiene campo
  de texto libre donde escribir una afirmación.

**Veredicto (post-Phase 1)**: **PASA**. Sin desviaciones nuevas.

**Constitución**: el diseño cierra el `TODO(ANALYTICS_VENDOR)` que la constitución dejó pendiente
para esta fase (R-007 → Vercel Web Analytics). Corresponde enmendarla.

## Project Structure

### Documentation (this feature)

```text
specs/001-nidra-public-site/
├── plan.md                      # Este archivo
├── spec.md                      # Especificación (fase anterior)
├── research.md                  # Fase 0 — decisiones técnicas R-001..R-010
├── data-model.md                # Fase 1 — entidades y esquemas
├── quickstart.md                # Fase 1 — guía de validación
├── checklists/
│   └── requirements.md
├── contracts/
│   ├── chatbot-widget.md        # Contrato del asistente conversacional externo
│   ├── contact-form.md          # Contrato de la Server Action del formulario
│   └── content-schemas.md       # Esquemas de los archivos de contenido
└── tasks.md                     # Fase 2 — lo genera /speckit-tasks
```

### Source Code (repository root)

```text
app/
├── [locale]/
│   ├── layout.tsx                    # Layout raíz por idioma, JSON-LD, analítica
│   ├── (site)/                       # nidra.cloud
│   │   ├── layout.tsx                # Navegación y pie del sitio comercial
│   │   ├── page.tsx                  # Portada
│   │   ├── servicios/page.tsx        # Seis servicios con anclas por servicio
│   │   ├── integraciones/page.tsx    # Catálogo del Anexo A
│   │   ├── contacto/page.tsx         # Formulario + enlace de reserva
│   │   ├── privacidad/page.tsx
│   │   └── terminos/page.tsx
│   ├── (profile)/                    # jmujica.nidra.cloud (reescritura de host)
│   │   └── cv/
│   │       ├── page.tsx              # Perfil + selector de descarga
│   │       └── print/page.tsx        # Vista de impresión — origen del PDF
│   └── not-found.tsx
├── sitemap.ts                        # Un mapa por dominio
├── robots.ts
└── opengraph-image.tsx

components/
├── ui/                               # Botón, tarjeta, sección, campo — el sistema de diseño
├── site/                             # Encabezado, pie, selector de idioma, tarjeta de servicio
├── cv/                               # Bloques del currículum, compartidos entre web e impresión
└── chat/ChatMount.tsx                # Punto de montaje del asistente externo

content/
├── services.yaml                     # Los seis servicios, bilingües
├── integrations.yaml                 # Anexo A, bilingüe
├── technologies.yaml                 # "Tecnologías con las que trabajamos"
└── cv/profile.yaml                   # Fuente única del perfil, bilingüe

messages/
├── es.json                           # Cadenas de interfaz
└── en.json

lib/
├── content/                          # Lectura y validación de content/ con Zod
├── cv/version.ts                     # Versión derivada del historial de git
├── email/                            # Cliente Resend + plantillas React Email
├── validation/                       # Esquemas Zod compartidos cliente/servidor
└── env.ts                            # Validación de variables de entorno al arrancar

actions/
└── submit-inquiry.ts                 # Server Action del formulario

scripts/
└── generate-cv-pdf.ts                # Playwright: /cv/print → public/downloads/

tests/
├── unit/                             # Esquemas, paridad de mensajes, versión del CV
├── e2e/                              # Recorridos, sin-JS, teclado, breakpoints
└── a11y/                             # axe-core por ruta

middleware.ts                         # Negociación de idioma + reescritura de host
```

**Structure Decision**: una sola aplicación Next.js en la raíz del repositorio, sirviendo ambos
dominios (R-009). El subdominio del perfil se resuelve por reescritura de host en `middleware.ts`
hacia el grupo de rutas `(profile)`, en lugar de un segundo proyecto: un solo build, un solo sistema
de diseño y una sola configuración de i18n para servir en total ~22 rutas. Los grupos de rutas
`(site)` y `(profile)` separan los layouts sin ensuciar las URLs.

La separación `content/` ↔ `components/` es la que hace cumplible el Principio I: un cambio de texto
nunca toca un archivo de `components/`.

### Rutas localizadas

FR-030 exige que cada página tenga **su propia dirección estable por idioma**. Publicar
`/en/servicios` cumpliría la letra pero no el propósito: una URL en inglés con el segmento en
español es peor para el posicionamiento y le dice al visitante angloparlante que el sitio no está
realmente traducido.

La traducción de segmentos se declara en `i18n/pathnames.ts` y la consume `next-intl`. La carpeta de
`app/` conserva el nombre canónico en español (es la clave interna de la ruta); lo que cambia es la
URL pública:

| Ruta interna (carpeta) | URL en español | URL en inglés |
|---|---|---|
| `/` | `/es` | `/en` |
| `/servicios` | `/es/servicios` | `/en/services` |
| `/integraciones` | `/es/integraciones` | `/en/integrations` |
| `/contacto` | `/es/contacto` | `/en/contact` |
| `/privacidad` | `/es/privacidad` | `/en/privacy` |
| `/terminos` | `/es/terminos` | `/en/terms` |
| `/cv` | `/es/cv` | `/en/cv` |
| `/cv/print` | `/es/cv/imprimir` | `/en/cv/print` |

**Consecuencias en cadena** — tres piezas dejan de poder construir URLs concatenando cadenas y deben
resolverlas a través del enrutado de `next-intl`:

- El mapa del sitio, que debe emitir la URL localizada de cada ruta, no la interna.
- El enlace alterno por idioma (`hreflang`), que debe apuntar a la URL traducida.
- El selector de idioma, que debe traducir el segmento al cambiar de idioma en vez de conservarlo.

**Estas rutas son permanentes desde la publicación** (FR-056). Cambiar un segmento después exige una
redirección permanente; por eso conviene cerrar esta tabla antes de T036, no después.

## Complexity Tracking

> Desviaciones respecto de la constitución que requieren justificación explícita.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| **Ejecución en servidor para el formulario** (Server Action + `middleware.ts`), frente al mandato de renderizado estático por defecto | FR-010 exige validación en servidor y FR-013 exige entregar la consulta a un destino operado por Nidra. Ninguna de las dos se puede hacer desde una página estática. El middleware es necesario para negociar el idioma en `/` y para reescribir el host del subdominio | Un export totalmente estático obligaría a delegar el formulario en un servicio de terceros, metiendo un intermediario en la ruta del dato personal y quitando control sobre la validación del servidor. Se agrega un servicio externo para ahorrar una función. **Alcance de la desviación**: las 22 rutas siguen siendo estáticas; lo dinámico es una acción POST y una capa de borde que no renderiza |
| **Dependencia de un SaaS externo para reservar** (Cal.com) | FR-019 a FR-021 exigen disponibilidad real contra calendario, prevención de doble reserva, enlace de videollamada, notificaciones y reprogramación por el visitante | Construirlo contra la API de Google Calendar es reimplementar un producto completo. Autoalojar Cal.com obliga a operar servidor, base de datos y aplicación OAuth propia para un responsable único |
| **Playwright como dependencia de build** (no solo de test) | Es lo que permite que la vista web imprimible y el PDF sean **la misma maquetación** (FR-039 + FR-047), en vez de dos plantillas que derivan | `@react-pdf/renderer` evita el navegador headless pero exige una segunda maquetación con su propio sistema de estilos — exactamente la duplicación que FR-047 busca impedir. Además Playwright ya era necesario para E2E y accesibilidad: la dependencia no es nueva, solo se reutiliza |
