/**
 * Fecha de la última revisión del contenido publicado.
 *
 * El mapa del sitio declaraba `new Date()`, así que cada despliegue le decía a
 * Google que las doce páginas habían cambiado en ese preciso instante, incluso
 * cuando el despliegue solo tocaba una cabecera o una dependencia. Un sitio
 * cuyo `lastmod` siempre dice «recién» deja de ser creíble, y Google entonces
 * lo ignora para todo el dominio: se pierde la señal justo cuando el contenido
 * cambia de verdad.
 *
 * Es una constante a mano, igual que `UPDATED` en
 * `components/site/LegalDocument.tsx`. Una fecha algo vieja pero cierta vale
 * más que una siempre actual y falsa.
 *
 * Actualizala cuando cambie el TEXTO de las páginas, no cuando cambie el
 * código.
 */
export const CONTENT_UPDATED = '2026-08-04'
