# Nidra — sitio público

Sitio institucional bilingüe (es/en) de Nidra, agencia de desarrollo de software con IA para PyMEs,
más el espacio profesional del fundador con descarga de currículum.

Construido con desarrollo guiado por especificación: la fuente de verdad de qué hace el sitio y por
qué está en [`specs/001-nidra-public-site/`](specs/001-nidra-public-site/), y las reglas que ningún
cambio puede romper, en [`.specify/memory/constitution.md`](.specify/memory/constitution.md).

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
pnpm dev          # desarrollo (puerto 3210)
pnpm build        # build + genera los PDF del currículum
pnpm test         # pruebas unitarias
pnpm test:e2e     # formulario en un navegador real, con y sin JavaScript
pnpm typecheck    # tipos
pnpm lint         # eslint
pnpm generate:cv  # regenera solo los PDF del currículum
```

El puerto 3210 no es el de Next por defecto: el 3000 está reservado para otra aplicación en la
máquina de desarrollo. Está fijado en `package.json`, en
[`playwright.config.ts`](playwright.config.ts) y en `.claude/launch.json`.

## Cambiar la paleta de colores

Todos los colores del sitio salen de **un solo bloque** al comienzo de
[`app/globals.css`](app/globals.css). Cambiar la identidad visual completa es cambiar esos nueve
valores; ningún otro archivo define un color.

La paleta actual es «madrugada»: Nidra es *sueño* en sánscrito, y el sitio lo usa — fondo de niebla
fría, tinta verde-noche, y `--brand-glow`, la luz menta que solo aparece en las secciones nocturnas
(la tarjeta del turno noche del héroe, el cierre y el pie). Esas secciones se marcan con
`data-night`, que invierte los tokens localmente: los componentes de adentro se adaptan solos.

El bloque documenta los contrastes mínimos que cada valor debe cumplir para no romper la
accesibilidad. Respetarlos no es opcional:
[`tests/unit/palette.test.ts`](tests/unit/palette.test.ts) los verifica leyendo el CSS real — una
paleta que los incumpla **rompe el build**.

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

## El logotipo

La empresa todavía no tiene logo. La marca se compone tipográficamente en
[`components/site/Wordmark.tsx`](components/site/Wordmark.tsx), que documenta exactamente qué
reemplazar cuando exista, y cómo, sin alterar el diseño de la cabecera.

Los logotipos de integraciones **no** se usan: las plataformas se listan como texto. Evita la sopa de
logos, evita problemas de licencia de marca y, sobre todo, evita insinuar una relación comercial que
no existe. Si en el futuro se quieren logos, `public/logos/` está preparado.

## El currículum

`content/cv/profile.yaml` es la fuente única. De ahí derivan la página web, la vista de impresión y
los PDF en ambos idiomas. No hay copias que sincronizar.

Los PDF se generan **imprimiendo la propia vista web** con Playwright, así que hay una sola
maquetación: si la vista de impresión se ve bien, el PDF es correcto por definición.

La versión no se declara a mano: sale del hash y la fecha del último commit que tocó el YAML. El
historial de git **es** el versionado del currículum.

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

## Verificación

Los escenarios de validación están en
[`specs/001-nidra-public-site/quickstart.md`](specs/001-nidra-public-site/quickstart.md).

Para capturas en varios anchos:

```bash
BASE_URL=http://localhost:3210 node scripts/shots.mjs
```
