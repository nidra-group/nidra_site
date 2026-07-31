import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'

import { routing } from '@/i18n/routing'

import '../globals.css'

const sans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument-sans',
})

/**
 * Bricolage Grotesque para títulos: una grotesca con carácter propio —trampas
 * de tinta, aperturas cerradas— que se distingue de las sans neutrales sin
 * caer en la serif editorial que hoy delata a las webs generadas con IA.
 */
const display = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage',
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
  themeColor: '#f4f6f2',
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
    <html lang={locale} className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
