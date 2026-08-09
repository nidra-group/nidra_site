/**
 * El retrato del currículum.
 *
 * Los dos archivos los genera `pnpm build:portrait` desde
 * `content/cv/retrato-original.jpg`. El círculo viene HORNEADO en el PNG —el
 * archivo ya es un círculo, transparente por fuera— y no recortado con CSS: el
 * PDF lo imprime Chromium, y ahí un `border-radius` sobre una imagen depende de
 * cómo se aplaste la capa al rasterizar. Un archivo circular no depende de
 * nada.
 *
 * Por eso también hay dos y no uno: la web es azul casi negro y el PDF es papel
 * blanco. El de web lleva una viñeta que apaga el borde del disco contra el
 * fondo; esa misma viñeta, impresa, es un cerco gris alrededor de la cara. El
 * motivo largo está en el encabezado del script.
 */

const ARCHIVOS = {
  web: '/brand/retrato/juan-mujica-web.png',
  impresion: '/brand/retrato/juan-mujica-impresion.png',
} as const

export function Portrait({
  destino,
  /** El lado del círculo en píxeles CSS. El PNG mide 448, así que siempre se reduce. */
  lado,
  className = '',
}: {
  destino: keyof typeof ARCHIVOS
  lado: number
  className?: string
}) {
  return (
    /* Va `<img>` y no `next/image`: el PNG ya está en su tamaño final y con
       transparencia, así que el optimizador no tiene nada que mejorar, y
       durante la generación del PDF evita una petición más al servidor de
       imágenes en mitad de la impresión.

       `alt` vacío a propósito. El nombre está al lado, en el `<h1>`: con un
       texto alternativo, un lector de pantalla anunciaría «Juan Mujica,
       imagen» y acto seguido «Juan Mujica, encabezado». La foto no agrega
       información que el texto no dé. */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ARCHIVOS[destino]}
      alt=""
      width={lado}
      height={lado}
      className={`shrink-0 rounded-full ${className}`}
      style={{ width: lado, height: lado }}
    />
  )
}
