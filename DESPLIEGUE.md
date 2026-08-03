# Despliegue en Vercel

Guía para poner `nidra.cloud` en línea, escrita **después** de hacerlo. Cada
tropiezo que aparece acá nos frenó de verdad, y está anotado con el síntoma
exacto para que se reconozca sin tener que diagnosticarlo de nuevo.

Está ordenada por dependencias: cada paso necesita el anterior.

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

## 1 · La rama principal

Vercel publica en producción **lo que esté en la rama principal del
repositorio**. Antes de conectar nada, asegurate de que el trabajo esté en
`main`.

Si conectás Vercel primero, el primer despliegue construye lo que haya en
`main` —posiblemente nada— y vas a ver un sitio roto sin saber si la culpa es
de la configuración o del contenido.

---

## 2 · Crear el proyecto

En Vercel: **Add New → Project → Import Git Repository** y elegí
`nidra-group/nidra_site`.

Todos los campos van en su valor por defecto:

| Campo | Valor |
|---|---|
| Application Preset | `Next.js` |
| Root Directory | `./` |
| Build Command | por defecto |
| Output Directory | por defecto |
| Install Command | por defecto |

**No actives ningún `Override`.**

> **Si el botón Deploy no se habilita** y no dice por qué, revisá en este
> orden: una fila de variable de entorno a medio llenar —clave sin valor, o
> una fila vacía al final—; un `Override` encendido con el campo en blanco; el
> nombre del proyecto con mayúsculas o guiones bajos; y que haya un equipo
> elegido arriba.

Los PDF del currículum **no** se generan en el despliegue. Se generan en tu
máquina y viajan versionados — ver el paso 8.

---

## 3 · Variables de entorno

En **Settings → Environment Variables**.

### Para el primer despliegue

| Variable | Valor | Entornos |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://nidra.cloud` | los tres |
| `FORM_SECRET` | `openssl rand -hex 32` | solo Production |

```bash
openssl rand -hex 32
```

**Generá el secreto vos.** Un valor que pasa por una conversación queda
escrito en algún historial.

Sin `FORM_SECRET` **el build falla**, y es deliberado: es preferible no poder
desplegar a publicar un sitio que parece sano y pierde el 100% de las
consultas en silencio. Por eso se valida al cargar el módulo y no al
renderizar el formulario — ver [`lib/env.ts`](lib/env.ts).

**Usá un valor distinto en Preview.** Si compartís el secreto, un token
emitido en una rama de prueba sirve contra el sitio real.

`NEXT_PUBLIC_SITE_URL` tiene `https://nidra.cloud` como valor por defecto, así
que su ausencia no rompe el build. Cargala igual: dejar un valor crítico
colgando de un respaldo silencioso es cómo se rompen las cosas más tarde.

### Después, a medida que existan

| Variable | Si falta |
|---|---|
| `RESEND_API_KEY` | El formulario avisa que el canal no está disponible y ofrece tu correo directo |
| `CONTACT_INBOX` | Igual que arriba |
| `NEXT_PUBLIC_PROFILE_URL` | La canónica del currículum y el JSON-LD apuntan al sitio, no al subdominio |
| `NEXT_PUBLIC_BOOKING_URL` | La reserva de reuniones **no se ofrece en ninguna parte** |
| `NEXT_PUBLIC_CHAT_EMBED_URL` | El asistente conversacional no se monta |

Ninguna tiene valor por defecto, y eso es una decisión: un destino plausible
pero inexistente publica un 404 en silencio, que es peor que no tener el
enlace.

**Las variables se aplican al construir, no al servir.** Cargar una y esperar
no hace nada: hay que volver a desplegar. Si el despliegue anterior corrió sin
ellas, usá **Redeploy** y **desmarcá `Use existing Build Cache`**.

---

## 4 · Dominio y DNS

En **Settings → Domains del proyecto** —no en el de la cuenta, que es otro
lugar y solo registra que el dominio es tuyo— agregá:

