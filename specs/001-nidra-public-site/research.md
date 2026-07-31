# Phase 0 — Research: Sitio público de Nidra

**Feature**: `001-nidra-public-site` | **Fecha**: 2026-07-30

Resuelve las incógnitas técnicas de la Technical Context de [plan.md](./plan.md). Cada decisión se
evalúa contra los cinco principios de [la constitución](../../.specify/memory/constitution.md), con
peso especial en el Principio II (presupuesto de rendimiento) y el Principio V (simplicidad/YAGNI).

---

## R-001 — Framework y versión

**Decisión**: Next.js 16 (App Router) + TypeScript en modo `strict` + Tailwind CSS 4. Despliegue en
Vercel.

**Rationale**: fijado por la constitución (sección Restricciones Técnicas). Next.js 16 es la línea
estable actual y es la versión con la que las bibliotecas de i18n del ecosistema declaran
compatibilidad. Vercel es el destino natural: despliegue por push, dominios y subdominios con TLS
gestionado, y funciones para la Server Action del formulario sin operar infraestructura.

**Alternativas consideradas**:

- **Astro**: mejor para contenido puro, pero el formulario con mejora progresiva y el motor de
  renderizado del CV se resuelven con menos piezas en Next.js. La constitución ya fijó el stack.
- **Export estático puro (`output: 'export'`)**: eliminaría la Server Action y obligaría a un backend
  externo para el formulario. Se descarta: agrega un servicio para ahorrar una función.

---

## R-002 — Estrategia de internacionalización

**Decisión**: `next-intl` con segmento dinámico `app/[locale]/`, `localePrefix: 'always'`, locales
`es` (por defecto) y `en`. Renderizado estático mediante `generateStaticParams()` que devuelve ambos
locales y `setRequestLocale(locale)` al inicio de cada layout y page.

**Rationale**: es la opción de menor peso del ecosistema (~2 KB), tiene soporte nativo de Server
Components y no obliga a marcar las páginas como dinámicas. `localePrefix: 'always'` da a cada página
una dirección propia y estable por idioma (FR-030) y evita que la portada tenga dos URLs equivalentes
compitiendo por el mismo contenido. Un `middleware` negocia el idioma en `/` a partir de
`Accept-Language` y redirige a `/es` o `/en`; el middleware no rompe el renderizado estático de las
páginas porque solo actúa sobre la ruta raíz y sobre la reescritura de host.

**Alternativas consideradas**:

- **`next-i18next`**: arrastra la cadena de `i18next`, mucho más pesada, para un sitio de dos idiomas
  y contenido acotado. Contradice el Principio II.
- **Enrutado manual con diccionarios propios**: menos dependencias, pero habría que construir
  negociación de idioma, `hreflang`, formateo de fechas y fallbacks. Reimplementar una biblioteca de
  2 KB no es simplicidad, es trabajo no facturado.
- **`localePrefix: 'as-needed'`** (español sin prefijo): URLs más limpias en el idioma principal, pero
  complica el enlace alterno `hreflang` y la simetría del selector de idioma. Se prioriza la simetría
  y la previsibilidad.

**Consecuencia para FR-034** (no publicar contenido faltante en un idioma): se resuelve con un test
de paridad que compara las claves de `messages/es.json` y `messages/en.json` y falla el build ante
cualquier diferencia. No se delega a la inspección visual.

---

## R-003 — Reserva de reuniones

**Decisión**: **Cal.com Cloud (plan gratuito)** con la cuenta de Google Calendar del responsable
conectada. El sitio enlaza a la página de reserva de Cal.com como camino principal; la incrustación
en `/contacto` es una mejora opcional que se carga solo bajo interacción del visitante.

**Rationale**: Cal.com resuelve de fábrica todo lo que exigen FR-018 a FR-021 — lectura de
disponibilidad real contra el calendario conectado para no ofrecer horarios ocupados, escritura del
evento al confirmar, generación del enlace de videollamada, notificaciones a ambas partes y enlaces
propios de reprogramación y cancelación. Su plan gratuito cubre calendarios y tipos de evento
ilimitados más videollamada propia, que es más que suficiente para un responsable único.

