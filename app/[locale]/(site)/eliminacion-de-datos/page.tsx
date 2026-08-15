import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { LegalDocument } from '@/components/site/LegalDocument'
import { routing, type Locale } from '@/i18n/routing'
import { buildMetadata } from '@/lib/seo/metadata'

type Props = { params: Promise<{ locale: Locale }> }

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal.dataDeletion.meta' })
  return buildMetadata({
    locale,
    href: '/eliminacion-de-datos',
    title: t('title'),
    description: t('description'),
  })
}

export default async function DataDeletionPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <LegalDocument namespace="legal.dataDeletion" />
}
