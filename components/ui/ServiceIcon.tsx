/**
 * Iconos de los seis servicios.
 *
 * Trazo de 1.5px sobre una retícula de 24, sin relleno: el mismo lenguaje
 * para los seis, de modo que la grilla se lea como un sistema y no como una
 * colección de dibujos sueltos.
 *
 * Van en línea y no como fuente de iconos ni paquete: seis formas no
 * justifican una dependencia, y así heredan `currentColor` del chip que las
 * contiene.
 *
 * Cada icono dice algo del servicio —el embudo mide, la lupa busca, el nodo
 * conecta— en lugar de ser una decoración intercambiable.
 */
const PATHS: Record<string, React.ReactNode> = {
  // Diagnóstico: un embudo que ordena por prioridad.
  'ai-roadmap': (
    <>
      <path d="M3 4h18l-7 8v7l-4 2v-9L3 4Z" />
    </>
  ),
  // Asistentes: burbuja de conversación anclada a un documento.
  'conversational-assistants': (
    <>
      <path d="M4 5h9a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8l-4 3V5Z" />
      <path d="M18 9h2v11l-3-2h-5" />
    </>
  ),
  // Automatización: nodos conectados que corren solos.
  'workflow-automation': (
    <>
      <circle cx="5" cy="6" r="2.2" />
      <circle cx="19" cy="6" r="2.2" />
      <circle cx="12" cy="18" r="2.2" />
      <path d="M7 7.5 10.5 16M16.8 7.6 13.4 16M7.2 6h9.6" />
    </>
  ),
  // Buscador: lupa sobre capas de documentos.
  'internal-knowledge-base': (
    <>
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="m15 15 5 5" />
      <path d="M8 9h5M8 12h3" />
    </>
  ),
  // Producto a medida: bloques que se ensamblan.
  'custom-ai-product': (
    <>
      <path d="M12 2.5 21 7v10l-9 4.5L3 17V7l9-4.5Z" />
      <path d="M12 12 3 7M12 12l9-5M12 12v9.5" />
    </>
  ),
  // Evaluación y seguridad: escudo con una marca de verificación.
  'ai-evaluation-security': (
    <>
      <path d="M12 2.5 20 6v6c0 5-3.5 8.2-8 9.5-4.5-1.3-8-4.5-8-9.5V6l8-3.5Z" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
}

export function ServiceIcon({ id, className = '' }: { id: string; className?: string }) {
  const paths = PATHS[id]
  if (!paths) return null

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-5 w-5 ${className}`}
    >
      {paths}
    </svg>
  )
}
