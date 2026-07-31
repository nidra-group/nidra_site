# Contrato — Formulario de consulta y reserva de reuniones

**Feature**: `001-nidra-public-site` | **Fecha**: 2026-07-30

**Requisitos que cubre**: FR-009 a FR-021, SC-003, SC-004, SC-005, SC-017

---

## Parte 1 — Server Action del formulario

### Interfaz

```typescript
// actions/submit-inquiry.ts
'use server'

type InquiryResult =
  | { status: 'success' }
  | { status: 'invalid'; errors: Record<string, string> }   // clave de traducción, no texto
  | { status: 'failed'; reason: 'delivery' | 'rate_limit' }

export async function submitInquiry(
  prev: InquiryResult | null,
  formData: FormData,
): Promise<InquiryResult>
```

Los errores viajan como **claves de traducción**, nunca como texto renderizado. El componente las
resuelve en el idioma activo, lo que evita mensajes en español dentro de la página en inglés
(FR-029, FR-035).

### Invocación y mejora progresiva

```tsx
<form action={submitInquiry}>   {/* sin JS: POST HTTP estándar */}
```

**FR-050 / SC-016 — sin JavaScript**: el envío es un POST nativo del navegador, el servidor valida y
responde con la página renderizada, incluyendo errores por campo y los valores ya ingresados
(FR-012). No hay un segundo camino de código: es la misma acción.

**Con JavaScript**: el envío ocurre sin recarga, el botón se deshabilita durante el envío y la
confirmación aparece en una región activa anunciada a lectores de pantalla.

### Campos

| Campo | Tipo | Obligatorio | Reglas |
|---|---|---|---|
| `name` | texto | Sí | 2–100 caracteres |
| `email` | correo | Sí | formato válido, ≤ 254 |
| `company` | texto | No | ≤ 120 |
| `service` | selección | Sí | uno de los 6 identificadores, u `other` |
| `message` | área de texto | Sí | 20–2000 caracteres |
| `locale` | oculto | Sí | `es` \| `en` |
| `website` | oculto (trampa) | — | **debe llegar vacío** |
| `ts` | oculto (firmado) | Sí | antigüedad ≥ 3 s y ≤ 1 h |

El esquema Zod es **el mismo objeto** en cliente y servidor (FR-010). No hay dos listas de reglas que
puedan divergir.

### Anti-automatización (FR-016)

Tres capas, ninguna de las cuales pide al visitante resolver nada:

| Capa | Mecanismo | Rechaza |
|---|---|---|
| 1 | Campo trampa `website`, oculto por CSS y con `aria-hidden` + `tabindex="-1"` | Bots que rellenan todo campo del DOM |
| 2 | Marca temporal firmada: < 3 s o > 1 h se descarta | Envíos automatizados instantáneos y reproducciones de formularios viejos |
| 3 | Límite de frecuencia por IP en el borde: 5 envíos / 10 min | Ráfagas |

**Descartado explícitamente**: cualquier desafío tipo CAPTCHA, incluidos los "invisibles". Todos
degradan a un desafío visual ante la duda y ninguno funciona sin JavaScript — incumplirían FR-016 y
FR-050 a la vez.

El campo trampa se oculta con CSS, **no** con `type="hidden"`: un campo oculto nativo es trivial de
detectar para un bot, un campo de texto normal movido fuera de la vista, no.

### Idempotencia (FR-017)

```text
Idempotency-Key = sha256(email + message + floor(Date.now() / 600_000))
```

Enviada al proveedor de correo. Dos envíos idénticos dentro de la misma ventana de 10 minutos
producen **un solo** correo, **sin almacenar nada** en el sitio — que es la exigencia de RD-004.

### Entrega (FR-013, FR-015)

| Aspecto | Definición |
|---|---|
| Proveedor | Resend |
| Destino | `CONTACT_INBOX` (variable de entorno) |
| Remitente | Dominio verificado de `nidra.cloud` |
| `Reply-To` | El correo del visitante — responder desde el cliente de correo funciona directamente |
| Asunto | `[Nidra] Consulta — {service} — {name}` |
| Cuerpo | Plantilla React Email versionada en el repositorio |
| Reintentos | 3, con retroceso exponencial (1 s, 4 s, 9 s) |
| Al agotar reintentos | `{ status: 'failed', reason: 'delivery' }`; se registra código de error y marca temporal **sin datos personales** |

**Sin persistencia** (FR-014): la consulta no se escribe en ningún almacén. Si la entrega falla tras
los reintentos, el contenido se pierde y el visitante recibe el canal alternativo (FR-012). Es una
concesión consciente registrada en el checklist de la spec.

