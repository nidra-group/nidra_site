import { publicEnv } from '@/lib/env'

/**
 * Punto de montaje del asistente conversacional externo.
 *
 * Contrato completo en specs/001-nidra-public-site/contracts/chatbot-widget.md
 *
 * Tres garantías que este componente debe sostener:
 *
 * 1. Si `NEXT_PUBLIC_CHAT_EMBED_URL` no está definida, no se renderiza nada y
 *    el sitio funciona igual (FR-022). El asistente lo construye otro equipo;
 *    el sitio no espera a que exista.
 * 2. El espacio de 64 × 64 px se reserva por adelantado y el contenedor está en
 *    `position: fixed`, para que el widget no desplace contenido al montarse
 *    (FR-023, SC-007).
 * 3. El script se carga diferido y nunca bloquea el renderizado.
 *
 * Vive en el layout de `(site)`, así que NO aparece en el subdominio del
 * perfil: `jmujica.nidra.cloud` usa el layout de `(profile)`. Eso cumple la
 * cláusula del contrato sin necesidad de comprobar el host.
 */
export function ChatMount({ locale }: { locale: string }) {
  if (!publicEnv.CHAT_EMBED_URL) {
    return null
  }

  return (
    <>
      {/* `data-locale` sale del enrutado, que es la única fuente de verdad del
          idioma: el widget MUST iniciar la conversación en este idioma.

          El contrato también preveía `data-page` y `data-service`. No se
          emiten, y es deliberado: este componente vive en el layout, que no
          sabe qué página está debajo. Emitirlos desde acá exigiría propagarlos
          por cada página y quedarían desincronizados en el primer olvido,
          mientras que el widget puede leer `location.pathname` —las rutas son
          estables y están declaradas en i18n/routing.ts— y obtener lo mismo
          sin que nadie lo mantenga. */}
      <div
        id="nidra-chat-root"
        data-locale={locale}
        aria-live="polite"
        className="pointer-events-none fixed bottom-5 right-5 z-[9000] h-16 w-16"
      />
      <script src={publicEnv.CHAT_EMBED_URL} defer data-nidra-chat />
    </>
  )
}
