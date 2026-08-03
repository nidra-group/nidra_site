<!--
SYNC IMPACT REPORT
Version change: (template, unversioned) → 1.0.0
Bump rationale: MAJOR/initial — first ratification of the project constitution.

Modified principles:
  [PRINCIPLE_1_NAME] → I. Contenido y Accesibilidad Primero
  [PRINCIPLE_2_NAME] → II. Presupuesto de Rendimiento (NO NEGOCIABLE)
  [PRINCIPLE_3_NAME] → III. SEO Verificable
  [PRINCIPLE_4_NAME] → IV. Sistema de Diseño Único
  [PRINCIPLE_5_NAME] → V. Simplicidad y YAGNI

Added sections:
  [SECTION_2_NAME] → Restricciones Técnicas
  [SECTION_3_NAME] → Flujo de Desarrollo y Puertas de Calidad

Removed sections: none

Deferred TODOs: ninguno pendiente.

---

Version change: 1.0.0 → 1.0.1 (2026-07-30)
Bump rationale: PATCH — resolución de un TODO diferido, sin cambio semántico de ningún principio.

Modified sections:
  Restricciones Técnicas → se cierra TODO(ANALYTICS_VENDOR) con el proveedor decidido en la fase
  de plan de la funcionalidad 001 (specs/001-nidra-public-site/research.md, R-007).

Resolved TODOs:
  - TODO(PRODUCT_POSITIONING): resuelto en specs/001-nidra-public-site/spec.md — agencia de
    desarrollo de software con IA para PyMEs y emprendedores, con seis servicios definidos.
  - TODO(ANALYTICS_VENDOR): resuelto — Vercel Web Analytics.

---

Version change: 1.0.1 → 1.1.0 (2026-08-03)
Bump rationale: MINOR — se reemplaza un umbral del Principio II por uno medible. El principio
y su intención se conservan íntegros; lo que cambia es un número que la tecnología elegida
hace inalcanzable. Se evaluó como MAJOR, por tratarse de relajar un umbral marcado NO
NEGOCIABLE, y se descartó: no se elimina ni se invierte ningún principio, y la regla que lo
reemplaza es más exigente sobre lo único que el equipo controla.

Modified principles:
  II. Presupuesto de Rendimiento → el presupuesto de JavaScript deja de ser un absoluto de
  120 KB comprimidos y pasa a ser «el piso del marco de trabajo más 15 KB». Se anota el piso
  medido, con fecha y evidencia. Se agrega la exigencia de medir sobre tres corridas e
  informar mediana y peor caso.

Motivo, con la evidencia:
  El umbral de 120 KB se escribió antes de elegir la tecnología. Medido en producción el
  2026-08-03, el sitio envía 173 KB comprimidos en la portada y 172 KB en la vista de
  impresión del currículum, que casi no tiene contenido interactivo. Ese kilobyte de
  diferencia entre la página más rica y la más pobre prueba que el peso es del marco de
  trabajo, no del código propio.

  Se probaron los dos candidatos a recorte y ninguno sirvió: mover el selector de idioma al
  servidor SUBIÓ el JavaScript, porque el menú móvil lo importa y viaja igual; y quitar
  Vercel Analytics ahorra 1,5 KB a cambio de perder toda visibilidad del tráfico.

  La exigencia de tres corridas nace del mismo día: una medición aislada informó 1.7 s de
  LCP donde la mediana real era 2.31 s, y estuvo a punto de darse por buena.

Deferred TODOs: ninguno pendiente.
-->

# Nidra Site Constitution

## Core Principles

### I. Contenido y Accesibilidad Primero

El sitio es un producto de comunicación, no una demo técnica. Cada página MUST ser
comprensible y operable sin JavaScript en su contenido esencial: el texto, la navegación
principal y los enlaces de conversión MUST renderizarse desde el servidor.

Reglas no negociables:

- Todas las páginas MUST cumplir WCAG 2.1 nivel AA: contraste mínimo 4.5:1 en texto normal,
  jerarquía de encabezados sin saltos, `alt` descriptivo en toda imagen con contenido.
