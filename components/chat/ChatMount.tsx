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
 */
export function ChatMount() {
  if (!publicEnv.CHAT_EMBED_URL) {
    return null
  }

  return (
    <>
      <div
        id="nidra-chat-root"
        aria-live="polite"
        className="pointer-events-none fixed bottom-5 right-5 z-[9000] h-16 w-16"
      />
      <script src={publicEnv.CHAT_EMBED_URL} defer data-nidra-chat />
    </>
  )
}
