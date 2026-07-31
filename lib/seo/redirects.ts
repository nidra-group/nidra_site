import type { Redirect } from 'next/dist/lib/load-custom-routes'

/**
 * Registro de rutas retiradas o renombradas (FR-056).
 *
 * Toda dirección pública publicada se considera permanente. Retirarla o moverla
 * REQUIERE agregar acá su redirección **en la misma entrega** que hace el
 * cambio, no después.
 *
 * Reglas:
 * - `permanent: true` siempre. Una redirección temporal para una URL retirada
 *   le dice al buscador que vuelva a intentar, y no transfiere autoridad.
 * - El destino MUST existir. Una redirección a una ruta inexistente es peor
 *   que la ausencia de redirección: convierte un 404 honesto en dos saltos.
 * - Sin cadenas: si `/a` va a `/b` y `/b` pasa a `/c`, se actualiza `/a` para
 *   que apunte directo a `/c`.
 *
 * Está vacío a propósito: todavía no se retiró ninguna URL. La infraestructura
 * existe para que la primera vez que haga falta no sea una decisión de diseño
 * tomada con apuro.
 */
export const redirects: Redirect[] = []
