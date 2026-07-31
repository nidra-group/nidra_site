import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { Instrument_Sans, Instrument_Serif } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'

import { routing } from '@/i18n/routing'

import '../globals.css'

const sans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument-sans',
})

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-instrument-serif',
})

export const viewport: Viewport = {
  themeColor: '#f7f5f1',
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
    <html lang={locale} className={`${sans.variable} ${serif.variable}`}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
