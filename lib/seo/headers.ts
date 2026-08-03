/**
 * Origen del asistente conversacional, si está configurado.
 *
 * Se extrae del propio `NEXT_PUBLIC_CHAT_EMBED_URL` en vez de escribirse a
 * mano en una segunda variable: dos fuentes para el mismo dato se desincronizan
 * el día que el widget cambia de host, y el síntoma sería un widget que carga
 * pero no puede hablar con su servidor.
 *
 * Se lee `process.env` directamente y no `lib/env.ts` porque esto corre dentro
 * de `next.config.ts`, antes de que exista el entorno de la aplicación.
 */
function chatOrigin(): string | null {
  const url = process.env.NEXT_PUBLIC_CHAT_EMBED_URL
  if (!url) return null

  try {
    return new URL(url).origin
  } catch {
    // Una URL inválida no debe romper el build acá: `lib/env.ts` ya la valida
    // y falla con un mensaje que nombra la variable.
    return null
  }
}

/**
 * Política de contenido.
 *
 * ── LO QUE FALTA, Y POR QUÉ ───────────────────────────────────────────────
 * No hay `script-src`, y es una decisión, no un olvido.
 *
 * Next.js inyecta scripts en línea con los datos de hidratación. Permitirlos
 * sin abrir la puerta a cualquier script exige un `nonce` distinto por
 * respuesta, y un nonce obliga a renderizar cada página en el servidor en cada
 * visita. Eso rompe el renderizado estático que exige el principio II de la
 * constitución y cambiaría el presupuesto de rendimiento del sitio entero.
 *
 * El asistente conversacional no cambia esa cuenta tanto como parecía cuando
 * se escribió esta nota: lo construye y lo opera el mismo equipo, sobre un
 * host propio. No es código de un tercero desconocido. Lo que sí cambia es que
 * ahora hay un segundo despliegue que puede comprometerse por separado, y de
 * ahí las directivas de abajo.
 *
 * ── LO QUE SÍ SE APLICA ───────────────────────────────────────────────────
 * Ninguna de estas necesita nonces, y todas acotan el daño de un widget
 * comprometido:
 *
 *   frame-ancestors  nadie puede meter el sitio en un marco (secuestro de clics)
 *   frame-src        solo el widget puede abrir marcos; sin widget, ninguno
 *   connect-src      a dónde puede hablar la página: a sí misma y al widget
 *   form-action      un formulario solo puede enviarse a este mismo sitio
 *   base-uri         nadie puede reescribir la base de las URLs relativas
 *
 * `form-action` y `base-uri` son las dos que protegen el formulario de
 * consultas: sin ellas, un script inyectado puede cambiar a dónde se envía o
 * hacia dónde apuntan todos los enlaces relativos, y el visitante no ve nada
 * raro.
 */
function contentSecurityPolicy(): string {
  const widget = chatOrigin()

  return [
    "frame-ancestors 'none'",
    `frame-src ${widget ?? "'none'"}`,
    `connect-src 'self'${widget ? ` ${widget}` : ''}`,
    "form-action 'self'",
    "base-uri 'none'",
  ].join('; ')
}

/**
 * Cabeceras de seguridad del sitio.
 *
 * Están ordenadas por lo que realmente protegen, no por completitud. Todas se
 * aplican a cada respuesta desde `next.config.ts`.
 */
export const securityHeaders = [
  {
    /**
     * Obliga a HTTPS durante un año, incluidos los subdominios. `preload`
     * pide la inclusión en la lista que traen los navegadores de fábrica.
     *
     * CUIDADO: esto alcanza a TODO subdominio de nidra.cloud. Si algún día
     * hace falta un subdominio sin certificado, deja de ser accesible. Es la
     * cabecera más difícil de revertir de la lista, porque los navegadores
     * recuerdan la instrucción aunque se deje de enviar.
     */
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  {
    /**
     * Impide que el navegador adivine el tipo de un archivo. Sin esto, un
     * archivo subido como texto puede terminar ejecutándose como script.
     */
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    /**
     * Al salir del sitio se envía el dominio, nunca la ruta completa. Que un
     * tercero sepa que la visita vino de nidra.cloud es razonable; que sepa
     * desde qué página exacta, no hace falta.
     */
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    /**
     * Ver `contentSecurityPolicy()` arriba para qué incluye y qué no.
     *
     * `frame-ancestors` es la versión moderna de la defensa contra el secuestro
     * de clics; `X-Frame-Options`, abajo, queda para navegadores viejos que no
     * la entienden.
     */
    key: 'Content-Security-Policy',
    value: contentSecurityPolicy(),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    /**
     * El sitio no usa cámara, micrófono ni ubicación. Declararlo apagado
     * significa que un script inyectado tampoco puede pedirlos.
     */
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    /**
     * Aísla el sitio de otras pestañas del mismo navegador, para que no
     * puedan obtener una referencia a su ventana.
     */
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },
] as const
