import { Link } from '@/i18n/navigation'
import { CAJA_LOGO, IDRA, N } from '@/lib/brand/paths'

/**
 * La marca de Nidra.
 *
 * La n es el sol naciente y de su pie nace el horizonte, que corre hacia la
 * derecha mientras «idra» se apoya encima. Una banda horizontal atraviesa el
 * logotipo entero —la letra, la barra y la palabra— a una misma altura: no es
 * una ranura en una letra, es un plano que cruza todo.
 *
 * ── EL SISTEMA ────────────────────────────────────────────────────────────
 *   public/brand/nidra-logo-glow.svg    premium, con degradado y halo
 *   public/brand/nidra-logo.svg         plano, sobre fondo oscuro
 *   public/brand/nidra-logo-light.svg   membrete, factura, impresión
 *   public/brand/nidra-logo-mono.svg    sello, bordado, una tinta
 *   public/brand/nidra-symbol*.svg      la n sola, SIN el horizonte
 *   public/brand/redes/                 perfil y portada, en SVG y en PNG
 *   app/icon.svg                        la n sola: pestaña del navegador
 *
 * Todo eso lo genera `scripts/build-brand.mjs` desde `lib/brand/paths.ts`.
 * Este componente lee los mismos trazados: no hay una copia acá.
 *
 * ── POR QUÉ VA EN LÍNEA Y NO COMO <img> ───────────────────────────────────
 * Son dos trazados y pesan menos que la petición HTTP que costaría traerlos.
 * Y al estar en línea el degradado puede venir de `BrandDefs`, que se declara
 * una sola vez por documento en vez de una por cada instancia del logotipo.
 */

/**
 * @param href Dirección absoluta a la que llevar, para cuando la marca se
 *   muestra en un host distinto del sitio comercial. En el subdominio del
 *   perfil, un enlace interno a `/` no sale del subdominio: el proxy lo
 *   devuelve al currículum y el clic no parece hacer nada. Sin este parámetro
 *   se usa la navegación interna, que es lo correcto dentro del sitio.
 */
export function Wordmark({ className = '', href }: { className?: string; href?: string }) {
  // El alto manda y el ancho sigue: la proporción del logotipo es 3.36:1,
  // así que fijar el alto es lo que mantiene la cabecera estable.
  const logo = (
    <svg
      viewBox={`0 0 ${CAJA_LOGO.ancho} ${CAJA_LOGO.alto}`}
      aria-hidden="true"
      className="h-[26px] w-auto sm:h-[30px]"
      fill="none"
    >
      {/* El halo, difuminado, detrás. A 30 px de alto mide medio píxel: no se
          ve como resplandor, se ve como que el oro tiene cuerpo. En la marca
          grande —presentación, imagen de vista previa— sí se lee. */}
      <path d={N} fill="url(#nidra-oro)" opacity="0.4" filter="url(#nidra-halo)" />
      <path d={N} fill="url(#nidra-oro)" />
      <path d={IDRA} fill="url(#nidra-cal)" />
    </svg>
  )

  const classes = `inline-flex w-fit items-center ${className}`

  if (href) {
    return (
      <a href={href} aria-label="Nidra — inicio" className={classes}>
        {logo}
      </a>
    )
  }

  return (
    <Link href="/" aria-label="Nidra — inicio" className={classes}>
      {logo}
    </Link>
  )
}