### Respuestas al visitante

| Resultado | Qué ve |
|---|---|
| `success` | Confirmación con el plazo comprometido: "Te respondemos dentro de un día hábil" (FR-011) |
| `invalid` | Errores por campo, foco en el primero, valores conservados (FR-012) |
| `failed: delivery` | Mensaje de fallo + correo directo como canal alternativo (FR-012) |
| `failed: rate_limit` | Mensaje de espera + correo directo |

### Seguridad y privacidad

- Sin secretos en el cliente: `RESEND_API_KEY` solo existe en el servidor, validada al arrancar.
- Todo campo se recorta y se limita en longitud antes de componer el correo.
- El cuerpo del correo trata la entrada del visitante como **texto**, nunca como HTML interpretable.
- No se registran datos personales en ningún log (FR-015).
- La política de privacidad declara: qué se recoge, para qué, que **no se almacena** y por qué vía se
  entrega (FR-053).

---

## Parte 2 — Reserva de reuniones

### Decisión

Proveedor **Cal.com Cloud** (plan gratuito) con el Google Calendar del responsable conectado (R-003).

### Interfaz expuesta por el sitio

```html
<a href="https://cal.com/nidra/30min?lang=es" rel="noopener">Agendar una reunión</a>
```

**Enlace, no incrustación.** Es la decisión central de esta parte y responde a dos principios:

- **Principio I / FR-050**: un enlace funciona sin JavaScript. Una incrustación, no.
- **Principio II**: incrustar un widget de terceros en la página de conversión gasta presupuesto de
  JavaScript. Un enlace cuesta 0 KB.

El parámetro `lang` se deriva del idioma activo para que el visitante reserve en su idioma (FR-029).

La incrustación en línea queda como **mejora opcional**, cargada solo bajo interacción explícita, y
solo si se verifica que no degrada las métricas de la página.

### Cobertura de requisitos por el proveedor

| Requisito | Cómo lo cumple Cal.com |
|---|---|
| FR-019 — no ofrecer horarios ocupados | Lee disponibilidad real del calendario conectado |
| FR-019 — escribir en la agenda real | Crea el evento en Google Calendar al confirmar |
| FR-020 — notificar a ambas partes | Correo de confirmación al visitante y al responsable |
| FR-020 — enlace de videollamada | Generado automáticamente al confirmar |
| FR-021 — reprogramar y cancelar | Enlaces propios en el correo de confirmación |
| FR-018 — disponible sin el asistente | Es una URL independiente del sitio y del widget |

### Configuración requerida

| Parámetro | Valor |
|---|---|
| Tipo de evento | Reunión inicial, 30 minutos, videollamada |
| Calendario conectado | Google Calendar del responsable, comprobación de conflictos activada |
| Antelación mínima | 4 horas |
| Ventana de reserva | 30 días |
| Zona horaria | Detectada del visitante; agenda en `America/Argentina/Buenos_Aires` |
| Campos solicitados | Nombre, correo, empresa, motivo |
| Idiomas | Español e inglés |

### Límite del sistema

La reserva **no se modela ni se almacena** en este proyecto (ver [data-model.md](../data-model.md#8-reserva-de-reunión)).
El sitio solo origina la reserva. Los datos que el visitante entrega en Cal.com se rigen por la
política de ese proveedor, hecho que la política de privacidad de Nidra debe declarar (FR-053).

---

## Verificación

- [ ] Con JavaScript deshabilitado, el formulario se envía y muestra errores y confirmación (SC-016)
- [ ] Un envío válido llega a la casilla en menos de 5 minutos (SC-003)
- [ ] Un envío con el campo trampa relleno se rechaza sin llegar al proveedor de correo
- [ ] Un envío antes de 3 segundos se rechaza
- [ ] Dos envíos idénticos en la misma ventana producen un solo correo (FR-017)
- [ ] Un fallo de entrega muestra el canal alternativo y conserva lo escrito (FR-012)
- [ ] Ningún log contiene datos personales (FR-015)
- [ ] El recorrido completo del formulario es operable solo con teclado (SC-009)
- [ ] Los errores se anuncian a lectores de pantalla y el foco va al primer campo con problema
- [ ] En la página en inglés, todo error aparece en inglés (FR-029)
- [ ] El enlace de reserva funciona sin JavaScript y abre en el idioma activo
- [ ] Ocupar un horario en Google Calendar lo retira de la disponibilidad ofrecida (SC-005)
- [ ] Una reserva confirmada llega al calendario del responsable con enlace de videollamada (FR-020)
