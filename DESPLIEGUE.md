# Despliegue en Vercel

Guía para poner `nidra.cloud` en línea. Está ordenada por dependencias: cada
paso necesita el anterior.

Todo lo que sigue lo tenés que hacer vos. No creo cuentas ni configuro
secretos: son acciones sobre tu identidad y tu dinero.

---

## Antes de empezar

**Activá la verificación en dos pasos en las cuatro cuentas** que controlan
este sitio: el registrador del dominio, GitHub, Vercel y el correo asociado.

No es una recomendación genérica. Quien entra a cualquiera de esas cuatro
puede apuntar `nidra.cloud` a otro servidor, y desde ahí leer los correos que
te manda el formulario. **El correo es la más importante**: es donde caen los
enlaces de recuperación de todas las demás.

---

## 1 · Conectar el repositorio

En Vercel: **Add New → Project → Import Git Repository** y elegí
`nidra-group/nidra_site`.

No toques la configuración de build. Vercel detecta Next.js y usa `pnpm build`.
Todos los campos van en su valor por defecto: preset `Next.js`, raíz `./`,
salida `.next`, instalación `pnpm install`. No actives ningún **Override**.

Los PDF del currículum **no** se generan acá: se generan en tu máquina con
`pnpm generate:cv` y viajan versionados. El servidor no tiene el navegador que
hace falta para imprimirlos, ni el historial de git del que sale su versión.

**Todavía no despliegues.** Primero cargá las variables del paso 2, o el build
va a fallar — a propósito, ver más abajo.

---

## 2 · Variables de entorno

En **Settings → Environment Variables**. Marcá las tres casillas
(Production, Preview, Development) salvo que se indique otra cosa.

### Obligatorias

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://nidra.cloud` |
| `FORM_SECRET` | Generalo con el comando de abajo |

Sin `FORM_SECRET` **el build falla**, y es deliberado: es preferible no poder
desplegar a publicar un sitio que parece sano y pierde el 100% de las
consultas en silencio. Por eso se valida al cargar el módulo y no al
renderizar el formulario — ver [`lib/env.ts`](lib/env.ts).

`NEXT_PUBLIC_SITE_URL` tiene `https://nidra.cloud` como valor por defecto, así
que su ausencia no rompe nada. Cargala igual: dejar un valor crítico colgando
de un respaldo silencioso es cómo se rompen las cosas más tarde.

```bash
openssl rand -hex 32
```

`FORM_SECRET` firma la marca temporal que distingue a una persona de un bot.
**Usá un valor distinto en Production y en Preview.** Si compartís el secreto,
un token emitido en una rama de prueba sirve contra el sitio real.

### Entrega del formulario

Sin estas el sitio funciona: el formulario avisa que el canal no está
disponible y ofrece tu correo directo.

| Variable | Valor |
|---|---|
| `RESEND_API_KEY` | La clave de Resend, ver paso 4 |
| `CONTACT_INBOX` | `jmujica@nidra.cloud` |

### Opcionales

Ninguna tiene valor por defecto, y eso es una decisión: un destino plausible
pero inexistente publica un 404 en silencio, que es peor que no tener el
enlace.

| Variable | Si falta |
|---|---|
| `NEXT_PUBLIC_BOOKING_URL` | La reserva de reuniones **no se ofrece en ninguna parte** |
| `NEXT_PUBLIC_PROFILE_URL` | Tu perfil se sirve en `/es/cv` dentro del sitio |
| `NEXT_PUBLIC_CHAT_EMBED_URL` | El asistente conversacional no se monta |

---

## 3 · Dominio y subdominio

En **Settings → Domains**, agregá los dos:

```
nidra.cloud
jmujica.nidra.cloud
```

Vercel te da los registros DNS para cargar en tu registrador. Suele ser un
`A` a `76.76.21.21` para el dominio raíz y un `CNAME` a `cname.vercel-dns.com`
para el subdominio — **usá los que muestre tu panel**, no estos: cambian.

El subdominio no necesita configuración adicional en el código.
[`proxy.ts`](proxy.ts) ya lo reconoce y sirve tu perfil sin exponer `/cv` en
la barra de direcciones.

Después de agregar `NEXT_PUBLIC_PROFILE_URL=https://jmujica.nidra.cloud`,
volvé a desplegar: los enlaces internos al perfil pasan a apuntar al
subdominio.

