import { setRequestLocale } from 'next-intl/server'

import { Header } from '@/components/site/Header'
import { Footer } from '@/components/site/Footer'
import { ChatMount } from '@/components/chat/ChatMount'
import { OrganizationJsonLd } from '@/components/site/OrganizationJsonLd'
import { routing, type Locale } from '@/i18n/routing'

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
      {/* El idioma ya lo validó `app/[locale]/layout.tsx`, que devuelve 404
          antes de llegar acá. La firma del layout la fija Next y es `string`. */}
      <OrganizationJsonLd locale={locale as Locale} />
      <Header />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <Footer />
      <ChatMount locale={locale} />
    </div>
  )
}
