/**
 * Qué textos viajan al navegador.
 *
 * `NextIntlClientProvider` serializa por defecto el diccionario COMPLETO en
 * cada página. La portada cargaba con los textos del formulario de contacto,
 * del currículum, de privacidad y de términos, ninguno de los cuales existe
 * ahí: 19 KB donde hacen falta 4, en un sitio cuyo cuello de botella medido es
 * el hilo principal.
 *
 * Acá va uno por cada componente que corre en el navegador, y nada más. El
 * resto del sitio se traduce en el servidor y llega como texto ya resuelto.
 *
 * ── SI AGREGÁS UN COMPONENTE DE CLIENTE ───────────────────────────────────
 * Su espacio de nombres tiene que sumarse a esta lista, o `useTranslations`
 * falla en producción — que es el peor lugar para enterarse, porque en
 * desarrollo se navega justo a la página que sí lo trae.
 *
 * `tests/unit/mensajes-cliente.test.ts` lee los `useTranslations` de cada
 * archivo marcado con 'use client' y falla si alguno pide algo que no está
 * acá. Por eso esta lista vive en su propio módulo y no dentro del envoltorio:
 * importar el envoltorio arrastra las tipografías, que no cargan fuera de
 * Next.
 */
export const ESPACIOS_DE_CLIENTE = ['nav', 'language', 'contact.form', 'services.items'] as const

/** Recorta el diccionario a los espacios declarados, conservando su forma. */
export function podarMensajes(todos: unknown): Record<string, unknown> {
  return ESPACIOS_DE_CLIENTE.reduce<Record<string, unknown>>((podados, ruta) => {
    const partes = ruta.split('.')
    let origen: unknown = todos
    let destino = podados

    for (const [i, parte] of partes.entries()) {
      origen = (origen as Record<string, unknown>)?.[parte]
      if (i === partes.length - 1) destino[parte] = origen
      else destino = (destino[parte] ??= {}) as Record<string, unknown>
    }

    return podados
  }, {})
}