### Una advertencia sobre HSTS

El sitio envía `Strict-Transport-Security` con `includeSubDomains` y
`preload`. Eso obliga a HTTPS en `nidra.cloud` **y en todo subdominio**,
durante un año.

Es la cabecera más difícil de revertir de todas: los navegadores recuerdan la
instrucción aunque dejes de enviarla. Si algún día necesitás un subdominio sin
certificado, no va a ser accesible. Está en
[`lib/seo/headers.ts`](lib/seo/headers.ts) si querés sacar `includeSubDomains`
antes del primer despliegue.

---

## 4 · Correo del formulario

1. Creá una cuenta en Resend.
2. **Domains → Add Domain** → `nidra.cloud`.
3. Cargá los registros DNS que te dé: SPF, DKIM y DMARC.
4. Esperá a que los tres digan verificado. Puede tardar hasta 48 horas, casi
   siempre menos de una.
5. **API Keys → Create** con permiso de solo envío. Copiala a `RESEND_API_KEY`.

**Sin el dominio verificado los correos van a spam o se rechazan.** El sitio
envía desde `consultas@nidra.cloud`; esa casilla no necesita existir como
buzón, pero el dominio sí tiene que estar autenticado.

---

## 5 · La reunión de 30 minutos

1. En Cal.com, conectá tu Google Calendar.
2. Creá un evento de 30 minutos.
3. Copiá el enlace público a `NEXT_PUBLIC_BOOKING_URL`.
4. Volvé a desplegar.

Recién ahí aparecen los botones de agendar: en el héroe, en el cierre de la
portada y en contacto. Hasta entonces el sitio ofrece solo el formulario, que
es correcto — un botón que lleva a un 404 es peor que no tenerlo.

---

## 6 · Verificación después del primer despliegue

```bash
# Las siete cabeceras de seguridad
curl -sI https://nidra.cloud/es | grep -iE \
  "strict-transport|x-content-type|referrer-policy|content-security|x-frame|permissions|cross-origin"

# El subdominio sirve el perfil, no la portada
curl -s https://jmujica.nidra.cloud/es | grep -o "<title>[^<]*"

# Los PDF del currículum se generaron
curl -sI https://nidra.cloud/es/cv | head -1

# El sitemap declara las rutas de los dos idiomas
curl -s https://nidra.cloud/sitemap.xml | grep -c "<url>"
```

Y a mano, en el navegador:

- Enviá una consulta de prueba desde `/es/contacto` y confirmá que llega.
- Cambiá de idioma en cualquier página: tiene que quedarse en la misma página,
  no volver al inicio.
- Descargá los dos PDF del currículum.

---

## Después de publicar

**Rendimiento.** Corré PageSpeed Insights sobre `https://nidra.cloud/es`. La
constitución del proyecto fija un presupuesto: LCP ≤ 2,5 s, CLS ≤ 0,1,
INP ≤ 200 ms. Si algo no da, es un problema a resolver, no un número
orientativo.

**Región de las funciones.** Vercel sirve las páginas estáticas desde su red
global, así que la mayoría del sitio ya sale cerca del visitante. Pero las
rutas dinámicas —`/contacto`, `/cv`— y el envío del formulario corren en una
función, y por defecto esa función vive en Estados Unidos. Para visitantes
argentinos, moverla a São Paulo (`gru1`) recorta unos 80 ms.

**Verificá esto antes de tocarlo:** elegir región es una función de los planes
pagos. En el plan gratuito no se puede, y forzarlo en `vercel.json` puede
hacer fallar el despliegue. Si estás en Pro, se agrega ahí:

```json
{ "regions": ["gru1"] }
```

**Lo que NO hace falta todavía:** monitoreo con alertas, entorno de staging
separado, infraestructura como código, o un CDN aparte. El sitio no tiene base
de datos ni estado: si algo se rompe, revertir es volver al commit anterior en
Vercel, y eso son dos clics.

---

## El respaldo

El sitio no tiene base de datos. **El repositorio es el respaldo completo**:
contenido, currículum, textos y configuración son archivos versionados.

Lo único que no está en git son las variables de entorno. Guardalas en tu
gestor de contraseñas, no en un archivo suelto — y no las mandes por correo ni
por chat, ni siquiera a vos mismo.
