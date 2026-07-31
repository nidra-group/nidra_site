# Contrato — Asistente conversacional embebido

**Feature**: `001-nidra-public-site` | **Versión del contrato**: 1.0 | **Fecha**: 2026-07-30

**Requisitos que cubre**: FR-022, FR-023, SC-015

## Propósito y límite de responsabilidad

El asistente conversacional se desarrolla y opera **fuera de este proyecto**. Este documento define
la frontera entre ambos: qué garantiza el sitio y qué debe garantizar el widget.

La dependencia está invertida a propósito: **el sitio no espera al asistente**. Se publica, convierte
y funciona sin él. El widget se adapta a este contrato, no al revés.

| Responsabilidad | Dueño |
|---|---|
| Punto de montaje, configuración y carga del script | Sitio |
| Reserva del espacio visual para evitar desplazamiento | Sitio |
| Interfaz de conversación, lógica, modelo, agendamiento | Widget |
| Persistencia de la conversación | Widget |
| Política de privacidad que declare el tratamiento de datos | Sitio (redacta) · Widget (informa qué recoge) |

---

## 1. Punto de montaje

El sitio renderiza en todas las páginas del dominio comercial, dentro del layout de `(site)`:

```html
<div
  id="nidra-chat-root"
  data-locale="es"
  data-page="services"
  data-service="workflow-automation"
  aria-live="polite"
></div>
```

| Atributo | Valores | Significado |
|---|---|---|
| `data-locale` | `es` \| `en` | Idioma activo. El widget **MUST** iniciar la conversación en este idioma |
| `data-page` | `home`, `services`, `integrations`, `contact`, `legal` | Página actual, para dar contexto |
| `data-service` | identificador de servicio, o ausente | Servicio en foco, si la página lo tiene |

El elemento **no** se renderiza en el subdominio del perfil (`jmujica.nidra.cloud`).

## 2. Carga del script

```html
<script src="https://<host-del-widget>/embed.js" defer data-nidra-chat></script>
```

**Garantías del sitio**:

- El script se carga con `defer` y **nunca** bloquea el renderizado.
- Se inyecta después de que la página quede interactiva, no en el HTML inicial.
- El sitio **no** incluye el script en el presupuesto de JavaScript de ruta: el widget es
  responsable de su propio peso.

**Requisitos del widget**:

| ID | Requisito |
|---|---|
| W-01 | El paquete inicial **MUST** ser ≤ 50 KB comprimido. El resto se carga bajo interacción del visitante |
| W-02 | **MUST NOT** cargar fuentes, hojas de estilo ni recursos que afecten el renderizado del documento anfitrión |
| W-03 | **MUST NOT** modificar el DOM fuera de `#nidra-chat-root` ni sus propios contenedores |
| W-04 | **MUST NOT** definir estilos globales. Todo estilo va aislado (shadow DOM o iframe) |

## 3. Interfaz de programación

El widget expone en `window`:

```typescript
interface NidraChat {
  init(config: NidraChatConfig): void
  open(): void
  close(): void
  setContext(ctx: { locale: 'es' | 'en'; page: string; service?: string }): void
  destroy(): void
}

interface NidraChatConfig {
  locale: 'es' | 'en'
  page: string
  service?: string
  mountId: string          // siempre 'nidra-chat-root'
  onReady?: () => void
  onError?: (error: Error) => void
}
```

**Contrato de navegación**: al cambiar de ruta o de idioma sin recarga completa, el sitio llama a
`setContext()`. El widget **MUST** actualizar su idioma y contexto sin perder la conversación en
curso.

## 4. Estabilidad visual — no negociable

FR-023 y el Principio II de la constitución prohíben que el widget desplace contenido.

| ID | Requisito |
|---|---|
| W-05 | El sitio reserva un área fija de **64 × 64 px** en la esquina inferior. El widget **MUST NOT** exceder esa huella en su estado cerrado |
| W-06 | El widget **MUST** posicionarse con `position: fixed`. **MUST NOT** insertarse en el flujo del documento |
| W-07 | `z-index` asignado: **9000**. El widget **MUST NOT** superarlo (el sitio reserva 9500+ para diálogos propios) |
| W-08 | El widget **MUST NOT** provocar desplazamiento acumulado medible al montarse, en ningún momento de la carga |
| W-09 | En pantallas < 480 px, el estado abierto **MUST** dejar accesible la navegación principal, o cerrarse al navegar |

## 5. Accesibilidad

Hereda las obligaciones del Principio I y de FR-049.

