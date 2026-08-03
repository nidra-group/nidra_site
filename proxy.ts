import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { hasLocale } from 'next-intl'

import { routing, locales, defaultLocale } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

/**
 * Hosts que sirven el espacio profesional del fundador.
 *
 * Incluye el host local para que el subdominio se pueda probar en desarrollo
 * sin tocar `/etc/hosts`: los subdominios de `localhost` resuelven solos en los
 * navegadores modernos.
 */
const PROFILE_HOSTS = ['jmujica.nidra.cloud', 'profile.localhost', 'jmujica.localhost']

function isProfileHost(host: string): boolean {
  const hostname = host.split(':')[0]?.toLowerCase() ?? ''
  return PROFILE_HOSTS.includes(hostname)
}

function negotiateLocale(request: NextRequest): string {
  const header = request.headers.get('accept-language') ?? ''
  const preferred = header
    .split(',')
    .map((part) => part.split(';')[0]?.trim().slice(0, 2).toLowerCase())
    .find((code) => code !== undefined && hasLocale(locales, code))

  return preferred ?? defaultLocale
}

export default function middleware(request: NextRequest): NextResponse {
  const host = request.headers.get('host') ?? ''

  // El subdominio del perfil sirve el grupo de rutas `(profile)` sin exponer
  // `/cv` en la barra de direcciones: `jmujica.nidra.cloud/es` muestra el
  // perfil. Se resuelve con reescritura, no con redirección.
  if (isProfileHost(host)) {
    const { pathname } = request.nextUrl
    const segment = pathname.split('/')[1] ?? ''

    if (!hasLocale(locales, segment)) {
      const locale = negotiateLocale(request)
      const target = request.nextUrl.clone()
      target.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
      return NextResponse.redirect(target)
    }

    const rest = pathname.slice(segment.length + 1)

    // En el subdominio, `/cv` no es una dirección: es un detalle de cómo está
    // organizado el código. Toda forma que lo nombre se manda a la dirección
    // limpia.
    //
    // Sin esto, el selector de idioma —que arma sus enlaces desde la ruta ya
    // reescrita— llevaba de `jmujica.nidra.cloud/es` a
    // `jmujica.nidra.cloud/en/cv`, y el `/cv` que el subdominio existe para
    // esconder aparecía en la barra de direcciones al segundo clic.
    //
    // Se resuelve acá y no en el selector a propósito: cualquier enlace de
    // cualquier componente, o alguien que pegue la dirección a mano, termina
    // en la misma forma. Un solo lugar decide cómo se ve una dirección.
    if (rest === '/cv' || rest.startsWith('/cv/')) {
      const target = request.nextUrl.clone()
      target.pathname = `/${segment}${rest.slice('/cv'.length)}`
      return NextResponse.redirect(target, 308)
    }

    const target = request.nextUrl.clone()
    target.pathname = `/${segment}/cv${rest}`
    return NextResponse.rewrite(target)
  }

  return intlMiddleware(request) as NextResponse
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|downloads|logos|opengraph-image|icon|apple-icon|.*\\..*).*)'],
}
