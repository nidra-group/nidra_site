import { useTranslations } from 'next-intl'

import { ButtonLink } from '@/components/ui/Button'

export default function NotFound() {
  const t = useTranslations('notFound')

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center px-5 py-20 sm:px-8">
      <p className="font-display text-[clamp(3rem,10vw,6rem)] font-extrabold leading-none text-line">404</p>
      <h1 className="mt-6 max-w-[16ch] font-display text-[clamp(2rem,5vw,3rem)] font-extrabold leading-[1.06] tracking-[-0.03em]">
        {t('title')}
      </h1>
      <p className="measure mt-5 text-lead text-muted">{t('lead')}</p>
      <div className="mt-9">
        <ButtonLink href="/" variant="secondary">
          {t('cta')}
        </ButtonLink>
      </div>
    </div>
  )
}