- Todo elemento interactivo MUST ser operable por teclado, con foco visible.
- Ninguna animación MUST ejecutarse cuando el usuario declara `prefers-reduced-motion`.
- El contenido MUST estar separado del componente que lo presenta, para poder editarlo sin
  tocar código de layout.

Rationale: la única métrica de éxito de un sitio de marketing es que el mensaje llegue. Un
usuario que no puede leer, tabular o cargar la página es una conversión perdida, y la
accesibilidad es además una obligación legal creciente.

### II. Presupuesto de Rendimiento (NO NEGOCIABLE)

El rendimiento es un requisito funcional con umbrales medibles, no una optimización posterior.

Umbrales en producción, medidos en móvil con red 4G simulada:

- Largest Contentful Paint (LCP) MUST ser ≤ 2.5 s.
- Cumulative Layout Shift (CLS) MUST ser ≤ 0.1.
- Interaction to Next Paint (INP) MUST ser ≤ 200 ms.
- El JavaScript inicial por ruta MUST NOT superar el piso del marco de trabajo en más de
  15 KB comprimidos. El piso se mide, se anota abajo con su fecha, y se vuelve a medir al
  actualizar Next o React.
- Toda imagen MUST servirse en formato moderno (AVIF/WebP), con dimensiones explícitas y
  carga diferida salvo la imagen del primer viewport.

**Piso medido el 2026-08-03** sobre Next 16.2 y React 19.2: **173 KB comprimidos**. La
portada completa envía 173 KB y la vista de impresión del currículum —una página casi sin
contenido interactivo— envía 172 KB. Ese kilobyte de diferencia entre la página más rica del
sitio y la más pobre es la medición que demuestra que el peso no es del código propio: son
react-dom y el enrutador de Next, que viajan idénticos en toda ruta.

Toda medición MUST hacerse sobre producción y sobre al menos tres corridas, informando la
mediana y la peor. Una sola corrida de Lighthouse varía lo suficiente como para declarar
cumplido un umbral que no se cumple: durante la medición del 2026-08-03 una corrida aislada
dio 1.7 s de LCP donde la mediana real era 2.31 s.

Un cambio que rompa cualquiera de estos umbrales MUST ser corregido o revertido antes de
mergear; no se acepta como deuda técnica.

Rationale: cada 100 ms de latencia adicional degrada la conversión de forma medible, y en un
sitio estático no existe justificación de negocio para ser lento.

Rationale del presupuesto de JavaScript: hasta la versión 1.0.1 este umbral era un absoluto
de 120 KB, escrito antes de elegir la tecnología. Con Next App Router y React 19 no es
alcanzable —ni siquiera por una página vacía—, así que quedaba permanentemente incumplido.
Un umbral que nadie puede cumplir deja de ser una restricción y pasa a ser ruido: quien
audite el proyecto encuentra un incumplimiento, investiga, y descubre que no había nada que
corregir. Lo que se conserva es la intención de la regla, que es lo que sí se controla: que
el código propio no agregue peso apreciable sobre el que impone el marco de trabajo.

### III. SEO Verificable

Cada página pública MUST ser indexable y describirse a sí misma sin intervención manual
posterior.

- Toda ruta pública MUST definir `title`, `meta description`, URL canónica y metadatos Open
  Graph/Twitter Card.
- El sitio MUST publicar `sitemap.xml` y `robots.txt` generados desde las rutas reales, nunca
  escritos a mano.
- Los datos estructurados (JSON-LD) MUST estar presentes donde el tipo de contenido lo admita
  (Organization como mínimo).
- Una URL publicada MUST considerarse permanente: eliminarla o moverla REQUIERE una
  redirección 301.

Rationale: el tráfico orgánico es el canal principal de un sitio de marketing, y los errores
de SEO se descubren semanas tarde, cuando el costo de corregirlos ya se pagó en tráfico.

### IV. Sistema de Diseño Único

La coherencia visual se garantiza por construcción, no por revisión.

- Colores, tipografías, espaciados y radios MUST definirse como tokens en la configuración de
  Tailwind y consumirse desde ahí. Los valores mágicos en clases arbitrarias
  (p. ej. `text-[#3a3a3a]`) MUST NOT usarse para valores que ya existan como token.
