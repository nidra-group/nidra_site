---

description: "Task list for 001-nidra-public-site"
---

# Tasks: Sitio público de Nidra (v1)

**Input**: Design documents from `/specs/001-nidra-public-site/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: **INCLUIDOS**. No es una preferencia de estilo: la
[constitución](../../.specify/memory/constitution.md) declara puertas de calidad obligatorias antes
de mergear, y varios criterios de éxito de la spec (SC-009 accesibilidad, SC-016 sin JavaScript,
SC-008 Lighthouse) solo son verificables de forma automatizada. Sin estas tareas, los requisitos
existen pero nadie los comprueba.

**Organization**: agrupadas por historia de usuario para permitir implementación y validación
independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: historia a la que pertenece (US1…US6)
- Toda tarea incluye la ruta exacta del archivo

## Path Conventions

Aplicación Next.js única en la raíz del repositorio, según
[plan.md § Project Structure](./plan.md#project-structure): `app/`, `components/`, `content/`,
`messages/`, `lib/`, `actions/`, `scripts/`, `tests/`.

Las carpetas de `app/` usan el nombre canónico en español; la URL pública en inglés se traduce por
configuración (T102). Ver [plan.md § Rutas localizadas](./plan.md#rutas-localizadas).

**Rama de trabajo**: `001-nidra-public-site`. La constitución exige que la funcionalidad se
desarrolle fuera de `main`, que debe permanecer desplegable.

---

## Nota sobre el orden de las historias

Dos historias de prioridad baja tienen **infraestructura** que las historias P1 necesitan desde el
primer día. Se resuelve separando el andamiaje del entregable:

| Historia | Andamiaje → Fase 2 (Foundational) | Entregable → su propia fase |
|---|---|---|
| **US3** (idiomas, P2) | Enrutado `[locale]`, `next-intl`, middleware | Ambos idiomas completos, selector, `hreflang`, paridad verificada |
| **US6** (contenido versionado, P3) | Lector y validador de `content/` | Mensajes de error por ruta del dato, puerta de build, versión desde git |

Sin esta separación, el enrutado por idioma habría que rehacerlo al llegar a US3. Con ella, cada
historia sigue siendo entregable y verificable por separado.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: inicialización del proyecto y herramientas de verificación.

- [ ] T001 Inicializar proyecto Next.js 16 con App Router, React 19, TypeScript `strict` y Tailwind CSS 4 en la raíz (`package.json`, `tsconfig.json`, `next.config.ts`, `app/globals.css`)
- [ ] T002 [P] Configurar ESLint y Prettier, incluida una regla que prohíba clases Tailwind arbitrarias con valores ya tokenizados y el uso de `any` explícito, en `eslint.config.mjs`
- [ ] T003 [P] Configurar Vitest para pruebas unitarias en `vitest.config.ts` y `tests/unit/`
- [ ] T004 [P] Configurar Playwright con proyectos móvil y escritorio y un proyecto adicional con JavaScript deshabilitado en `playwright.config.ts`
- [ ] T005 [P] Integrar `@axe-core/playwright` como utilidad de auditoría en `tests/a11y/setup.ts`
- [ ] T006 [P] Configurar Lighthouse CI con umbral ≥ 90 en las cuatro categorías en modo móvil en `lighthouserc.json`
- [ ] T007 [P] Crear `.env.example` con las seis variables documentadas en [quickstart.md](./quickstart.md#variables-de-entorno)
- [ ] T008 Implementar validación de variables de entorno con Zod que falle al arrancar nombrando la variable faltante en `lib/env.ts`
- [ ] T009 [P] Definir los tokens del sistema de diseño (color, tipografía, espaciado, radios) en el bloque `@theme` de `app/globals.css`
- [ ] T010 [P] Configurar el flujo de integración continua con las cuatro puertas de la constitución (build, tipos y linter, Lighthouse, breakpoints) en `.github/workflows/ci.yml`
- [ ] T011 [P] Definir los scripts `typecheck`, `lint`, `test`, `test:e2e`, `test:a11y` y `lighthouse` en `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: infraestructura que toda historia necesita.

**⚠️ CRÍTICO**: ninguna historia puede empezar hasta completar esta fase.

