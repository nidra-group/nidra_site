/**
 * Correo de contacto público, en un solo lugar.
 *
 * Estaba escrito a mano en cuatro componentes, en los dos documentos legales y
 * en el currículum. Cambiarlo exigía acordarse de los siete sitios, y olvidarse
 * de uno publica una dirección que no existe justo donde alguien intenta
 * escribir. `tests/unit/contact.test.ts` falla si alguna de esas copias se
 * desvía de este valor.
 *
 * No es una variable de entorno: es información pública, forma parte del
 * contenido del sitio y debe quedar en el historial de git como cualquier otro
 * texto publicado.
 */
export const CONTACT_EMAIL = 'jmujica@nidra.cloud'

/**
 * Remitente de las consultas del formulario.
 *
 * Es una identidad de envío, no un buzón: Resend solo exige que el dominio esté
 * verificado. Las respuestas van a quien consultó, por `replyTo`.
 */
export const SENDER_EMAIL = 'consultas@nidra.cloud'
