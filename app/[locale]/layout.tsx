import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { Manrope, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'

import { routing } from '@/i18n/routing'
import { podarMensajes } from '@/i18n/client-messages'
import { BrandDefs } from '@/components/site/BrandDefs'

import '../globals.css'

/**
 * Manrope en todos los roles de texto. Es una grotesca geométrica con un
 * rango de pesos muy amplio: el mismo tipo sirve para un titular en 800 y
 * para el cuerpo en 400, así que la página tiene una sola voz y no dos
 * familias peleando.
 */
const sans = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
})

/**
 * JetBrains Mono es la voz de operaciones del sitio: marcas de tiempo,
 * versiones, contadores, líneas de registro. Todo lo que es artefacto de
 * máquina se escribe en mono; es estructura con significado, no decoración.
 */
const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
})

export const viewport: Viewport = {
  themeColor: '#0a1322',
  width: 'device-width',
  initialScale: 1,
}

/**
 * Metadatos que valen para todo el sitio.
 *
 * Los que cambian por página —título, descripción, canónica, tarjeta— los arma
 * `lib/seo/metadata.ts`. Acá va solo lo que es cierto en las trece páginas y en
 * los dos idiomas.
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nidra.cloud'),
  applicationName: 'Nidra',
  /**
   * Quién firma el sitio.
   *
   * `creator` y `publisher` son los que aparecen en el panel de algunos
   * lectores y en la ficha de LinkedIn cuando no encuentra otra cosa. Sin
   * ellos, algunos clientes muestran el dominio pelado.
   */
  authors: [{ name: 'Juan Mujica', url: 'https://www.linkedin.com/company/nidracloud' }],
  creator: 'Juan Mujica',
  publisher: 'Nidra',
  /**
   * Apaga la detección automática de teléfonos y direcciones en iOS.
   *
   * Safari en iPhone convierte por su cuenta cualquier cosa que se parezca a un
   * número en un enlace azul con su propio estilo: los años del currículum, los
   * rangos de plazos —«3 a 5 días»—, los identificadores de versión. El sitio
   * ya pone un enlace donde de verdad hay un teléfono.
   */
  formatDetection: { telephone: false, address: false, email: false },
  /**
   * El manifiesto de aplicación web: nombre, color e iconos para cuando alguien
   * guarda el sitio en la pantalla de inicio del teléfono. Ver `app/manifest.ts`.
   */
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: false, title: 'Nidra', statusBarStyle: 'black-translucent' },
  category: 'technology',
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}


export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  // Habilita el renderizado estático: debe llamarse antes que cualquier otra
  // función de next-intl.
  setRequestLocale(locale)

  return (
    <html lang={locale} className={`${sans.variable} ${mono.variable}`}>
      <body>
        {/* El degradado y el halo de la marca. Van acá, y no dentro del
            logotipo, porque el logotipo aparece dos o tres veces por página y
            repetir los `id` es HTML inválido. */}
        <BrandDefs />
        <NextIntlClientProvider messages={podarMensajes(await getMessages())}>
          {children}
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