La decisión de **enlazar antes que incrustar** es deliberada y responde a dos principios:

- **Principio II**: una incrustación de terceros cargada en el primer render consume presupuesto de
  JavaScript en una página cuyo trabajo es convertir. Enlazar cuesta 0 KB.
- **Principio I**: un enlace funciona sin JavaScript. Una incrustación, no. FR-018 exige que la
  reserva siga disponible cuando el asistente conversacional falla; un enlace saliente es el camino
  que menos supuestos hace sobre el navegador del visitante.

**Alternativas consideradas**:

- **Cal.com autoalojado**: elimina la dependencia de un SaaS, pero obliga a operar un servidor, una
  base de datos y una aplicación OAuth propia de Google, con sus renovaciones de credenciales. Para
  un sitio institucional sin backend, es infraestructura desproporcionada. Rechazado por Principio V.
- **Integración directa contra la API de Google Calendar**: control total de la experiencia, pero
  habría que construir y mantener cálculo de disponibilidad, prevención de doble reserva,
  notificaciones, generación del enlace de videollamada y flujos de reprogramación y cancelación. Es
  reconstruir un producto entero para ahorrar una dependencia externa.
- **Calendly**: cubre lo mismo, pero su plan gratuito es más restrictivo en tipos de evento y no
  aporta ninguna ventaja sobre Cal.com en este caso.

**Riesgo aceptado**: la reserva vive en un servicio externo y el visitante abandona el dominio de
Nidra al reservar. Es el precio de no construir un motor de agendamiento. Se mitiga usando el dominio
propio de Cal.com para la organización y manteniendo el enlace visible y explicado en `/contacto`.

---

## R-004 — Fuente de datos única del perfil y el currículum

**Decisión**: un único archivo YAML, `content/cv/profile.yaml`, con **estructura compartida y campos
de texto bilingües en línea**:

```yaml
experiences:
  - id: epam-bayer
    org: EPAM Systems
    start: 2019-06
    end: 2025-07
    tech: [Java, Spring Boot, Kotlin, Angular]
    role:
      es: Ingeniero Full Stack Senior
      en: Senior Full Stack Software Engineer
    achievements:
      - es: Migración de un monolito a microservicios para un cliente global.
        en: Contributed to the migration of a monolithic system to microservices.
```

Validado por un esquema Zod en tiempo de build.

**Rationale**: la alternativa obvia —un archivo por idioma— hace que las fechas, las organizaciones y
el orden de los puestos existan dos veces, y nada impide que diverjan. Con un solo archivo y campos
bilingües, **la paridad entre idiomas es estructural, no verificada**: no se puede agregar una
experiencia en español sin crear el hueco en inglés, porque es el mismo nodo del árbol. Esto cumple
FR-034 y FR-047 por construcción, que es más fuerte que cumplirlos por test.

YAML sobre JSON por legibilidad de los textos largos (los logros son párrafos) y porque admite
comentarios, útiles para anotar por qué se redactó algo de cierta forma. Cumple FR-043: se edita sin
saber programar interfaces.

**Alternativas consideradas**:

- **Un archivo por idioma (`profile.es.yaml`, `profile.en.yaml`)**: más legible por idioma, pero
  duplica datos invariantes y necesita un validador de paridad estructural que igual puede pasar por
  alto una fecha mal copiada. Rechazado.
- **JSON Resume estándar**: esquema conocido y con herramientas, pero es monolingüe por diseño; el
  soporte multiidioma exige un archivo por idioma y vuelve al problema anterior.
- **Markdown con frontmatter**: cómodo para prosa, incómodo para datos estructurados con relaciones
  y validación (fechas, listas de tecnologías).
- **Base de datos o CMS**: prohibido por el Principio V y contradice el requisito explícito de que la
  evolución del CV viva en el historial de git.

**Versión del currículum (FR-041)**: se deriva del historial de git en tiempo de build, con el hash
corto y la fecha del último commit que tocó `content/cv/profile.yaml`. Nadie mantiene un número de
versión a mano.

---

## R-005 — Generación del documento portátil del currículum