- Los elementos de UI repetidos (botón, tarjeta, sección, campo de formulario) MUST existir
  como un único componente compartido antes de su segundo uso.
- Cada página MUST ser legible y funcional desde 320 px de ancho.

Rationale: un sitio de marketing es una pieza de marca; la deriva visual entre páginas erosiona
la confianza más rápido que cualquier bug.

### V. Simplicidad y YAGNI

Se construye lo que la especificación vigente pide, y nada más.

- Una dependencia nueva MUST justificarse por escrito en el plan: qué problema resuelve y por
  qué no alcanza la plataforma. Las dependencias solo de estilo MUST NOT agregarse.
- Un CMS, una base de datos, autenticación o backend propio MUST NOT introducirse hasta que
  una especificación aprobada lo requiera.
- La abstracción se agrega ante el tercer caso de uso real, nunca ante el primero anticipado.

Rationale: la complejidad prematura es el costo dominante en sitios de marketing, cuyo ciclo
de vida real es editar contenido, no ampliar arquitectura.

## Restricciones Técnicas

- Stack fijo: Next.js (App Router) + TypeScript en modo `strict` + Tailwind CSS.
- El renderizado por defecto MUST ser estático (SSG). El renderizado dinámico REQUIERE
  justificación explícita en el plan de la funcionalidad.
- TypeScript MUST compilar sin errores y sin `any` explícito; suprimir un error de tipos
  REQUIERE un comentario que explique el motivo.
- Ningún secreto MUST vivir en el repositorio. La configuración por entorno MUST leerse de
  variables de entorno, validadas al arrancar.
- La analítica MUST ser sin cookies y sin datos personales, de modo que el sitio no requiera un
  banner de consentimiento. El proveedor es Vercel Web Analytics, resuelto en la fase de plan de la
  funcionalidad 001 (research.md, R-007). Cambiarlo REQUIERE verificar que el reemplazo tampoco use
  cookies ni identificadores persistentes.
- Los formularios MUST degradar a un envío HTTP estándar y MUST validarse también en servidor.

## Flujo de Desarrollo y Puertas de Calidad

- Todo trabajo MUST seguir el flujo Spec Kit: `/speckit-specify` → `/speckit-plan` →
  `/speckit-tasks` → `/speckit-implement`. No se escribe código de funcionalidad sin una
  especificación aprobada.
- Cada funcionalidad MUST desarrollarse en su propia rama; `main` MUST permanecer desplegable
  en todo momento.
- Puertas obligatorias antes de mergear:
  1. Build de producción exitoso.
  2. `tsc` y linter sin errores.
  3. Auditoría Lighthouse en móvil ≥ 90 en Performance, Accessibility, Best Practices y SEO.
  4. Verificación visual en 320 px, 768 px y 1280 px.
- Los cambios de contenido (texto, imágenes) MUST NOT requerir cambios de código; si lo
  requieren, es un defecto del Principio I.

## Governance

Esta constitución prevalece sobre cualquier otra práctica, preferencia o costumbre del
proyecto. Ante conflicto entre esta constitución y un plan, tarea o revisión, prevalece la
constitución.

- **Enmiendas**: toda modificación MUST proponerse como un cambio a este archivo, con
  justificación escrita y, si aplica, plan de migración del código existente. Una enmienda no
  tiene efecto retroactivo sobre trabajo ya mergeado salvo que la propia enmienda lo declare.
- **Versionado**: se aplica versionado semántico. MAJOR ante la eliminación o redefinición
  incompatible de un principio; MINOR ante un principio o sección nueva o una ampliación
  material de la guía; PATCH ante aclaraciones, redacción o correcciones no semánticas.
- **Cumplimiento**: toda revisión de código MUST verificar explícitamente el cumplimiento de
  los principios. Cualquier complejidad que se aparte del Principio V MUST justificarse en el
  plan de la funcionalidad; una justificación ausente es motivo suficiente para rechazar el
  cambio.
- **Excepciones**: una excepción temporal MUST documentarse en el plan de la funcionalidad,
  con el principio afectado, el motivo y la condición de salida. Una excepción sin condición
  de salida MUST NOT aprobarse.

**Version**: 1.1.0 | **Ratified**: 2026-07-30 | **Last Amended**: 2026-08-03