| ID | Requisito |
|---|---|
| W-10 | Todo control **MUST** ser operable por teclado, con foco visible |
| W-11 | El estado abierto **MUST** atrapar el foco y devolverlo al disparador al cerrarse |
| W-12 | La tecla `Escape` **MUST** cerrar el widget |
| W-13 | Los mensajes entrantes **MUST** anunciarse a lectores de pantalla mediante una región activa |
| W-14 | Contraste mínimo 4.5:1 en texto; el widget **MUST** respetar `prefers-reduced-motion` |
| W-15 | El widget **MUST NOT** robar el foco al cargarse ni abrirse automáticamente sin acción del visitante |

## 6. Privacidad

| ID | Requisito |
|---|---|
| W-16 | El widget **MUST NOT** instalar cookies ni identificadores persistentes de seguimiento en el dominio de Nidra (FR-054). El estado de sesión va en `sessionStorage` de su propio origen |
| W-17 | **MUST NOT** recoger datos personales sin declararlos previamente al equipo del sitio, que debe reflejarlos en la política de privacidad (FR-053) |
| W-18 | **MUST NOT** transmitir el contenido de formularios ni de otras partes de la página |
| W-19 | El equipo del widget **MUST** entregar la lista de datos recogidos, su finalidad y su plazo de conservación antes de la puesta en producción |

**W-19 es una puerta de publicación**: sin esa lista no se puede redactar una política de privacidad
veraz, y sin política veraz el widget no sale a producción.

## 7. Degradación — el requisito central

FR-023 y SC-015: **la ausencia o el fallo del widget no puede impedir nada**.

| Escenario | Comportamiento exigido |
|---|---|
| El script no carga (red, DNS, caída del proveedor) | La página funciona íntegra. El área reservada queda vacía, sin marcador de carga perpetuo ni mensaje de error |
| Un bloqueador de anuncios lo bloquea | Igual que el anterior. El sitio **MUST NOT** detectar bloqueadores ni pedir que se desactiven |
| `init()` lanza una excepción | El sitio la captura y la registra sin datos personales. No se muestra nada al visitante |
| El script tarda más de 5 segundos | El sitio abandona la carga. No se reintenta |
| JavaScript deshabilitado | El widget no existe. Formulario y reserva siguen operativos (FR-050) |

**En todos los casos**, la reserva de reuniones sigue disponible mediante el enlace de `/contacto`, y
el formulario sigue enviándose. El widget es una comodidad, nunca el único camino.

## 8. Seguridad

| ID | Requisito |
|---|---|
| W-20 | El script **MUST** servirse por HTTPS desde un host estable, declarado con antelación para la política de seguridad de contenido del sitio |
| W-21 | Cualquier cambio de host o de dominios de destino **MUST** comunicarse antes de desplegarse: la política del sitio lo bloqueará |
| W-22 | El widget **MUST NOT** ejecutar código recibido del servidor de conversación (sin `eval` ni inyección de scripts remotos en tiempo de ejecución) |
| W-23 | El contenido generado por el modelo **MUST** tratarse como texto, nunca como HTML interpretable |

**W-23 es el más importante de esta sección**: la salida de un modelo de lenguaje es contenido no
confiable. Renderizarla como HTML en el dominio de Nidra abre una vía de ejecución de scripts entre
sitios a través del propio asistente.

## 9. Verificación antes de aceptar la integración

- [ ] Con el script bloqueado, ninguna página pierde funcionalidad (SC-015)
- [ ] El desplazamiento acumulado permanece < 0,1 en todas las páginas con el widget cargado (SC-007)
- [ ] El paquete inicial mide ≤ 50 KB comprimido (W-01)
- [ ] Recorrido completo del widget solo con teclado, con foco atrapado y `Escape` operativo
- [ ] Auditoría axe-core sin violaciones nuevas con el widget montado
- [ ] Tras recorrer el sitio con el widget abierto, no hay cookies en el dominio de Nidra (W-16)
- [ ] El cambio de idioma propaga el contexto sin perder la conversación
- [ ] Lista de datos recogidos entregada e incorporada a la política de privacidad (W-19)
- [ ] Host del script declarado en la política de seguridad de contenido (W-20)

## 10. Versionado del contrato

Cambios compatibles (atributos nuevos opcionales, métodos nuevos) suben la versión menor. Cambios
incompatibles (renombrar el punto de montaje, cambiar la firma de `init`) suben la mayor y requieren
coordinar el despliegue con el equipo del widget.
