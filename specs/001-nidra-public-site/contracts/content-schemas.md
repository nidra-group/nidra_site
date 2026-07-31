# Contrato — Esquemas de contenido y currículum

**Feature**: `001-nidra-public-site` | **Fecha**: 2026-07-30

**Requisitos que cubre**: FR-002, FR-003, FR-024 a FR-028, FR-034, FR-035, FR-038 a FR-048

Este es el contrato entre **quien edita contenido** y **el sitio**. Define qué se puede escribir en
`content/` y `messages/`, y qué rechaza el build. Todo esquema se valida con Zod antes de generar
páginas: **un archivo inválido rompe el build, nunca llega a producción**.

Las estructuras completas están en [data-model.md](../data-model.md). Aquí se documentan las
garantías, los mensajes de error y el flujo de publicación.

---

## Principio rector

> El esquema no debe permitir escribir algo falso.

No alcanza con validar tipos. Donde un requisito prohíbe una afirmación, el esquema **no ofrece el
campo donde escribirla**:

| Riesgo | Cómo lo impide el esquema |
|---|---|
| Declarar una alianza comercial inexistente (FR-028) | `relationship` es un enum de `technology` \| `vendor`. No existe `partner`. Declararla exigiría cambiar el código, no solo el contenido |
| Afirmar experiencia en una plataforma que no se domina (Anexo A, regla 3) | El modelo de integración no tiene campo de texto libre. La diferencia entre probada y no probada se expresa **solo** en el orden |
| Publicar contenido en un idioma y no en el otro (FR-034) | Los campos bilingües exigen `es` y `en` en el mismo nodo. El hueco se abre solo |
| Un currículum con cronología imposible (FR-048) | Validación de fechas: `end ≥ start`, `start` no futura, como máximo un puesto vigente |

---

## Archivos bajo contrato

| Archivo | Contenido | Se rompe el build si… |
|---|---|---|
| `content/services.yaml` | Los 6 servicios | No hay exactamente 6, un `id` se repite, falta `problem`/`deliverables`/`timeline`, o `summary` supera 120 caracteres |
| `content/integrations.yaml` | Catálogo del Anexo A | Una categoría queda vacía, un nombre se repite entre categorías, o un logo referenciado no existe |
| `content/technologies.yaml` | "Tecnologías con las que trabajamos" | `relationship` fuera del enum |
| `content/cv/profile.yaml` | Perfil del fundador | Cualquier regla de FR-048 (ver abajo) |
| `messages/es.json` · `messages/en.json` | Cadenas de interfaz | Los conjuntos de claves difieren, o alguna queda vacía |

---

## Garantías de validación del currículum (FR-048)

| Regla | Mensaje de error esperado |
|---|---|
| `start` en `YYYY-MM` y no futura | `profile.experiences[2].start: fecha futura (2027-01)` |
| `end ≥ start` | `profile.experiences[1]: end (2018-03) anterior a start (2019-06)` |
| Máximo una experiencia sin `end` | `profile.experiences: 2 puestos vigentes (epam-bayer, freelance). Solo uno puede estarlo` |
| `achievements` con ≥ 1 elemento | `profile.experiences[3].achievements: vacío` |
| Ambos idiomas en todo campo bilingüe | `profile.experiences[0].role.en: requerido` |
| Ningún campo con cadena vacía | `profile.summary.es: no puede estar vacío` |
| `id` único | `profile.experiences: id duplicado "grinbold"` |

Los mensajes deben **nombrar la ruta exacta del dato**. Un error de validación que obliga a buscar a
mano dónde está el problema es un error de validación mal escrito.

---

## Identificadores inmutables

Estos identificadores aparecen en URLs publicadas. Cambiarlos rompe enlaces externos y viola FR-056.

