# Nidra — sitio público

Sitio institucional bilingüe (es/en) de Nidra, agencia de desarrollo de software con IA para PyMEs,
más el espacio profesional del fundador con descarga de currículum.

Construido con desarrollo guiado por especificación: la fuente de verdad de qué hace el sitio y por
qué está en [`specs/001-nidra-public-site/`](specs/001-nidra-public-site/), y las reglas que ningún
cambio puede romper, en [`.specify/memory/constitution.md`](.specify/memory/constitution.md).

**Dónde está cada cosa:** [repositorio público](#este-repositorio-es-público) ·
[puesta en marcha](#puesta-en-marcha) · [comandos](#comandos) ·
[paleta](#cambiar-la-paleta-de-colores) · [contenido](#editar-el-contenido) ·
[marca](#la-marca) · [currículum](#el-currículum) ·
[asistente](#el-asistente-conversacional) · [desplegar](#desplegar) ·
[rendimiento](#rendimiento) · [verificación](#verificación)

## Este repositorio es público

Lo exige el plan gratuito de Vercel. Nada de lo que se commitea acá es privado.

**Ningún secreto entra al repositorio.** Todo valor sensible llega por variable de entorno y
`.env.local` está en `.gitignore`. `.env.example` lleva los nombres con los valores vacíos.

Si alguna vez se filtra una clave, **no alcanza con borrarla en un commit nuevo**: queda en el
historial y hay que rotarla en el proveedor.

Lo que sí es público a propósito: el contenido del sitio, el currículum del fundador, las
especificaciones y esta documentación.

## Stack

Next.js 16 (App Router) · TypeScript `strict` · Tailwind CSS 4 · next-intl · Zod · Resend · Playwright

Sin base de datos, sin CMS, sin autenticación. Todo el contenido son archivos versionados en git.

## Puesta en marcha

```bash
pnpm install
cp .env.example .env.local     # completar FORM_SECRET: openssl rand -hex 32
pnpm dev
```

| URL | Qué es |
|---|---|
| `localhost:3210` | Redirige según el idioma del navegador |
| `localhost:3210/es` · `/en` | Sitio comercial |
| `localhost:3210/es/cv` | Espacio profesional del fundador |
| `profile.localhost:3210` | Simula el subdominio del perfil |

## Comandos

```bash
pnpm dev           # desarrollo (puerto 3210)
pnpm build         # build
pnpm test          # 116 pruebas unitarias
pnpm test:e2e      # formulario en un navegador real, con y sin JavaScript
pnpm typecheck     # tipos
pnpm lint          # eslint
pnpm generate:cv   # congela la versión, construye e imprime los PDF del currículum
pnpm build:icons   # reextrae los logotipos de tecnologías desde Simple Icons
```

`pnpm build` **no** genera los PDF del currículum. Antes sí, y no funcionaba: el
servidor de despliegue no tiene el navegador que hace falta para imprimirlos ni
el historial de git del que sale su versión. Ver [El currículum](#el-currículum).

El puerto 3210 no es el de Next por defecto: el 3000 está reservado para otra aplicación en la
máquina de desarrollo. Está fijado en `package.json`, en
[`playwright.config.ts`](playwright.config.ts) y en `.claude/launch.json`.

## Cambiar la paleta de colores

Todos los colores del sitio salen de **un solo bloque** al comienzo de
[`app/globals.css`](app/globals.css). Cambiar la identidad visual completa es cambiar esos nueve
valores; ningún otro archivo define un color.

El sitio es **oscuro por defecto**: `--brand-paper` es el fondo de noche y `--brand-ink` el texto
claro. Los nombres conservan su rol semántico (papel = fondo, tinta = texto), así que una paleta
clara se instala invirtiendo esos dos valores.

### «El umbral»

Nidra es sánscrito: en el yoga nidra nombra el sueño consciente, la frontera exacta entre la vigilia
y el sueño. La paleta es esa frontera a una hora concreta — las 05:40 en Buenos Aires, cuando el
cenit todavía no soltó la noche, el horizonte ya está encendido y el alumbrado de sodio sigue
prendido.

Dos decisiones la sostienen: el fondo **tiene tono** (índigo azul, no negro neutro) y el acento es
**cálido y desaturado** (oro pálido de crepúsculo civil, no ámbar ni neón). Frío y cálido en la misma
pantalla es lo que evita que la marca parezca un spa o un laboratorio.

Las tres auroras reproducen el cielo en secuencia vertical: el cenit que se retira, la franja
verde-cian del crepúsculo y el cinturón de Venus. La del medio es la clave — existe de verdad en el
crepúsculo civil, y las paletas de «amanecer» inventadas siempre la saltean.

**Disciplina obligatoria:** el oro aparece poco y solo en lo funcional —un botón primario por
sección, enlaces, un dato destacado—. Nunca como fondo de bloque grande, nunca en tipografía fina,
nunca oro sobre oro. Oro sobre azul marino es también el uniforme del lujo aspiracional, y un dueño
de PyME que ve demasiado oro lee «esto es caro, no es para mí» antes de leer una palabra.

### Probar una paleta candidata

```bash
node scripts/try-palette.mjs candidatas/umbral.json
```

Calcula los once contrastes, **se niega a instalarla si alguno falla** y fotografía la portada real
con ella en `.palettes/`. `--restore` deja el CSS como estaba. Las candidatas descartadas se
conservan en `candidatas/`: son la memoria de qué se probó y por qué.

Dos tokens de borde y no uno, a propósito: `--brand-line` es para separadores decorativos y
`--brand-line-strong` para **bordes de control** —campos de formulario y botones secundarios—, donde
el borde es lo único que delimita el elemento y WCAG 1.4.11 exige 3:1. Usar el token decorativo en
un campo lo vuelve invisible.

La aurora del fondo **no se anima**. Animar `transform` sobre un elemento con `filter: blur()`
impide componer la capa y obliga a re-rasterizar el desenfoque en cada cuadro: medido, el
desplazamiento caía de 60 a 22 fps. Quieta se ve igual y cuesta cero.

El bloque documenta los contrastes mínimos que cada valor debe cumplir para no romper la
accesibilidad. Respetarlos no es opcional:
[`tests/unit/palette.test.ts`](tests/unit/palette.test.ts) verifica las once reglas leyendo los
valores reales del CSS — una paleta que las incumpla **rompe el build**.

La imagen de vista previa para redes ([`app/opengraph-image.tsx`](app/opengraph-image.tsx)) es la
única excepción — `next/og` no lee CSS, así que sus colores están escritos a mano y hay que
actualizarlos junto con la paleta.

## Editar el contenido

Ningún cambio de texto requiere tocar código de presentación.

| Qué querés cambiar | Dónde |
|---|---|
| Los seis servicios | [`content/services.yaml`](content/services.yaml) |
| Catálogo de integraciones | [`content/integrations.yaml`](content/integrations.yaml) |
| Tecnologías de la portada | [`content/technologies.yaml`](content/technologies.yaml) |
| Currículum del fundador | [`content/cv/profile.yaml`](content/cv/profile.yaml) |
| Dirección de contacto | [`lib/contact.ts`](lib/contact.ts) |
| Cualquier otro texto | `messages/es.json` y `messages/en.json` |

Los archivos de contenido se validan al construir: si falta una traducción, si hay dos puestos
laborales vigentes a la vez o si una fecha es imposible, **el build falla** con un mensaje que nombra
la ruta exacta del dato.

Los textos llevan español e inglés en el mismo nodo. Eso hace imposible agregar contenido en un
idioma y olvidarlo en el otro: es el mismo nodo del árbol.

## La marca

Nidra es sánscrito: en el yoga nidra nombra el **sueño consciente**, la frontera exacta entre la
vigilia y el sueño. El logotipo es esa frontera: **la ene es el sol naciente**, de su pie nace el
horizonte que corre hacia la derecha, y «idra» se apoya encima. Una banda horizontal atraviesa la
letra, la barra y la palabra a una misma altura — no es una ranura en una letra, es un plano que
cruza todo.

Vive a dos escalas, y la chica es un fragmento de la grande, así que el símbolo y el nombre se
refuerzan en vez de competir:

| Pieza | Dónde | Archivo |
|---|---|---|
| La palabra completa | Web, membrete, pie de correo | [`components/site/Wordmark.tsx`](components/site/Wordmark.tsx) |
| La ene sola | Pestaña del navegador, icono de aplicación | [`app/icon.svg`](app/icon.svg) |
| Redes | Foto de perfil y portada, en SVG y PNG | [`public/brand/redes/`](public/brand/redes/) |

**Hay una sola copia de los trazados y está en
[`lib/brand/paths.ts`](lib/brand/paths.ts).** Todo lo demás se genera desde ahí:

```bash
pnpm build:brand
```

Nació al revés —el trazado pegado dentro del componente y copiado a mano en otros siete archivos— y
retocar la forma obligaba a acordarse de los siete lugares. Ahora el componente lo importa, el
script lo lee, y `tests/unit/brand.test.ts` falla si algún archivo generado quedó con la versión
vieja. Los archivos generados llevan la nota en el encabezado; **no se editan a mano**.

Fuera de la web, en [`public/brand/`](public/brand/): `nidra-logo-glow.svg` es el principal, con
degradado metálico y halo, y **solo va sobre fondo oscuro**; `nidra-logo-glow-placa.svg` trae su
propia placa índigo para cuando el fondo lo pone otro. Las versiones planas siguen siendo las que
aguantan donde el degradado no existe: `nidra-logo-light.svg` para membrete, factura e impresión, y
`nidra-logo-mono.svg` para sello, bordado o una sola tinta.

**El degradado es la cara de la marca, no su estructura.** La forma tiene que aguantar en negro
sobre blanco, sin degradado ni halo; si no aguanta, el color la estaba sosteniendo. Por eso el
favicon, el mono y la impresión son planos, y no es una limitación de la versión premium sino la
prueba de que la marca está bien resuelta. La parada más oscura del oro da 5.94:1 sobre el índigo,
por encima del 4.5:1 que exige la paleta — hay una prueba que lo verifica.

El favicon es **otro corte**, no una reducción del mismo archivo. A 16 píxeles la palabra entera se
vuelve una mancha, así que ahí va la ene sola. Sus colores están escritos porque un favicon no lee
el CSS del sitio: **al cambiar la paleta hay que correr `pnpm build:brand`**.

**La ene sola no lleva el horizonte.** No es un recorte del lienzo: la barra vive dentro del mismo
subtrazado que el pie derecho de la letra, así que se reescribe el subtrazado para que cierre donde
termina la ene. La versión anterior la dibujaba y la tapaba con el borde, y asomaba un muñón — se
veía sobre todo en la foto de perfil recortada en círculo.

### Los logotipos de tecnologías

La portada y la página de integraciones muestran los logotipos de las tecnologías con las que se
trabaja, extraídos de [Simple Icons](https://simpleicons.org) (CC0) por
[`scripts/build-tech-icons.mjs`](scripts/build-tech-icons.mjs) hacia
[`public/logos/tech.svg`](public/logos/tech.svg), un único archivo que el navegador descarga una vez
y cachea.

Antes iban dibujados en línea en cada página. Medido: eran 47 KB de trazados que viajaban **dos
veces** —una en el HTML y otra en la carga de hidratación—, unos 94 KB de los 233 que pesaba la
portada. Con el archivo aparte, el HTML bajó a 152 KB.

Todos se pintan **en un solo color** y se encienden al pasar el cursor. No es solo estética: un
logotipo en su color corporativo se lee como sello de «socio oficial», y Nidra no lo es de ninguna
de esas empresas. OpenAI y AWS aparecen **sin logotipo**, como marca denominativa en texto: las dos
pidieron ser retiradas de Simple Icons, y nombrarlas es uso nominativo legítimo mientras que dibujar
su marca sin licencia no lo es.

Los logotipos de **integraciones** siguen sin usarse: esas plataformas se listan como texto, para no
insinuar una relación comercial que no existe.

## El currículum

`content/cv/profile.yaml` es la fuente única. De ahí derivan la página web, la vista de impresión y
los PDF en ambos idiomas. No hay copias que sincronizar.

Los PDF se generan **imprimiendo la propia vista web** con Playwright, así que hay una sola
maquetación: si la vista de impresión se ve bien, el PDF es correcto por definición.

La versión no se declara a mano: sale del hash y la fecha del último commit que tocó el YAML. El
historial de git **es** el versionado del currículum.

### Se generan en tu máquina, no en el despliegue

```bash
pnpm generate:cv
```

El orden importa y no es el evidente: **primero** congela la versión de git en
`public/downloads/version.json`, **después** construye —la vista de impresión imprime esa versión en
el pie, así que construir antes daría un PDF que dice una versión y se llama por otra— y recién
entonces imprime. Los tres archivos que produce se commitean junto al cambio del perfil.

Colgaba de `postbuild` y corría en cada despliegue. No funcionaba, y tardó en notarse: `pnpm install`
no descarga el navegador que Playwright necesita, así que la generación fallaba, no quedaba ningún
PDF y el build terminaba en error **antes de publicar nada**.

Peor era lo otro: la versión se derivaba de git **en cada visita**, y la página del currículum era
dinámica. En producción no hay repositorio, así que `/cv` devolvía 500 — y como el subdominio del
perfil sirve esa misma ruta, el espacio profesional entero quedaba caído. Se comprobó levantando el
servidor de producción con un `git` que falla en el PATH: la portada respondía 200 y `/cv`, 500.

Si editás `content/cv/profile.yaml` y te olvidás de regenerar,
[`tests/unit/cv-version.test.ts`](tests/unit/cv-version.test.ts) falla en tu máquina con el comando
exacto en el mensaje. Otra prueba prohíbe importar `readGitCvVersion` desde `app/` o `components/`:
está a un autocompletado de distancia y su costo es un 500 en producción.

## El asistente conversacional

Se desarrolla en un repositorio aparte y se conecta con el sitio por **un solo punto**:

```
NEXT_PUBLIC_CHAT_EMBED_URL=https://chatbot.nidra.cloud/embed.js
```

El encargo, con las decisiones técnicas y sus motivos, está en
[`docs/brief-chatbot.md`](docs/brief-chatbot.md). La frontera entre ambos proyectos —qué garantiza
cada lado— está en
[`specs/001-nidra-public-site/contracts/chatbot-widget.md`](specs/001-nidra-public-site/contracts/chatbot-widget.md).

**Apunta al script, no al host.** Se renderiza tal cual en `<script src="...">`, así que un origen
pelado carga HTML y la etiqueta se ignora en silencio. `lib/env.ts` lo rechaza al construir.

### Esa variable enciende cuatro cosas a la vez

| Qué | Dónde |
|---|---|
| El punto de montaje y el script del widget | [`components/chat/ChatMount.tsx`](components/chat/ChatMount.tsx) |
| La versión de la política de privacidad que declara el asistente | [`components/site/LegalDocument.tsx`](components/site/LegalDocument.tsx) |
| El origen autorizado en `frame-src` y `connect-src` | [`lib/seo/headers.ts`](lib/seo/headers.ts) |
| La declaración de transferencia internacional de datos | `messages/*.json` → `legal.privacy.assistant` |

**Que sea una sola variable es la decisión central.** La política de privacidad tiene dos estados
incompatibles: sin asistente el sitio no tiene ninguna base de datos y lo afirma; con asistente
guarda transcripciones completas en Estados Unidos y tiene que declararlo. Mientras el interruptor
sea uno solo, **es imposible publicar un asistente que recoja datos junto a una política que jure
que no hay base de datos**. La contradicción no puede existir.

El corolario incómodo es el simétrico: cargar la variable antes de que el asistente exista publica
una política que declara un tratamiento de datos que todavía no ocurre. Si querés dejarla
configurada de antemano, cargala **solo en Preview**.

`NEXT_PUBLIC_CHAT_EMBED_URL` se lee al **construir**, no al servir: encenderlo o apagarlo exige un
despliegue nuevo.

### Lo que sigue abierto

Dos de los tres bloqueos que nombraba el encargo están resueltos: la política declara el asistente y
la política de contenido acota al widget. Queda uno, y no es técnico: con una base de datos de
personas y transferencia internacional, **la inscripción ante la AAIP que exige la Ley 25.326 pasa a
ser una pregunta real**. Es un trámite para consultar con un profesional antes de encender.

La región de la base de datos del asistente todavía puede cambiar. Hoy la política declara Oregón;
si se mueve, hay que actualizar **los dos idiomas** —una prueba comprueba que coincidan— porque el
fallo realista es acordarse de uno solo.

## Desplegar

Los pasos completos —dominio, subdominio, correo, agenda y verificación— están
en [`DESPLIEGUE.md`](DESPLIEGUE.md).

## Antes de desplegar

Variables obligatorias en producción — sin ellas **el build falla**, que es deliberado:

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canónicas, sitemap y metadatos sociales |
| `FORM_SECRET` | Firma la marca temporal anti-bot del formulario |

Opcionales — si faltan, la interfaz se adapta en vez de publicar un enlace muerto:

| Variable | Si falta |
|---|---|
| `NEXT_PUBLIC_BOOKING_URL` | La reserva de reuniones no se ofrece en ninguna parte |
| `NEXT_PUBLIC_PROFILE_URL` | El perfil se sirve en `/es/cv` dentro del sitio |
| `NEXT_PUBLIC_CHAT_EMBED_URL` | El asistente conversacional no se monta |
| `RESEND_API_KEY` · `CONTACT_INBOX` | El formulario avisa y ofrece el correo directo |

Ninguna de estas tiene valor por defecto, a propósito: un destino plausible pero inexistente se
publica en silencio y rompe la conversión sin que nadie se entere.

## Rendimiento

Medido sobre producción, móvil con red 4G simulada, **mediana de tres corridas** — una sola corrida
de Lighthouse varía lo suficiente como para declarar cumplido un umbral que no se cumple:

| | Al empezar | Hoy | Presupuesto |
|---|---|---|---|
| Rendimiento móvil | 77 | **97** | — |
| Accesibilidad | 96 | **100** | — |
| LCP | 3,1 s | **2,31 s** | ≤ 2,5 s |
| CLS | 0,05 | **0** | ≤ 0,1 |
| HTML de la portada | 233 KB | **138 KB** | — |

Escritorio: 100. Buenas prácticas y SEO: 100.

Tres cambios lo explican, y ninguno tocó el diseño: los logotipos dejaron de viajar duplicados, las
traducciones dejaron de mandarse enteras a cada página, y la animación de aparición dejó de volverse
casi invisible.

**Solo llegan al navegador los textos que necesita.** `NextIntlClientProvider` serializa por defecto
el diccionario completo en cada página; ahora viajan cuatro espacios de nombres, uno por cada
componente de cliente, declarados en [`i18n/client-messages.ts`](i18n/client-messages.ts). Agregar un
componente de cliente que traduzca algo fuera de esa lista rompe `useTranslations` en producción, así
que [`tests/unit/mensajes-cliente.test.ts`](tests/unit/mensajes-cliente.test.ts) lee los
`useTranslations` reales de cada archivo con `'use client'` y falla nombrando el culpable.

**La aparición al desplazar solo mueve, no desvanece.** Animar la opacidad desde `0.01` hacía que las
auditorías midieran el contraste mientras el elemento era casi transparente y reportaran 1,01:1 sobre
textos cuyo contraste real es 7,82:1 y 10,48:1. El puntaje era lo de menos: cualquiera que auditara
el sitio leía «fallos de contraste» y sacaba la conclusión equivocada.

El único umbral de la constitución que no se cumple es el JavaScript inicial, y **se enmendó en la
versión 1.1.0 en vez de ignorarlo**: los 120 KB originales se escribieron antes de elegir la
tecnología y no son alcanzables con Next App Router. La vista de impresión del currículum —una página
casi sin nada interactivo— envía 172 KB y la portada completa 173: un kilobyte de diferencia entre la
página más rica y la más pobre, que es la medición que demuestra que el peso no es del código propio.
La regla ahora acota lo que sí se controla: que el código propio no agregue más de 15 KB sobre el
piso del marco de trabajo.

## Verificación

Los escenarios de validación están en
[`specs/001-nidra-public-site/quickstart.md`](specs/001-nidra-public-site/quickstart.md).

Las 116 pruebas unitarias no comprueban solo que el código funcione: varias existen porque algo se
rompió una vez y no queremos que vuelva. Un cambio que reintroduzca `script-src` sin resolver los
nonces, que devuelva la afirmación absoluta sobre la base de datos, que deje el currículum sin
regenerar o que anime la opacidad de la aparición **falla nombrando qué hacer**.

Para capturas en varios anchos:

```bash
BASE_URL=http://localhost:3210 node scripts/shots.mjs
```