```
nidra.cloud
www.nidra.cloud
jmujica.nidra.cloud
```

Cada uno muestra **View DNS configuration** con los valores exactos que
espera. Usá esos, no los de ninguna guía: cambian según la cuenta.

Hoy los tres son un `CNAME` al mismo destino, con el proxy **deshabilitado**.

### Si el DNS está en Cloudflare

Tres cosas que nos costaron una hora entre las dos:

**La nube tiene que estar en gris (`DNS only`), no naranja.** Con el proxy
activo, Vercel no puede emitir el certificado y el sitio responde **526**, que
es un error de Cloudflare que no explica nada. Cloudflare además te va a
mostrar un aviso recomendando activar el proxy: ignoralo. Vercel ya da red de
distribución global y certificado automático.

**Un registro `CAA` restringido bloquea el certificado en silencio.** Si hay
un `CAA` que solo autoriza a una autoridad —por ejemplo `0 issue "pki.goog"`—,
Let's Encrypt no puede emitir y Vercel nunca termina de validar. No da error:
simplemente no funciona nunca. Borralo, o agregá `letsencrypt.org`.

**El registro raíz es un `CNAME`, no un `A`.** Si intentás pegar el destino de
Vercel en un registro `A`, Cloudflare responde *«Enter a valid IPv4 address»*.
Cambiá el tipo del registro.

### Cuál dominio es el principal

Al agregar `www`, **Vercel lo toma como principal** y redirige `nidra.cloud`
hacia él. Eso contradice todo lo demás: el sitemap, la imagen para redes y
`NEXT_PUBLIC_SITE_URL` declaran `nidra.cloud`, así que las direcciones
canónicas quedan apuntando a una dirección que rebota.

Invertilo en **Settings → Domains**: `nidra.cloud` sin redirección, y
`www.nidra.cloud` con **Redirect to** `nidra.cloud`.

Comprobalo:

```bash
curl -sI https://nidra.cloud/es     | head -1   # 200
curl -sI https://www.nidra.cloud/es | head -1   # 308
```

### Una advertencia sobre HSTS

El sitio envía `Strict-Transport-Security` con `includeSubDomains` y
`preload`. Eso obliga a HTTPS en `nidra.cloud` **y en todo subdominio**,
durante un año.

Es la cabecera más difícil de revertir de todas: los navegadores recuerdan la
instrucción aunque dejes de enviarla. Si algún día necesitás un subdominio sin
certificado, no va a ser accesible. Está en
[`lib/seo/headers.ts`](lib/seo/headers.ts) si querés sacar `includeSubDomains`
antes del primer despliegue.

### El subdominio del perfil

`jmujica.nidra.cloud` no necesita configuración adicional en el código.
[`proxy.ts`](proxy.ts) lo reconoce y sirve el currículum en la raíz del
idioma, sin exponer `/cv`.

Después de cargar `NEXT_PUBLIC_PROFILE_URL`, volvé a desplegar: la canónica y
los enlaces al perfil pasan a apuntar al subdominio.

---

## 5 · El correo, que no es un solo servicio

Recibir y enviar son dos problemas distintos y los resuelven dos servicios
distintos. Este es el armado actual, y es gratuito:

| | |
|---|---|
| **Recibir** | Cloudflare Email Routing reenvía a un Gmail |
| **Enviar** | Resend, por API para el formulario y por SMTP para tus respuestas |

> **Zoho no sirve para esto en su plan gratuito.** No incluye IMAP, POP ni
> SMTP: solo su propia webmail y su aplicación. Eso descarta conectar Gmail,
> Apple Mail o cualquier otro cliente. Lo comprobamos después de configurar el
> DNS entero.

### 5.1 · Recibir

En Cloudflare, `nidra.cloud` → **Email → Email Routing**.

1. Agregá tu Gmail como **dirección de destino** y confirmá el enlace que
   llega.