| Identificador | Dónde aparece |
|---|---|
| `services[].id` | Ancla de `/servicios#<id>` y valor del campo `service` del formulario |
| `integrations.categories[].id` | Ancla de `/integraciones#<id>` |
| `cv.experiences[].id` | Trazabilidad entre versiones del currículum |

**Si un identificador debe cambiar**, se agrega una redirección permanente en la misma entrega que lo
cambia. No es opcional.

---

## Contrato de la versión y los formatos del currículum

### Versión derivada (FR-041, FR-042, FR-045)

```text
hash  = git log -1 --format=%h -- content/cv/profile.yaml
fecha = git log -1 --format=%cs -- content/cv/profile.yaml
```

Nadie mantiene un número de versión a mano. **El historial de git es el versionado del currículum.**

**Caso borde**: si el checkout no tiene historial (clon superficial en CI), el build **debe fallar
con un mensaje explícito**, no emitir un archivo con versión desconocida. Un PDF sin versión
verificable es peor que un build roto.

### Formatos publicados (FR-038, FR-039, RD-001)

| Formato | Ruta | Cómo se produce |
|---|---|---|
| Documento portátil | `/downloads/Juan_Mujica_CV_{ES\|EN}_{fecha}_{hash}.pdf` | Generado en build imprimiendo `/[locale]/cv/print` |
| Versión web imprimible | `/[locale]/cv/print` | Ruta estática con hoja de estilos de impresión |

**Una sola maquetación.** El PDF es el resultado de imprimir la versión web, no una plantilla
paralela. Si la vista de impresión se ve bien, el PDF es correcto por definición — así FR-047 (todas
las representaciones derivan de la misma fuente) se cumple sin sincronizar nada.

**Combinaciones ofrecidas** (FR-040): el selector se construye a partir de los archivos que
**existen** tras el build, no de una lista escrita a mano. Si la generación de un PDF falla, esa
combinación no aparece como elegible en vez de ofrecer una descarga rota.

### Requisitos de la vista de impresión (FR-039, SC-014)

- Sin navegación, sin pie de página, sin selector de idioma, sin fondos decorativos.
- Sin cortes de contenido a mitad de una experiencia o de una sección.
- Tipografía y contraste legibles en escala de grises.
- Márgenes aptos para A4 y Carta.

---

## Flujo de publicación de un cambio de contenido

```text
1. Editar el archivo en content/ o messages/
2. Commit  → el historial registra el cambio (FR-045)
3. Push    → el despliegue ejecuta:
   a. Validación de esquemas Zod          → falla el build si el contenido es inválido
   b. Test de paridad de messages/*.json  → falla si las claves difieren (FR-034)
   c. Generación estática de las rutas
   d. Generación de los PDF del currículum con la versión derivada de git
4. Publicado — siempre la última versión (FR-046)
```

**Ningún paso pide editar código de presentación ni subir un archivo a mano** (FR-044, SC-012). Ese
es el criterio de aceptación de este contrato: si publicar un cambio de texto obliga a tocar
`components/`, el contrato está incumplido.

---

## Verificación

- [ ] Agregar un servicio (7 en total) rompe el build con mensaje claro
- [ ] Quitar la traducción `en` de un campo bilingüe rompe el build nombrando la ruta del dato
- [ ] Agregar una clave a `messages/es.json` sin su par en `en.json` rompe el build
- [ ] Una experiencia con `end` anterior a `start` rompe el build
- [ ] Dos experiencias sin `end` rompen el build
- [ ] `relationship: partner` rompe el build (el enum lo rechaza)
- [ ] Un logo referenciado e inexistente rompe el build
- [ ] Cambiar un texto y desplegar no requiere tocar ningún archivo de `components/`
- [ ] Tras cambiar `profile.yaml`, el nombre del PDF descargado refleja el nuevo hash y fecha
- [ ] La vista de impresión, impresa desde el navegador, no muestra navegación ni corta secciones
- [ ] Si falta un PDF, su combinación no se ofrece en el selector (FR-040)
