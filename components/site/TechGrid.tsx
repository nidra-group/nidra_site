import { useTranslations } from 'next-intl'

import { TECH_ICONS, TECH_SPRITE } from '@/lib/content/tech-icons'
import type { Technology } from '@/lib/content/schemas'

const ORDEN = ['ai', 'data', 'cloud', 'dev'] as const

/**
 * Grilla de tecnologías con logotipo.
 *
 * ── EL TRATAMIENTO, Y POR QUÉ ─────────────────────────────────────────────
 * Todos los logotipos se pintan en UN SOLO COLOR y se encienden al pasar el
 * cursor. No es sólo estética:
 *
 *   1. Veintiocho logotipos en su color corporativo son veintiocho paletas
 *      peleando entre sí. El monocromo los vuelve un sistema.
 *   2. Un logotipo a color, sobre todo con el fondo blanco de su manual de
 *      marca, se lee como sello de «socio oficial». Nidra no lo es de ninguna
 *      de estas empresas, y el propio esquema de contenido lo impide (FR-028).
 *
 * OpenAI y Amazon Web Services aparecen SIN logotipo, como marca denominativa
 * en texto. Las dos pidieron ser retiradas de Simple Icons: nombrarlas es uso
 * nominativo y es legítimo, dibujar su marca sin licencia no lo es. El
 * componente cae a texto solo cuando falta el trazado, así que el día que se
 * consiga la autorización alcanza con agregar el `icon` en el YAML.
 */
export function TechGrid({ technologies }: { technologies: Technology[] }) {
  const t = useTranslations('home.technologies')

  return (
    <div className="space-y-10">
      {ORDEN.map((categoria) => {
        const items = technologies.filter((tech) => tech.category === categoria)
        if (items.length === 0) return null

        return (
          <div key={categoria}>
            <h3 className="eyebrow eyebrow-muted">{t(`categories.${categoria}`)}</h3>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {items.map((tech) => (
                <li key={tech.name}>
                  <TechChip tech={tech} />
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

/**
 * El logotipo se REFERENCIA, no se dibuja.
 *
 * Los trazados viven en `public/logos/tech.svg` y el navegador los descarga
 * una sola vez para las veintiocho cápsulas. Dibujarlos acá los mandaba dos
 * veces por página —en el HTML y otra vez en la carga de hidratación—, unos
 * 94 KB de los 233 que pesaba la portada.
 *
 * Se comprobó en Chromium, WebKit y Firefox que una lámina externa referenciada
 * con `<use>` dibuja Y hereda `currentColor`, que es de lo que depende el
 * encendido al pasar el cursor. WebKit era el riesgo real —es el motor de todos
 * los iPhone— y pasa.
 */
function TechChip({ tech }: { tech: Technology }) {
  const icono = tech.icon && TECH_ICONS.has(tech.icon) ? tech.icon : undefined

  return (
    <span
      className="group inline-flex items-center gap-2.5 rounded-full border border-line
                 bg-paper/60 px-4 py-2.5 text-small text-ink/80 transition-colors duration-200
                 hover:border-accent/45 hover:text-ink"
    >
      {icono && (
        <svg
          aria-hidden="true"
          // `fill-current` hereda el color del texto: el logotipo se enciende
          // junto con el nombre en vez de ser una pieza aparte.
          className="h-[1.125rem] w-[1.125rem] shrink-0 fill-current text-muted
                     transition-colors duration-200 group-hover:text-accent"
        >
          <use href={`${TECH_SPRITE}#${icono}`} />
        </svg>
      )}
      {tech.name}
    </span>
  )
}
