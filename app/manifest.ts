import type { MetadataRoute } from 'next'

/**
 * Manifiesto de aplicación web.
 *
 * No convierte el sitio en una aplicación instalable de verdad —no hay
 * trabajador de servicio ni modo sin conexión, y no hace falta: son trece
 * páginas de texto—. Lo que hace es que, cuando alguien agrega el sitio a la
 * pantalla de inicio de su teléfono, el atajo se llame «Nidra» y lleve el
 * símbolo sobre la placa de noche, en vez de llamarse «nidra.cloud» y llevar
 * una captura de la portada.
 *
 * Es también lo que le da a Android el color de la barra de estado al abrir el
 * sitio desde ese atajo.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nidra — Software a medida con IA para PyMEs',
    short_name: 'Nidra',
    description:
      'Sistemas hechos a la medida de tu empresa, sin licencias por persona. ' +
      'Automatizo las tareas que te comen el día y lo que se construye queda tuyo.',
    /**
     * La raíz, sin idioma, y a propósito: redirige al idioma que pide el
     * navegador. Fijar `/es` acá le daría un atajo en español a quien instaló
     * el sitio desde la versión en inglés.
     */
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0a1322',
    theme_color: '#0a1322',
    /**
     * Ningún Android lee un SVG del manifiesto: los dos son PNG, generados por
     * `pnpm build:brand` desde el mismo trazado que el resto de la marca.
     *
     * `maskable` además de `any` porque Android recorta el icono a la forma del
     * sistema —círculo, cuadrado redondeado, gota—. La placa es un fondo
     * completo y la n queda dentro del 80 % central, así que ningún recorte la
     * toca.
     */
    icons: [
      { src: '/brand/nidra-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/brand/nidra-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/brand/nidra-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
