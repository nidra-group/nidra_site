/**
 * Cabeceras de seguridad del sitio.
 *
 * Están ordenadas por lo que realmente protegen, no por completitud. Todas se
 * aplican a cada respuesta desde `next.config.ts`.
 *
 * ── SOBRE LA POLÍTICA DE CONTENIDO (CSP) ──────────────────────────────────
 * Falta la directiva `script-src`, y es una decisión, no un olvido.
 *
 * Next.js inyecta scripts en línea con los datos de hidratación. Para
 * permitirlos sin abrir la puerta a cualquier script haría falta un `nonce`
 * distinto por respuesta, y un nonce obliga a renderizar cada página en el
 * servidor en cada visita. Eso rompe el renderizado estático que exige el
 * principio II de la constitución, y cambiaría el presupuesto de rendimiento
 * de todo el sitio por un control cuyo riesgo acá es bajo: no hay contenido
 * de terceros, no hay entrada de usuario que se renderice como HTML, y el
 * único script externo es la medición de Vercel.
 *
 * Lo que sí se aplica es `frame-ancestors`, que no depende de nonces y es la
 * mitad de la CSP que sirve contra el secuestro de clics.
 *
 * Si algún día se monta el asistente conversacional con un script de un
 * tercero, esta decisión hay que revisarla: ahí sí entra código ajeno.
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
     * Nadie puede meter el sitio en un marco. Es la defensa contra el
     * secuestro de clics: un atacante superpone su interfaz sobre la nuestra
     * y el visitante cree que hace clic en una cosa cuando hace clic en otra.
     *
     * `frame-ancestors` es la versión moderna; `X-Frame-Options` queda para
     * navegadores viejos que no la entienden.
     */
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'none'",
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
