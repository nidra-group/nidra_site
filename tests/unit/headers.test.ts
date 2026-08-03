import { describe, expect, it } from 'vitest'

/**
 * La política de contenido se arma a partir del entorno, así que hay que
 * importarla DESPUÉS de fijar las variables. `vi.resetModules` obliga a que
 * cada caso vuelva a evaluar el módulo.
 */
async function csp(embedUrl?: string): Promise<string> {
  const { resetModules } = await import('vitest').then((m) => ({ resetModules: m.vi.resetModules }))
  resetModules()

  if (embedUrl === undefined) delete process.env.NEXT_PUBLIC_CHAT_EMBED_URL
  else process.env.NEXT_PUBLIC_CHAT_EMBED_URL = embedUrl

  const { securityHeaders } = await import('@/lib/seo/headers')
  return securityHeaders.find((h) => h.key === 'Content-Security-Policy')!.value
}

describe('política de contenido', () => {
  it('sin asistente configurado, no permite ningún marco ni salida de red', async () => {
    const p = await csp(undefined)

    expect(p).toContain("frame-ancestors 'none'")
    expect(p).toContain("frame-src 'none'")
    expect(p).toContain("connect-src 'self'")
  })

  it('con asistente, autoriza SU ORIGEN y no la URL completa del script', async () => {
    const p = await csp('https://chat.nidra.cloud/v2/embed.js')

    expect(p).toContain('frame-src https://chat.nidra.cloud')
    expect(p).toContain("connect-src 'self' https://chat.nidra.cloud")
    // La ruta no va en una CSP: autorizar `/v2/embed.js` no significa nada y
    // rompería en cuanto el widget cambie de ruta.
    expect(p).not.toContain('embed.js')
  })

  it('una URL inválida no rompe el build', async () => {
    // `lib/env.ts` ya la valida y falla nombrando la variable. Acá el objetivo
    // es que la cabecera se genere igual en vez de tirar abajo `next build`
    // con un error de URL sin contexto.
    await expect(csp('esto-no-es-una-url')).resolves.toContain("frame-ancestors 'none'")
  })

  it('protege el formulario de consultas', async () => {
    const p = await csp(undefined)

    // Sin estas dos, un script inyectado puede cambiar a dónde se envía el
    // formulario, o hacia dónde apuntan todos los enlaces relativos, sin que
    // el visitante vea nada raro.
    expect(p).toContain("form-action 'self'")
    expect(p).toContain("base-uri 'none'")
  })

  it('sigue sin declarar script-src, que es una decisión documentada', async () => {
    const p = await csp('https://chat.nidra.cloud/embed.js')

    // Si alguien la agrega sin resolver los nonces, Next deja de hidratar y el
    // sitio se rompe entero. La decisión y su motivo están en lib/seo/headers.ts.
    expect(
      p.includes('script-src'),
      'Se agregó script-src. Next inyecta scripts en línea para hidratar:\n' +
        'sin un nonce por respuesta esto rompe el sitio, y el nonce obliga a\n' +
        'renderizar cada página en cada visita. Ver lib/seo/headers.ts.',
    ).toBe(false)
  })
})

describe('el resto de las cabeceras', () => {
  it('siguen estando las siete', async () => {
    const { securityHeaders } = await import('@/lib/seo/headers')
    const claves = securityHeaders.map((h) => h.key)

    for (const esperada of [
      'Strict-Transport-Security',
      'X-Content-Type-Options',
      'Referrer-Policy',
      'Content-Security-Policy',
      'X-Frame-Options',
      'Permissions-Policy',
      'Cross-Origin-Opener-Policy',
    ]) {
      expect(claves, `Falta la cabecera ${esperada}`).toContain(esperada)
    }
  })
})