**Decisión**: generación **en tiempo de build** con Playwright, imprimiendo a PDF la propia ruta de
impresión del currículum (`/[locale]/cv/print`). Salida a `public/downloads/`, un archivo por idioma.

**Rationale**: es la única opción en la que **la versión web imprimible y el PDF son literalmente la
misma maquetación**. FR-038 y FR-039 piden ambos formatos; FR-047 exige que todas las
representaciones deriven de la misma fuente. Con este enfoque no hay dos plantillas que mantener
sincronizadas: hay una hoja de estilos de impresión y el PDF es su resultado. Si el CV se ve bien
impreso desde el navegador, el PDF es correcto por definición.

Playwright, además, **ya es necesario** para las pruebas de extremo a extremo y la auditoría de
accesibilidad (R-008). Reutilizarlo para el PDF no agrega una dependencia nueva al proyecto, lo que
satisface la exigencia del Principio V de justificar cada dependencia.

Al generarse en build y servirse como archivo estático, la descarga no ejecuta código en el servidor
y cumple FR-042 (siempre la última versión, sin intervención manual) de la forma más simple posible.

**Alternativas consideradas**:

- **`@react-pdf/renderer`**: genera PDF sin navegador headless, pero exige escribir una **segunda
  maquetación** con su propio sistema de estilos. Dos plantillas para el mismo contenido es
  exactamente la deriva que FR-047 intenta evitar. Rechazado.
- **Generación bajo demanda en una función serverless**: permitiría PDFs personalizados, que nadie
  pidió, a cambio de meter Chromium en el camino crítico de una descarga. Rechazado por YAGNI.
- **LaTeX o Typst**: tipografía superior, pero introduce una cadena de herramientas ajena al stack y
  una tercera maquetación.

**Riesgo aceptado**: el build depende de que Playwright pueda descargar Chromium en CI. Es una
dependencia de la etapa de construcción, no de producción; si falla, falla el build y no el sitio.

---

## R-006 — Entrega del formulario de consulta

**Decisión**: **Server Action** de Next.js con mejora progresiva, validación compartida con Zod
(cliente y servidor) y envío por **Resend**. Sin persistencia (RD-004).

**Rationale**: una Server Action invocada como `<form action={...}>` se envía por HTTP estándar
cuando el navegador no ejecuta JavaScript, y se convierte en un envío sin recarga cuando sí lo hace.
Es exactamente el comportamiento que exige el Principio I y FR-050, sin escribir dos caminos.

Zod permite declarar el esquema una vez y usarlo en ambos lados, lo que satisface FR-010 (validar
antes de aceptar y volver a validar en servidor) sin duplicar reglas.

Resend sobre las alternativas por integración con React Email —las plantillas del correo son
componentes del mismo repositorio, versionados junto al resto del contenido— y porque su nivel
gratuito cubre con holgura el volumen esperado de un sitio institucional nuevo.

**Alternativas consideradas**:

- **Postmark**: reputación de entregabilidad superior y precio algo menor a volúmenes bajos, pero su
  sistema de plantillas queda fuera del repositorio y su nivel gratuito es testimonial. Queda
  documentado como plan de contingencia si aparecen problemas de entregabilidad.
- **Amazon SES**: el más barato a escala, irrelevante a este volumen, y el más caro en configuración
  inicial.
- **Servicios de formulario alojados (Formspree y similares)**: eliminan la Server Action, pero
  meten un tercero en la ruta del dato personal y quitan control sobre la validación del servidor.

**FR-016 — rechazo de envíos automatizados**: campo trampa oculto (`honeypot`) + marca temporal
firmada que descarta envíos anteriores a 3 segundos + limitación de frecuencia por dirección IP en el
borde. Ninguno de los tres exige que el visitante resuelva nada, ninguno depende de JavaScript y
ninguno degrada el uso por teclado o lector de pantalla — es el requisito literal de FR-016. Se
descarta explícitamente un desafío tipo CAPTCHA, incluidos los "invisibles", porque todos degradan a
un desafío visual ante la duda y ninguno funciona sin JavaScript.

