import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { Manrope, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'

import { routing } from '@/i18n/routing'

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
  themeColor: '#070b0d',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nidra.cloud'),
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
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