2. **Onboard domain** (en interfaces más viejas, *Get started*).
3. Creá una regla por dirección: `jmujica@nidra.cloud` y
   `consultas@nidra.cloud`, ambas a tu Gmail.
4. Dejá el **Catch-all en `Drop`**. Un catch-all reenvía todo lo que llegue a
   cualquier dirección del dominio, y los spammers barren dominios con
   diccionarios. Ese chorro de basura reenviada además le enseña a Gmail que
   tu dominio manda spam.
5. Activá el DNS. Cloudflare escribe sus propios MX.

> **Si el botón de activar no hace nada**, es porque ya hay registros MX de
> otro proveedor ocupando el nombre. Borralos a mano primero. Falla sin
> mensaje.

### 5.2 · Enviar desde el sitio

En Resend:

1. **Domains → Add Domain** → `nidra.cloud`.
2. Cargá los registros que te dé, en **DNS only**.
3. Esperá a que diga verificado.
4. **API Keys → Create**, permiso de solo envío.

En Vercel, agregá `RESEND_API_KEY` y `CONTACT_INBOX`, y redesplegá.

**Sobre el SPF.** Resend suele pedir un TXT sobre un subdominio propio
(`send.nidra.cloud`). Ese es un registro **aparte**: no toca el de la raíz.
Pero si alguna vez te pide un `v=spf1` sobre `nidra.cloud`, **editá el que ya
existe** en vez de crear otro — dos registros SPF en el mismo nombre invalidan
los dos.

> Revisá qué dice hoy tu SPF de la raíz. Un `v=spf1 -all` declara que *ningún*
> servidor está autorizado a enviar como `nidra.cloud`, lo que hace fallar tu
> propio correo sin que te enteres, porque uno no ve sus mensajes rebotar del
> otro lado.

### 5.3 · Responder desde tu Gmail con la dirección del dominio

Gmail no hereda el remitente por reenviar: hay que darle de alta la identidad.

1. En Resend, creá una **segunda** clave de API. No reutilices la de Vercel:
   si tenés que revocar una, no querés que se te caiga el formulario por
   arreglar el correo.
2. Gmail → **Settings → Accounts and Import → Send mail as → Add another
   email address** → `jmujica@nidra.cloud`.
3. Servidor SMTP:

   | Campo | Valor |
   |---|---|
   | SMTP Server | `smtp.resend.com` |
   | Port | `465` |
   | Username | `resend` (literal, no tu correo) |
   | Password | la clave nueva, empieza con `re_` |
   | Conexión | SSL |

4. El código de verificación llega a `jmujica@nidra.cloud` y lo reenvía
   Cloudflare a tu propio Gmail.
5. Marcala como **default**, o Gmail va a seguir usando tu dirección personal.

### 5.4 · Comprobar que DMARC te deja pasar

Que salga con tu dominio no garantiza que llegue. Mandate un correo y en
Gmail web abrilo → **Mostrar original**. Tienen que decir `PASS` las tres, y
el DKIM tiene que firmar con **`nidra.cloud`**, no con el subdominio de envío:

```
dkim=pass   header.i=@nidra.cloud
spf=pass
dmarc=pass  header.from=nidra.cloud
```

Si el DKIM firmara con `send.nidra.cloud`, no alinea, y con `p=reject` tus
correos no van a spam: **rebotan**.