**FR-017 — envíos duplicados**: se deriva una clave de idempotencia del contenido del envío (correo +
texto + ventana temporal) y se pasa a Resend como `Idempotency-Key`. Esto resuelve la duplicación
**sin almacenar nada**, que es lo que exige RD-004.

**FR-015 — fallo de entrega**: reintento con retroceso exponencial dentro de la Server Action y, si
se agota, registro del fallo con código de error y marca temporal, **sin datos personales**. El
visitante recibe el mensaje de error y el canal alternativo (FR-012).

---

## R-007 — Analítica sin cookies

**Decisión**: **Vercel Web Analytics**. Sin banner de consentimiento (FR-054).

**Rationale**: recoge solo datos anónimos agregados, no usa cookies ni identificadores persistentes,
y su script pesa cerca de 1 KB. Al estar integrado en la plataforma de despliegue no agrega
proveedor, contrato ni panel adicional que administrar. Para un sitio institucional nuevo con tráfico
bajo, cualquier cosa más sofisticada es instrumentación sin pregunta que responder.

**Alternativas consideradas**:

- **Plausible Cloud** (~9 USD/mes): panel notablemente mejor, datos alojados en la UE y
  segmentación más rica. Es el camino de actualización natural si el sitio empieza a recibir tráfico
  que justifique analizarlo en serio. Hoy sería pagar por un panel que nadie va a mirar.
- **Umami autoalojado**: gratuito en licencia, pero exige un servidor y una base de datos. Contradice
  el Principio V para el beneficio de ahorrar una suscripción que todavía no se está pagando.
- **Sin analítica**: defendible, pero deja al sitio sin forma de saber si la portada convierte, que
  es la única pregunta que el negocio necesita responder.

**Condición de revisión**: si el sitio supera las 10.000 visitas mensuales o se necesita atribuir
conversiones por campaña, se reevalúa Plausible.

---

## R-008 — Estrategia de pruebas y puertas de calidad

**Decisión**:

| Capa | Herramienta | Qué protege |
|---|---|---|
| Unitaria | Vitest | Esquemas Zod, validación del perfil (FR-048), paridad de claves de traducción (FR-034), derivación de la versión del CV |
| Extremo a extremo | Playwright | Recorridos de las historias, envío del formulario, navegación por teclado, comportamiento sin JavaScript |
| Accesibilidad | `@axe-core/playwright` | FR-049, SC-009 — sin violaciones A ni AA |
| Rendimiento y SEO | Lighthouse CI | SC-008 — ≥90 en las cuatro categorías, en móvil |

**Rationale**: la constitución define puertas obligatorias antes de mergear (build, `tsc`, linter,
Lighthouse ≥90 y verificación en tres breakpoints). Sin automatizarlas, se verifican una vez y se
olvidan. Playwright cubre además la verificación sin JavaScript, que ninguna herramienta de
componentes puede hacer: se desactiva el motor de scripts en el contexto del navegador y se recorre
el sitio.

**Alternativas consideradas**:

- **Jest + Testing Library**: buenas para componentes, incapaces de verificar el requisito central de
  este sitio, que es cómo se comporta sin JavaScript y bajo un lector de pantalla.
- **Solo pruebas manuales**: incompatible con puertas de calidad declaradas como obligatorias.

---

## R-009 — Alojamiento del subdominio del perfil

**Decisión**: **una sola aplicación Next.js** que sirve ambos dominios. El middleware reescribe el
host `jmujica.nidra.cloud` al grupo de rutas `/[locale]/cv`, sin exponer esa ruta en el dominio
principal.

**Rationale**: un solo build, un solo sistema de diseño, una sola configuración de i18n y un solo
despliegue. Dos proyectos separados duplicarían la infraestructura para servir seis páginas.

**Alternativas consideradas**:

- **Dos proyectos de Vercel desde el mismo repositorio**: aislamiento total entre el sitio comercial
  y el perfil, a cambio de duplicar configuración y de que un cambio en el sistema de diseño haya que
  desplegarlo dos veces. Rechazado por Principio V.
- **Multi-zone de Next.js**: pensado para equipos independientes sobre un mismo dominio. No hay dos
  equipos.
- **Servir el CV en `nidra.cloud/cv`**: descarta el requisito explícito del subdominio (FR-036).

