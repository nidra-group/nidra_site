import { setRequestLocale } from 'next-intl/server'

import { routing } from '@/i18n/routing'
import { Footer } from '@/components/site/Footer'
import { ProfileBar } from '@/components/site/ProfileBar'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

/**
 * Envoltorio del espacio profesional del fundador.
 *
 * Lleva barra propia y no la navegación del sitio comercial: el perfil vive en
 * su propio subdominio, y montar acá el menú de servicios sería mentir sobre
 * dónde está parado el visitante.
 *
 * Pero sí necesita una salida visible. Esta página es el destino de «Ver el
 * perfil completo» desde la portada —o sea, la prueba de solvencia del sitio—,
 * y antes la única vuelta era un enlace de 13 px en una esquina: se llegaba a
 * algo que parecía un documento suelto, sin forma clara de volver.
 *
 * Ambas piezas llevan `no-print`: en el currículum impreso no va navegación.
 */
export default async function ProfileLayout({
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
      <ProfileBar />
      <div className="flex-1">{children}</div>
      <div className="no-print">
        <Footer />
      </div>
    </div>
  )
}