- [ ] T012 Configurar `next-intl` con locales `es` (por defecto) y `en`, `localePrefix: 'always'`, en `i18n/routing.ts` e `i18n/request.ts`
- [ ] T102 Declarar la traducción de segmentos de ruta según la tabla de [plan.md § Rutas localizadas](./plan.md#rutas-localizadas) en `i18n/pathnames.ts`, y exportar los ayudantes de navegación tipados (`Link`, `redirect`, `getPathname`) que el resto del código MUST usar en lugar de construir URLs concatenando cadenas (bloquea T021, T036, T050, T058, T061, T070, T080, T081, T094)
- [ ] T013 Implementar `middleware.ts` con negociación de idioma en `/` y reescritura del host `jmujica.nidra.cloud` hacia el grupo de rutas del perfil
- [ ] T014 Crear el layout raíz por idioma con `setRequestLocale`, `generateStaticParams` para ambos locales y los atributos `lang`/`dir` en `app/[locale]/layout.tsx`
- [ ] T015 [P] Crear la estructura de espacios de nombres de `messages/es.json` y `messages/en.json` según [data-model.md § 7](./data-model.md#7-contenido-de-página-y-cadenas-de-interfaz)
- [ ] T016 [P] Generar el tipado de claves de mensajes desde `messages/es.json` para que una clave inexistente sea error de compilación en `global.d.ts`
- [ ] T017 Implementar el lector y validador de archivos YAML de `content/` con Zod, ejecutado en tiempo de build, en `lib/content/loader.ts`
- [ ] T018 [P] Definir el esquema `I18nText` y los ayudantes de campos bilingües compartidos en `lib/validation/i18n.ts`
- [ ] T019 [P] Crear los componentes base del sistema de diseño (`Button`, `Card`, `Section`, `Field`) en `components/ui/`
- [ ] T020 [P] Implementar el ayudante de metadatos por página con título, descripción, canónica y vista previa social en `lib/seo/metadata.ts`
- [ ] T021 Implementar la generación de mapa del sitio y directivas para rastreadores desde las rutas reales, con salida diferenciada por dominio, emitiendo la URL **localizada** de cada ruta resuelta con los ayudantes de T102, en `app/sitemap.ts` y `app/robots.ts` (depende de T102)
- [ ] T103 Implementar la infraestructura de redirecciones permanentes con un registro explícito de rutas retiradas o renombradas, en `lib/seo/redirects.ts`, consumido desde `next.config.ts` (FR-056)
- [ ] T022 [P] Crear la página de error para direcciones inexistentes conservando navegación y retorno a la portada en `app/[locale]/not-found.tsx`
- [ ] T023 Integrar Vercel Web Analytics en el layout raíz, verificando que no instala cookies, en `app/[locale]/layout.tsx` (depende de T014)
- [ ] T024 [P] Crear el layout del sitio comercial con encabezado, navegación principal persistente y pie en `app/[locale]/(site)/layout.tsx`
- [ ] T025 [P] Crear la utilidad de pruebas con JavaScript deshabilitado para Playwright en `tests/e2e/helpers/no-js.ts`
- [ ] T026 [P] Crear la utilidad de auditoría de accesibilidad por ruta en `tests/a11y/audit.ts`

**Checkpoint**: base lista — las historias pueden comenzar.

---

## Phase 3: User Story 1 — Evaluar si Nidra resuelve mi problema (Priority: P1) 🎯 MVP

**Goal**: un visitante entiende en menos de un minuto qué hace Nidra, a quién le sirve y qué
servicios ofrece, y puede profundizar en el que se parece a su problema.

**Independent Test**: entregando solo portada y servicios, un evaluador externo que no conoce la
empresa responde sin ayuda qué hace Nidra, a quién le sirve y cuáles son sus seis servicios.

### Tests for User Story 1

> Escribir primero; deben fallar antes de implementar.

- [ ] T027 [P] [US1] Prueba E2E de la portada: propuesta de valor, audiencia y acción de contacto visibles en el primer viewport a 375 px sin desplazarse, en `tests/e2e/us1-home.spec.ts`
- [ ] T028 [P] [US1] Prueba E2E: la grilla muestra exactamente seis servicios y cada uno navega a su detalle con problema, entregables y plazo, en `tests/e2e/us1-services.spec.ts`
- [ ] T029 [P] [US1] Prueba unitaria del esquema de servicios: exactamente seis, `id` único en `kebab-case`, `summary` ≤ 120 caracteres, campos obligatorios presentes, en `tests/unit/services-schema.test.ts`
- [ ] T030 [P] [US1] Prueba E2E sin JavaScript: portada y servicios se leen completos y la navegación entre páginas funciona, en `tests/e2e/us1-no-js.spec.ts`

### Implementation for User Story 1

- [ ] T031 [P] [US1] Definir el esquema Zod de Servicio con sus reglas de validación en `lib/content/schemas/service.ts`
- [ ] T032 [US1] Escribir los seis servicios bilingües con problema, entregables y plazo en `content/services.yaml` (identificadores fijados en [data-model.md § 1](./data-model.md#1-servicio))
- [ ] T033 [US1] Implementar la carga tipada y ordenada de servicios en `lib/content/services.ts`
- [ ] T034 [P] [US1] Crear el componente de tarjeta de servicio en `components/site/ServiceCard.tsx`
- [ ] T035 [US1] Implementar la portada con propuesta de valor, grilla de servicios y proceso de trabajo en pasos en `app/[locale]/(site)/page.tsx`
- [ ] T036 [US1] Implementar la página de servicios con un ancla estable por `id` de servicio en `app/[locale]/(site)/servicios/page.tsx`
- [ ] T037 [P] [US1] Añadir datos estructurados de tipo Organization en `components/site/OrganizationJsonLd.tsx`
- [ ] T038 [US1] Redactar los textos de portada y servicios en `messages/es.json`

**Checkpoint**: US1 funciona y se puede validar sola. Es el MVP.

---

## Phase 4: User Story 2 — Iniciar una conversación comercial (Priority: P1)

**Goal**: el visitante deja una consulta o reserva una reunión, y sabe qué pasa después.

**Independent Test**: entregando solo la página de contacto, un evaluador envía una consulta, ve la
confirmación con el plazo y verifica que el mensaje llegó a la casilla de Nidra.

**Contrato de referencia**: [contracts/contact-form.md](./contracts/contact-form.md)

### Tests for User Story 2

- [ ] T039 [P] [US2] Prueba E2E del formulario: envío válido produce confirmación con el plazo comprometido, en `tests/e2e/us2-contact.spec.ts`
- [ ] T040 [P] [US2] Prueba E2E sin JavaScript: el formulario se envía por HTTP estándar, muestra errores por campo y conserva lo escrito, en `tests/e2e/us2-no-js-form.spec.ts`
- [ ] T041 [P] [US2] Prueba unitaria del esquema de consulta: longitudes, correo válido, campo trampa vacío y marca temporal fuera de rango, en `tests/unit/inquiry-schema.test.ts`
- [ ] T042 [P] [US2] Prueba unitaria de la clave de idempotencia: estable dentro de la ventana de 10 minutos y distinta fuera de ella, en `tests/unit/idempotency.test.ts`
- [ ] T043 [P] [US2] Prueba E2E de teclado: recorrido completo de portada a consulta enviada sin usar el ratón, con foco visible, en `tests/e2e/us2-keyboard.spec.ts`

### Implementation for User Story 2

- [ ] T044 [P] [US2] Definir el esquema Zod de consulta, compartido por cliente y servidor, en `lib/validation/inquiry.ts`
- [ ] T045 [P] [US2] Implementar la emisión y verificación de la marca temporal firmada en `lib/validation/timestamp.ts`
- [ ] T046 [P] [US2] Implementar el cliente de Resend y la plantilla de correo con React Email en `lib/email/`
- [ ] T047 [US2] Implementar la Server Action con validación en servidor, clave de idempotencia y tres reintentos con retroceso exponencial en `actions/submit-inquiry.ts`
- [ ] T048 [US2] Añadir el límite de frecuencia por dirección IP (5 envíos / 10 minutos) en `middleware.ts`
- [ ] T049 [P] [US2] Crear el componente de formulario con mejora progresiva, campo trampa oculto por CSS, errores por campo y foco en el primer error, en `components/site/InquiryForm.tsx`
- [ ] T050 [US2] Implementar la página de contacto con el formulario y el enlace de reserva en `app/[locale]/(site)/contacto/page.tsx`
- [ ] T051 [P] [US2] Crear el componente de enlace de reserva que propaga el idioma activo en `components/site/BookingLink.tsx`
- [ ] T052 [US2] Configurar en Cal.com el evento de reunión inicial de 30 minutos con el Google Calendar conectado, antelación mínima de 4 horas y ventana de 30 días, y registrar la URL resultante en `.env.example`
- [ ] T053 [US2] Implementar el registro de fallos de entrega con código de error y marca temporal, sin datos personales, en `lib/email/logging.ts`
- [ ] T054 [US2] Redactar los textos del formulario, los mensajes de error y la confirmación en `messages/es.json`

**Checkpoint**: US1 y US2 funcionan de forma independiente. El sitio ya convierte.

---

## Phase 5: User Story 3 — Navegar en mi propio idioma (Priority: P2)

**Goal**: todo el sitio existe en español e inglés y un enlace compartido preserva el idioma.

**Independent Test**: recorrer el sitio completo en cada idioma sin encontrar texto sin traducir ni
identificadores de traducción, y comprobar que un enlace en inglés abre en inglés.

### Tests for User Story 3

- [ ] T055 [P] [US3] Prueba unitaria de paridad: los conjuntos de claves de `messages/es.json` y `messages/en.json` son idénticos y ninguna queda vacía, en `tests/unit/messages-parity.test.ts`
- [ ] T056 [P] [US3] Prueba E2E: cambiar de idioma mantiene al visitante en la misma página y el idioma persiste al navegar, en `tests/e2e/us3-locale-switch.spec.ts`
- [ ] T057 [P] [US3] Prueba E2E: cada página declara canónica y enlace alterno al otro idioma, apuntando a la URL **traducida** y no al segmento en español, en `tests/e2e/us3-seo-i18n.spec.ts`
- [ ] T104 [P] [US3] Prueba E2E: cada ruta de la tabla de rutas localizadas responde en ambos idiomas con su segmento traducido, y ninguna URL en inglés contiene un segmento en español, en `tests/e2e/us3-pathnames.spec.ts`

### Implementation for User Story 3

- [ ] T058 [P] [US3] Crear el selector de idioma que traduce el segmento de la ruta actual al cambiar de idioma, usando los ayudantes de T102, en `components/site/LocaleSwitcher.tsx` (depende de T102)
- [ ] T059 [US3] Completar la traducción íntegra de la interfaz en `messages/en.json`
- [ ] T060 [US3] Completar los campos `en` de los seis servicios en `content/services.yaml`
- [ ] T061 [US3] Añadir enlace alterno por idioma y canónica por locale, resolviendo la URL localizada con los ayudantes de T102, en `lib/seo/metadata.ts` (depende de T102)
- [ ] T062 [US3] Implementar la puerta de build que falla ante claves o campos bilingües faltantes en `scripts/check-content-parity.ts`

**Checkpoint**: el sitio es completamente bilingüe y verificado.

---

## Phase 6: User Story 4 — Verificar que Nidra se conecta con mis herramientas (Priority: P2)

**Goal**: el visitante encuentra las integraciones agrupadas por categoría y una vía para preguntar
por la que no figure.

**Independent Test**: entregando solo la página de integraciones, un visitante ubica una herramienta
concreta, identifica su categoría y encuentra cómo consultar por una ausente.

**Contrato de referencia**: [contracts/content-schemas.md](./contracts/content-schemas.md)

### Tests for User Story 4

- [ ] T063 [P] [US4] Prueba unitaria del esquema de integraciones: nombre único en todo el archivo, categorías no vacías, logo referenciado existente, en `tests/unit/integrations-schema.test.ts`
- [ ] T064 [P] [US4] Prueba unitaria que verifica que `relationship: partner` es rechazado por el enum, en `tests/unit/technologies-schema.test.ts`
- [ ] T065 [P] [US4] Prueba E2E: integraciones agrupadas por categoría, con las probadas primero dentro de cada una, y declaración de alcance abierto al final, en `tests/e2e/us4-integrations.spec.ts`

### Implementation for User Story 4

- [ ] T066 [P] [US4] Definir los esquemas Zod de Categoría, Integración y Organización nombrada, sin campo de texto libre por integración, en `lib/content/schemas/integrations.ts`
- [ ] T067 [US4] Escribir el catálogo de las once categorías desde el [Anexo A](./spec.md#anexo-a--catálogo-de-integraciones-v1) en `content/integrations.yaml`
- [ ] T068 [P] [US4] Escribir las tecnologías de la sección "Tecnologías con las que trabajamos" en `content/technologies.yaml`
- [ ] T069 [P] [US4] Añadir los logotipos en formato SVG en `public/logos/`
- [ ] T070 [US4] Implementar la página de integraciones con categorías, ancla por categoría, declaración de alcance abierto y vía de consulta en `app/[locale]/(site)/integraciones/page.tsx`
- [ ] T071 [P] [US4] Crear la sección de tecnologías para la portada en `components/site/Technologies.tsx`

**Checkpoint**: las cuatro primeras historias funcionan de forma independiente.

---

## Phase 7: User Story 5 — Conocer al fundador y descargar su CV (Priority: P3)

**Goal**: el espacio profesional del fundador se lee completo y permite descargar el currículum
eligiendo idioma y formato, siempre en su última versión.

**Independent Test**: entregando solo el subdominio, el perfil se lee sin descargar nada y cada
combinación ofrecida produce una descarga válida y coherente con lo mostrado.

**Contrato de referencia**: [contracts/content-schemas.md § currículum](./contracts/content-schemas.md#contrato-de-la-versión-y-los-formatos-del-currículum)

### Tests for User Story 5

- [ ] T072 [P] [US5] Prueba unitaria del esquema de perfil: `end ≥ start`, `start` no futura, un solo puesto vigente, logros no vacíos, ambos idiomas presentes, en `tests/unit/cv-schema.test.ts`
- [ ] T073 [P] [US5] Prueba unitaria de la derivación de versión desde el historial de git, incluido el fallo explícito cuando no hay historial, en `tests/unit/cv-version.test.ts`
- [ ] T074 [P] [US5] Prueba E2E: el perfil se lee completo sin descargar y el selector solo ofrece combinaciones cuyo archivo existe, en `tests/e2e/us5-cv.spec.ts`
- [ ] T075 [P] [US5] Prueba E2E: el host del subdominio resuelve al espacio profesional y esa ruta no es alcanzable desde el dominio principal, en `tests/e2e/us5-subdomain.spec.ts`

### Implementation for User Story 5

- [ ] T076 [P] [US5] Definir el esquema Zod del perfil profesional con todas las reglas de FR-048 en `lib/content/schemas/profile.ts`
- [ ] T077 [US5] Escribir el perfil bilingüe completo derivado del currículum vigente, incluida la versión en español que todavía no existe, en `content/cv/profile.yaml`
- [ ] T078 [P] [US5] Implementar la derivación del hash corto y la fecha del último commit del perfil en `lib/cv/version.ts`
- [ ] T079 [P] [US5] Crear los bloques de currículum reutilizados por la vista web y la de impresión en `components/cv/`
- [ ] T080 [US5] Implementar la página del perfil con selector de idioma y formato de descarga en `app/[locale]/(profile)/cv/page.tsx`
- [ ] T081 [US5] Implementar la vista de impresión sin navegación, sin pie y sin fondos decorativos, con márgenes aptos para A4 y Carta, en `app/[locale]/(profile)/cv/print/page.tsx`
- [ ] T082 [US5] Implementar el script que genera los documentos portátiles imprimiendo la vista de impresión con Playwright durante el build en `scripts/generate-cv-pdf.ts`
- [ ] T083 [US5] Construir el selector de descargas a partir de los archivos efectivamente generados, no de una lista escrita a mano, en `lib/cv/downloads.ts`
- [ ] T084 [P] [US5] Añadir datos estructurados de tipo Person y el layout del espacio profesional en `app/[locale]/(profile)/layout.tsx`
- [ ] T085 [US5] Extender la generación de mapa del sitio y directivas para que el subdominio publique los suyos propios en `app/sitemap.ts` (depende de T021)

**Checkpoint**: el espacio profesional funciona de forma independiente del sitio comercial.

---

## Phase 8: User Story 6 — Actualizar contenido versionado sin desplegar a mano (Priority: P3)

**Goal**: un cambio de texto o de dato del currículum se publica editando el repositorio, queda en el
historial y no requiere tocar código de presentación.

**Independent Test**: modificar un texto del sitio y un dato del currículum, comprobar que ambos se
publican sin intervención manual y que el historial permite reconstruir versiones anteriores.

### Tests for User Story 6

- [ ] T086 [P] [US6] Prueba unitaria: cada regla de validación rompe el build con un mensaje que nombra la ruta exacta del dato, según la tabla de [contracts/content-schemas.md](./contracts/content-schemas.md#garantías-de-validación-del-currículum-fr-048), en `tests/unit/content-errors.test.ts`
- [ ] T087 [P] [US6] Prueba de arquitectura: ningún archivo de `components/` contiene texto visible destinado al usuario, en `tests/unit/no-hardcoded-copy.test.ts`

### Implementation for User Story 6

- [ ] T088 [US6] Implementar los mensajes de error de validación que nombran la ruta del dato en lugar de un error genérico de esquema, en `lib/content/errors.ts`
- [ ] T089 [US6] Hacer que el build falle con mensaje explícito cuando el checkout no tiene historial de git, en lugar de emitir un archivo con versión desconocida, en `lib/cv/version.ts`
- [ ] T090 [US6] Integrar la validación de contenido, la paridad de idiomas y la generación de documentos como pasos obligatorios del build en `package.json` y `next.config.ts`
- [ ] T091 [P] [US6] Documentar el flujo de edición de contenido para quien no programa en `docs/CONTENIDO.md`

**Checkpoint**: las seis historias funcionan de forma independiente.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: transversales a varias historias y verificación final.

- [ ] T092 [P] Implementar el punto de montaje del asistente conversacional con carga diferida, espacio reservado de 64 × 64 px y atributos de contexto, según [contracts/chatbot-widget.md](./contracts/chatbot-widget.md), en `components/chat/ChatMount.tsx`
- [ ] T093 [P] Prueba E2E de degradación del asistente: sin la variable de entorno y con el host bloqueado, ninguna página pierde funcionalidad ni desplaza contenido, en `tests/e2e/chat-degradation.spec.ts`
- [ ] T094 [P] Redactar las páginas de política de privacidad y términos, declarando qué recoge el formulario, que no se almacena, y el tratamiento de datos de la reserva externa, en `app/[locale]/(site)/privacidad/page.tsx` y `app/[locale]/(site)/terminos/page.tsx`
- [ ] T095 [P] Generar la imagen de vista previa para redes por idioma en `app/opengraph-image.tsx`
- [ ] T096 [P] Prueba E2E de comportamiento adaptable en 320, 768 y 1280 px, y con el texto ampliado al 200 % sin desplazamiento horizontal, en `tests/e2e/responsive.spec.ts`
- [ ] T097 [P] Auditoría de accesibilidad sobre todas las rutas, sin violaciones de nivel A ni AA, en `tests/a11y/all-routes.spec.ts`
- [ ] T098 Verificar el presupuesto de JavaScript de ≤ 120 KB comprimido por ruta y corregir lo que lo exceda, ajustando `next.config.ts`
- [ ] T105 [P] Prueba E2E: cada redirección declarada en el registro responde con estado permanente y su destino existe, sin cadenas de más de un salto, en `tests/e2e/redirects.spec.ts` (FR-056)
- [ ] T099 Ejecutar los once escenarios de validación de [quickstart.md](./quickstart.md#escenarios-de-validación) y registrar los resultados
- [ ] T100 [P] Escribir el `README.md` con puesta en marcha, variables de entorno y despliegue
- [ ] T101 Configurar en Vercel ambos dominios y cargar las variables de entorno como secretos del proyecto, sin incorporarlas al repositorio

**Puerta de publicación**: T094 bloquea la salida a producción del formulario. Sin política de
privacidad veraz no se puede publicar un formulario que recoge datos personales (FR-053).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: sin dependencias
- **Foundational (Fase 2)**: depende de Fase 1 — **bloquea todas las historias**
- **Historias (Fases 3–8)**: dependen de Fase 2; entre sí son independientes
- **Polish (Fase 9)**: depende de las historias que se decidan entregar

### User Story Dependencies

| Historia | Prioridad | Depende de | Nota |
|---|---|---|---|
| US1 | P1 | Fase 2 | Ninguna otra historia |
| US2 | P1 | Fase 2 | Usa los identificadores de servicio de US1 en el campo "servicio de interés"; con US1 ausente, el campo se degrada a lista fija |
| US3 | P2 | Fase 2 | Traduce el contenido que exista; cuantas más historias haya, más traduce |
| US4 | P2 | Fase 2 | Independiente |
| US5 | P3 | Fase 2 | Independiente del sitio comercial |
| US6 | P3 | Fase 2 | Endurece la validación de todo el contenido existente |

### Within Each User Story

- Las pruebas se escriben primero y deben fallar antes de implementar
- Esquemas antes que contenido; contenido antes que páginas
- Componentes antes que las páginas que los consumen

### Parallel Opportunities

- Fase 1: T002–T007 y T009–T011 en paralelo tras T001
- Fase 2: T015, T016, T018, T019, T020, T022, T024, T025 y T026 en paralelo
- Todas las pruebas de una misma historia son paralelizables entre sí
- Con más de una persona, US1/US2 y US4/US5 pueden avanzar en paralelo tras la Fase 2

---

## Parallel Example: User Story 1

```bash
# Todas las pruebas de US1 a la vez:
Task: "Prueba E2E de la portada en tests/e2e/us1-home.spec.ts"
Task: "Prueba E2E de servicios en tests/e2e/us1-services.spec.ts"
Task: "Prueba unitaria del esquema de servicios en tests/unit/services-schema.test.ts"
Task: "Prueba E2E sin JavaScript en tests/e2e/us1-no-js.spec.ts"

# Luego, en paralelo:
Task: "Esquema Zod de Servicio en lib/content/schemas/service.ts"
Task: "Componente de tarjeta de servicio en components/site/ServiceCard.tsx"
Task: "Datos estructurados Organization en components/site/OrganizationJsonLd.tsx"
```

---

## Implementation Strategy

### MVP (solo US1)

1. Fase 1: Setup
2. Fase 2: Foundational — bloquea todo
3. Fase 3: US1
4. **DETENERSE Y VALIDAR**: escenario V1 de quickstart con evaluadores externos (SC-001)
5. Desplegar si convence

El MVP es un sitio de una sola página en español que explica qué hace la empresa. No convierte
todavía, pero ya se puede compartir y ya responde la única pregunta que importa: qué hace Nidra.

### Entrega incremental sugerida

| Incremento | Historias | Qué habilita |
|---|---|---|
| 1 | US1 | El sitio explica la oferta |
| 2 | + US2 | **Publicable**: el sitio convierte (requiere T094) |
| 3 | + US4 | Elimina la objeción de compatibilidad técnica |
| 4 | + US3 | Abre el mercado angloparlante |
| 5 | + US5 | Espacio profesional y descarga del currículum |
| 6 | + US6 | El sitio queda sostenible en el tiempo |

**El incremento 2 es el primer punto de publicación real.** Antes de eso hay un sitio informativo sin
canal de contacto operativo.

US3 se ubica después de US4 a propósito: traducir contenido que todavía va a cambiar es trabajo que
se paga dos veces. Cuanto más estable esté el contenido en español, más barato es el inglés.

### Estrategia con varias personas

1. Fases 1 y 2 en conjunto
2. Luego: una persona en US1 + US2 (la ruta de conversión), otra en US4 + US5 (contenido y perfil)
3. US3 y US6 al final, cuando el contenido dejó de moverse

---

## Notes

- **Tareas T102–T105**: incorporadas tras el informe de `/speckit-analyze` (issues C1, I1 y G1). Están
  ubicadas físicamente en la fase que les corresponde, pero conservan un identificador alto para no
  renumerar las 101 tareas anteriores y romper las referencias cruzadas existentes. **Para estas
  cuatro, el número de identificador no indica orden de ejecución**: vale la ubicación en el archivo
  y las dependencias declaradas.
- **T102 es bloqueante y temprana**: define las rutas públicas, y una URL publicada es permanente
  (FR-056). Cambiarla después obliga a una redirección. Debe cerrarse antes de T036.
- `[P]` = archivos distintos, sin dependencias pendientes
- Verificar que cada prueba falla antes de implementarla
- Commitear por tarea o por grupo lógico coherente
- Cada checkpoint permite detenerse y validar la historia por separado
- Las tareas T052 y T101 requieren acceso a servicios externos (Cal.com, Vercel) y no pueden
  completarse solo con cambios en el repositorio