**Consecuencia de SEO**: el subdominio se trata como un sitio distinto por los buscadores. Cada uno
publica su propio mapa del sitio y sus propias directivas para rastreadores (FR-052), y el dominio
principal no debe enlazar la ruta interna reescrita, solo el subdominio público.

---

## R-010 — Contrato del asistente conversacional

**Decisión**: el sitio publica un punto de montaje y un contrato documentado en
[contracts/chatbot-widget.md](./contracts/chatbot-widget.md); el equipo del asistente implementa
contra ese contrato. El script se carga con estrategia diferida, después de que la página quede
interactiva, y nunca en la ruta crítica.

**Rationale**: FR-022 y FR-023 exigen que el sitio se publique y funcione sin que el asistente
exista. Definir el contrato desde este lado invierte la dependencia: el sitio no espera al asistente,
el asistente se adapta al sitio. El espacio del widget se reserva con dimensiones fijas para que su
aparición tardía no desplace contenido (FR-023, SC-007).

**Alternativas consideradas**:

- **Esperar a que el asistente exista para definir la integración**: bloquea la publicación del sitio
  detrás de un proyecto de otro equipo. Rechazado.
- **Incrustar un iframe genérico sin contrato**: no permite pasar el idioma ni el contexto de la
  página, y deja sin garantías el desplazamiento de contenido y la accesibilidad.

---

## Resumen de dependencias nuevas

El Principio V exige justificar por escrito cada dependencia. Estas son todas las que el plan
introduce:

| Dependencia | Qué resuelve | Por qué no alcanza la plataforma |
|---|---|---|
| `next-intl` | Enrutado por idioma, mensajes, `hreflang` | Construirlo a mano cuesta más que 2 KB |
| `zod` | Esquema único de validación cliente/servidor y del perfil | La plataforma no valida formularios ni YAML |
| `resend` + `react-email` | Entrega del correo y plantillas versionadas | No hay envío de correo en el navegador ni en el runtime |
| `yaml` | Lectura de la fuente de datos del perfil | Node no interpreta YAML de forma nativa |
| `@vercel/analytics` | Medición sin cookies | — |
| `playwright` | Pruebas E2E, accesibilidad y generación del PDF | Ninguna alternativa cubre el escenario sin JavaScript |
| `vitest` | Pruebas unitarias y de paridad de contenido | — |
| `@axe-core/playwright` | Verificación automatizada de WCAG | — |

**Explícitamente NO se incorporan**: biblioteca de componentes de UI, biblioteca de animaciones,
gestor de estado, ORM, base de datos, CMS ni framework de formularios. Ninguno resuelve un problema
que este sitio tenga.

---

## Sources

- [next-intl App Router i18n Guide (2026)](https://nextjslaunchpad.com/article/nextjs-internationalization-next-intl-app-router-i18n-guide)
- [Next.js App Router + Static Exports + i18n (next-intl)](https://github.com/azu/next-intl-example)
- [Next.js 16: next-i18next with App Router (2026)](https://i18nexus.com/tutorials/nextjs/next-i18next-app-router)
- [Cal.com Pricing: 2026 Guide to Plans and Features](https://zeeg.me/en/blog/post/cal-com-pricing)
- [Cal.com vs Calendly: Open-Source Self-Hosted Scheduling vs SaaS](https://contabo.com/blog/calcom-vs-calendly/)
- [Self-Hosting Cal.com: Open Source Scheduling Tool 2026](https://ossalt.com/guides/self-hosting-guide-calcom-2026)
- [Cookieless web analytics — Plausible](https://plausible.io/cookieless-web-analytics)
- [Vercel Analytics vs Plausible vs Umami 2026](https://www.pkgpulse.com/blog/vercel-analytics-vs-plausible-vs-umami-privacy-first-2026)
- [Resend vs Amazon SES vs Postmark Transactional Email 2026](https://www.buildmvpfast.com/blog/resend-vs-ses-vs-postmark-transactional-email-deliverability-saas-2026)
- [Resend vs Postmark: Which Is Better in 2026?](https://www.sequenzy.com/versus/resend-vs-postmark)
