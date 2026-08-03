# Quickstart — Validación del sitio público de Nidra

**Feature**: `001-nidra-public-site` | **Fecha**: 2026-07-30

Guía para levantar el proyecto y **verificar que cumple lo especificado**. No es documentación de
implementación: los detalles de diseño están en [plan.md](./plan.md),
[data-model.md](./data-model.md) y [contracts/](./contracts/).

---

## Prerequisitos

| Requisito | Versión | Nota |
|---|---|---|
| Node.js | 22 LTS | — |
| pnpm | 9+ | — |
| git | cualquiera | **Con historial completo**: la versión del CV se deriva de él |
| Cuenta Resend | — | Dominio `nidra.cloud` verificado |
| Cuenta Cal.com | plan gratuito | Google Calendar del responsable conectado |

## Variables de entorno

```bash
cp .env.example .env.local
```

| Variable | Para qué | Obligatoria |
|---|---|---|
| `RESEND_API_KEY` | Entrega del formulario | Sí |
| `CONTACT_INBOX` | Casilla destino de las consultas | Sí |
| `NEXT_PUBLIC_SITE_URL` | Canónicas, sitemap, metadatos | Sí |
| `NEXT_PUBLIC_PROFILE_URL` | Subdominio del perfil | Sí |
| `NEXT_PUBLIC_BOOKING_URL` | Enlace de reserva de Cal.com | Sí |
| `NEXT_PUBLIC_CHAT_EMBED_URL` | Script del asistente | No — sin ella el sitio funciona igual |

Se validan con Zod al arrancar: si falta una obligatoria, el proceso falla de inmediato con el nombre
de la variable, en lugar de romperse más tarde en una ruta al azar.

Que `NEXT_PUBLIC_CHAT_EMBED_URL` sea opcional **es el requisito FR-022 hecho configuración**: el
sitio se construye y se publica sin que el asistente exista.

## Puesta en marcha

```bash
pnpm install
pnpm dev
```

| URL | Qué es |
|---|---|
| `http://localhost:3000` | Redirige a `/es` o `/en` según el navegador |
| `http://localhost:3000/es` | Portada en español |
| `http://localhost:3000/en` | Portada en inglés |
| `http://profile.localhost:3000` | Espacio profesional (simula el subdominio) |

---

## Escenarios de validación

Cada escenario mapea a historias y criterios de la [spec](./spec.md).

### V1 — Evaluar la oferta (Historia 1 · SC-001)

```bash
pnpm dev
```

1. Abrir `/es` en una ventana de 375 px de ancho.
2. **Sin desplazarse**, deben verse: qué hace Nidra, a quién le sirve y una acción de contacto.
3. La grilla debe mostrar **exactamente 6** servicios.
4. Seleccionar un servicio lleva a su detalle con problema, entregables y plazo.
5. La portada muestra el proceso de trabajo en pasos.

### V2 — Sin JavaScript (SC-016 · FR-050) — **el más importante**

```bash
pnpm test:e2e -- --grep "no-js"
```

Manual: desactivar JavaScript en el navegador y recorrer el sitio.

- [ ] Todas las páginas informativas se leen completas
- [ ] La navegación entre páginas funciona
- [ ] El selector de idioma funciona
- [ ] El formulario **se envía** y muestra errores y confirmación
- [ ] El enlace de reserva funciona
- [ ] El área del asistente queda vacía, sin marcador de carga perpetuo

### V3 — Formulario de consulta (Historia 2 · SC-003)

```bash
pnpm test:e2e -- --grep "contact-form"
```

| Caso | Resultado esperado |
|---|---|
| Datos válidos | Confirmación con el plazo comprometido; correo en la casilla en < 5 min |
| Correo mal formado | Error en el campo, resto de los datos conservado |
| Campo trampa relleno | Rechazado sin llegar al proveedor de correo |
| Envío antes de 3 s | Rechazado |
| Dos envíos idénticos seguidos | **Un solo** correo recibido |
| Clave de Resend inválida | Mensaje de fallo + canal alternativo; ningún dato personal en los logs |

### V4 — Idiomas (Historia 3 · SC-010)

```bash
pnpm test:unit -- messages-parity
pnpm test:e2e -- --grep "i18n"
```

- [ ] Cambiar de idioma mantiene la página, no vuelve a la portada
- [ ] `/en/servicios` y `/es/servicios` existen y son coherentes
- [ ] Ninguna página mezcla idiomas ni muestra identificadores de traducción
- [ ] Cada página declara su equivalente en el otro idioma
- [ ] Los errores del formulario aparecen en el idioma de la página

### V5 — Reserva de reuniones (Historia 2 · SC-004, SC-005)

Requiere Cal.com configurado con el Google Calendar conectado.

1. Desde `/es/contacto`, usar la acción de agenda → abre Cal.com en español.
2. Reservar un horario. Verificar:
   - [ ] Aparece en el Google Calendar del responsable
   - [ ] Ambas partes reciben notificación con enlace de videollamada
   - [ ] La confirmación incluye enlaces de reprogramación y cancelación
