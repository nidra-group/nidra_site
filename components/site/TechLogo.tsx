import { TECH_ICONS, TECH_SPRITE } from '@/lib/content/tech-icons'

/**
 * Un logotipo de la lámina compartida, o nada.
 *
 * ── SE REFERENCIA, NO SE DIBUJA ───────────────────────────────────────────
 * Los trazados viven en `public/logos/tech.svg` y el navegador los descarga
 * una sola vez para todo el sitio. Dibujarlos acá los mandaría dos veces por
 * página —en el HTML y otra vez en la carga de hidratación—, que es lo que
 * costaba 94 KB de los 233 que pesaba la portada.
 *
 * Se comprobó en Chromium, WebKit y Firefox que una lámina externa
 * referenciada con `<use>` dibuja Y hereda `currentColor`, de lo que depende
 * el encendido al pasar el cursor. WebKit era el riesgo real —es el motor de
 * todos los iPhone— y pasa.
 *
 * ── DEVUELVE `null` CUANDO NO HAY TRAZADO, Y ESO ES LO NORMAL ─────────────
 * En la portada la ausencia es la excepción: OpenAI y AWS pidieron ser
 * retiradas de Simple Icons. En el catálogo de integraciones es la mayoría,
 * porque casi ninguna plataforma argentina está en el paquete. En los dos
 * casos la marca se nombra en texto, que es uso nominativo y es legítimo;
 * dibujarla sin licencia no lo sería.
 *
 * Todos se pintan en UN SOLO COLOR, nunca en el corporativo. Además de
 * resolver la «sopa de logos», el monocromo evita la lectura de «socio
 * oficial» que produce un logotipo a color, que es justo la relación que
 * Nidra no tiene con ninguna de estas empresas (FR-028).
 */
export function TechLogo({ icon, className }: { icon?: string; className: string }) {
  if (!icon || !TECH_ICONS.has(icon)) return null

  return (
    <svg aria-hidden="true" className={className}>
      <use href={`${TECH_SPRITE}#${icon}`} />
    </svg>
  )
}