Desde el teléfono no existe *Mostrar original*; usá
[mail-tester.com](https://www.mail-tester.com) y mandá un mensaje trivial, que
queda en un servidor ajeno.

---

## 6 · La reunión de 30 minutos

1. En Cal.com, conectá tu Google Calendar.
2. Creá un evento de 30 minutos.
3. Copiá el enlace público a `NEXT_PUBLIC_BOOKING_URL`.
4. Volvé a desplegar.

Recién ahí aparecen los botones de agendar: en el héroe, en el cierre de la
portada y en contacto. Hasta entonces el sitio ofrece solo el formulario, que
es correcto — un botón que lleva a un 404 es peor que no tenerlo.

---

## 7 · Verificación

```bash
# Toda dirección del sitemap responde 200, sin rebotes intermedios
curl -s https://nidra.cloud/sitemap.xml | grep -oE '<loc>[^<]*' | sed 's/<loc>//' \
  | while read u; do printf "%-42s %s\n" "$u" "$(curl -s -o /dev/null -w '%{http_code}' "$u")"; done

# Las siete cabeceras de seguridad
curl -sI https://nidra.cloud/es | grep -iE \
  "strict-transport|x-content-type|referrer-policy|content-security|x-frame|permissions|cross-origin"

# El subdominio sirve el perfil en la raíz, y limpia toda forma con /cv
curl -s  https://jmujica.nidra.cloud/es | grep -o "<title>[^<]*"
curl -sI https://jmujica.nidra.cloud/es/cv | head -1        # 308

# Los dos PDF del currículum se sirven, con el nombre que dicta la versión
V=$(curl -s https://nidra.cloud/downloads/version.json)
D=$(echo "$V" | grep -o '"date": *"[^"]*' | cut -d'"' -f4)
H=$(echo "$V" | grep -o '"hash": *"[^"]*' | cut -d'"' -f4)
for L in ES EN; do
  curl -s -o /dev/null -w "$L %{http_code} %{content_type}\n" \
    "https://nidra.cloud/downloads/Juan_Mujica_CV_${L}_${D}_${H}.pdf"
done
```

Y a mano, en el navegador:

- Enviá una consulta de prueba desde `/es/contacto`. Confirmá que llega, que
  **el asunto nombra el servicio** y no su identificador, y que al responder
  el destinatario es quien consultó.
- Cambiá de idioma en cualquier página: tiene que quedarse en la misma página.
- Desde la portada, «ver el perfil completo» tiene que abrir el subdominio.
- Desde el subdominio, «volver al sitio» tiene que salir del subdominio.
- Descargá los dos PDF del currículum.

---

## 8 · El currículum se genera acá, no en el servidor

```bash
pnpm generate:cv
```

Congela la versión que sale del historial de git, construye y después imprime
los dos PDF. Los tres archivos —los dos documentos y `version.json`— se
commitean junto al cambio del perfil.

**Por qué no corre en el despliegue:** `pnpm install` no descarga el navegador
que Playwright necesita, y el historial de git tampoco viaja al servidor. Se
intentó, y el build moría antes de publicar.

Si editás `content/cv/profile.yaml` y te olvidás de regenerar,
[`tests/unit/cv-version.test.ts`](tests/unit/cv-version.test.ts) falla en tu
máquina con el comando exacto en el mensaje.

---

## Después de publicar

**Rendimiento.** Corré PageSpeed Insights sobre `https://nidra.cloud/es`. La
constitución del proyecto fija un presupuesto: LCP ≤ 2,5 s, CLS ≤ 0,1,
INP ≤ 200 ms. Si algo no da, es un problema a resolver, no un número
orientativo.

**Región de las funciones.** Vercel sirve las páginas estáticas desde su red
global, y hoy casi todo el sitio es estático. Solo `/contacto` y el envío del
formulario corren en una función, que por defecto vive en Estados Unidos. Para
visitantes argentinos, moverla a São Paulo (`gru1`) recorta unos 80 ms.

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

**Lo que sí va a hacer falta** el día que se monte el asistente conversacional:
revisar la política de privacidad, que hoy dice que el sitio no guarda las
consultas en ninguna base de datos, y la política de contenido, que supone que
no hay código de terceros. Está detallado en
[`docs/brief-chatbot.md`](docs/brief-chatbot.md).

---

## El respaldo

El sitio no tiene base de datos. **El repositorio es el respaldo completo**:
contenido, currículum, textos y configuración son archivos versionados.

Lo único que no está en git son las variables de entorno y las dos claves de
Resend. Guardalas en tu gestor de contraseñas, no en un archivo suelto — y no
las mandes por correo ni por chat, ni siquiera a vos mismo.