3. Ocupar manualmente un horario en Google Calendar → **deja de ofrecerse** (SC-005).
4. Recorrido completo de portada a reunión confirmada en menos de 2 minutos (SC-004).

### V6 — Currículum y descargas (Historia 5 · SC-013, SC-014)

```bash
pnpm build          # genera los PDF
pnpm test:unit -- cv-schema
```

- [ ] El perfil se lee completo en `/cv` sin descargar nada
- [ ] Cada combinación ofrecida de idioma y formato descarga un archivo válido
- [ ] El contenido descargado coincide con lo mostrado en pantalla
- [ ] El nombre del archivo lleva persona, idioma, fecha y hash
- [ ] `/cv/print` impreso desde el navegador no muestra navegación ni corta secciones
- [ ] Una combinación no generada **no aparece** en el selector

**Validación del esquema** — cada caso debe romper el build con mensaje claro:

```bash
# Editar content/cv/profile.yaml e introducir el error, luego:
pnpm build
```

| Error introducido | Debe fallar por |
|---|---|
| `end` anterior a `start` | Cronología inconsistente |
| Dos experiencias sin `end` | Más de un puesto vigente |
| Quitar `role.en` | Campo bilingüe incompleto |
| `achievements` vacío | Experiencia sin logros |

### V7 — Contenido versionado (Historia 6 · SC-012)

1. Editar un texto en `content/services.yaml` y commitear.
2. Verificar que se publica **sin tocar ningún archivo de `components/`**.
3. Editar `content/cv/profile.yaml`, commitear y reconstruir.
4. El nombre del PDF debe reflejar el nuevo hash y fecha.
5. `git log content/cv/profile.yaml` reconstruye la evolución del currículum.

### V8 — Accesibilidad (SC-009 · SC-011)

```bash
pnpm test:a11y
```

- [ ] Sin violaciones axe-core de nivel A ni AA en ninguna ruta
- [ ] Recorrido de portada a consulta enviada **solo con teclado**
- [ ] Foco visible en todo elemento interactivo
- [ ] Legible y operable a 320 px y con texto al 200%, sin desplazamiento horizontal
- [ ] Sin animaciones bajo `prefers-reduced-motion`

### V9 — Rendimiento y SEO (SC-006, SC-007, SC-008)

```bash
pnpm build && pnpm lighthouse
```

| Métrica | Umbral |
|---|---|
| Rendimiento, Accesibilidad, Buenas prácticas, SEO | ≥ 90 cada una, en móvil |
| LCP | ≤ 2,5 s |
| CLS | ≤ 0,1 |
| JS inicial por ruta | piso del marco + 15 KB (piso medido 2026-08-03: 173 KB) |
| Medición | 3 corridas sobre producción; se informa mediana y peor |

- [ ] Cada página declara título, descripción, canónica y metadatos de vista previa
- [ ] Los mapas del sitio se generan desde las rutas reales, uno por dominio
- [ ] Una URL compartida muestra vista previa correcta en el idioma de la página

### V10 — Sin cookies (SC-018 · FR-054)

Recorrer todas las páginas y revisar el almacenamiento del navegador.

- [ ] Cero cookies en el dominio de Nidra
- [ ] Ningún identificador persistente de seguimiento
- [ ] No hay banner de consentimiento — porque no hace falta

### V11 — Degradación del asistente (SC-015)

```bash
# Sin la variable, el asistente ni se carga
unset NEXT_PUBLIC_CHAT_EMBED_URL && pnpm build && pnpm start
```

- [ ] Todas las páginas funcionan íntegras
- [ ] Se puede enviar una consulta y reservar una reunión
- [ ] Ningún error visible ni marcador de carga perpetuo

Con el asistente configurado, bloquear su host en el navegador y repetir. Verificar además que el
desplazamiento acumulado sigue < 0,1 al montarse el widget.

La lista completa de verificación del widget está en
[contracts/chatbot-widget.md](./contracts/chatbot-widget.md#9-verificación-antes-de-aceptar-la-integración).

---

## Puertas antes de mergear

Exigidas por la [constitución](../../.specify/memory/constitution.md).

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm test:e2e && pnpm lighthouse
```

| # | Puerta | Comando |
|---|---|---|
| 1 | Build de producción | `pnpm build` |
| 2 | Tipos y linter sin errores | `pnpm typecheck && pnpm lint` |
| 3 | Lighthouse móvil ≥ 90 en las 4 categorías | `pnpm lighthouse` |
| 4 | Verificación en 320 / 768 / 1280 px | `pnpm test:e2e -- --grep "responsive"` |

---

## Despliegue

| Entorno | Rama | Dominios |
|---|---|---|
| Producción | `main` | `nidra.cloud` · `jmujica.nidra.cloud` |
| Vista previa | cualquier rama | URL efímera de Vercel |

Ambos dominios apuntan al **mismo proyecto**: el middleware reescribe el host del subdominio al grupo
de rutas del perfil (R-009). Configurar los dos en el proyecto de Vercel y cargar las variables de
entorno como secretos del proyecto — **nunca** en el repositorio.
