import { setRequestLocale } from 'next-intl/server'

import { Header } from '@/components/site/Header'
import { Footer } from '@/components/site/Footer'
import { ChatMount } from '@/components/chat/ChatMount'
import { OrganizationJsonLd } from '@/components/site/OrganizationJsonLd'
import { routing } from '@/i18n/routing'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="flex min-h-screen flex-col">
      <OrganizationJsonLd />
      <Header />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <Footer />
      <ChatMount locale={locale} />
    </div>
  )
}
