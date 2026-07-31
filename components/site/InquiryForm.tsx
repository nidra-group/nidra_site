'use client'

import { useActionState, useEffect, useId, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'

import { submitInquiry, type InquiryResult } from '@/actions/submit-inquiry'
import { SERVICE_OPTIONS } from '@/lib/validation/inquiry'
import { Button } from '@/components/ui/Button'
import { Link } from '@/i18n/navigation'
import { CONTACT_EMAIL } from '@/lib/contact'

/**
 * Formulario de consulta con mejora progresiva.
 *
 * `<form action={serverAction}>` se envía por HTTP estándar cuando el navegador
 * no ejecuta JavaScript, y sin recarga cuando sí lo hace. Es el mismo camino de
 * código, no dos implementaciones (FR-050, SC-016).
 */
export function InquiryForm({
  timestamp,
  initialService = '',
}: {
  timestamp: string
  initialService?: string
}) {
  const t = useTranslations('contact.form')
  const services = useTranslations('services')
  const locale = useLocale()
  const id = useId()

  const [state, formAction, pending] = useActionState<InquiryResult, FormData>(submitInquiry, {
    status: 'idle',
  })

  // El desplegable necesita volver a montarse después de cada envío.
  //
  // Al terminar la acción, React 19 reinicia el formulario. Los campos de texto
  // vuelven a su `defaultValue` actualizado y conservan lo escrito, pero un
  // `<select>` vuelve al `selected` que venía en el HTML original. Controlarlo
  // tampoco alcanza: si el estado de React no cambió, React no reescribe el
  // nodo y el desplegable termina MOSTRANDO una cosa y ENVIANDO otra, que es el
  // peor fallo posible en un formulario.
  //
  // Cambiar la `key` en cada resultado lo reconstruye con la opción correcta ya
  // marcada, y así el DOM sigue siendo la única fuente de verdad: lo que se ve
  // es siempre lo que se envía. Se ajusta durante el renderizado —el patrón que
  // documenta React para reaccionar a un cambio de prop— y no en un efecto, que
  // provocaría un renderizado en cascada.
  const [attempt, setAttempt] = useState(0)
  const [lastState, setLastState] = useState(state)
  if (state !== lastState) {
    setLastState(state)
    setAttempt((n) => n + 1)
  }

  const formRef = useRef<HTMLFormElement>(null)

  // Sin esto, quien navega por teclado o con lector de pantalla envía el
  // formulario, la página vuelve y nada le indica qué pasó ni dónde.
  useEffect(() => {
    if (state.status !== 'invalid') return
    const first = Object.keys(state.errors)[0]
    if (!first) return
    const field = formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)
    field?.focus()
  }, [state])

  if (state.status === 'success') {
    return (
      <div role="status" className="border border-accent/30 bg-accent/5 p-6">
        <h3 className="text-heading text-ink">{t('success.title')}</h3>
        <p className="measure mt-2 text-body text-muted">{t('success.body')}</p>
      </div>
    )
  }

  const errors = state.status === 'invalid' ? state.errors : {}
  const values = state.status === 'invalid' || state.status === 'failed' ? state.values : {}

  const fieldError = (field: string) => {
    const key = errors[field]
    return key ? t(`errors.${key}`) : undefined
  }

  return (
    <form ref={formRef} action={formAction} noValidate className="space-y-6">
      <input type="hidden" name="ts" value={timestamp} />
      <input type="hidden" name="locale" value={locale} />

      {/* Campo trampa. Oculto por CSS y no por `type="hidden"`: un campo
          oculto nativo es trivial de detectar para un bot; un campo de texto
          normal movido fuera de la vista, no. Excluido del foco y de los
          lectores de pantalla para no molestar a nadie. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>No completar</label>
        <input id={`${id}-website`} type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === 'failed' && (
        <div role="alert" className="border-l-2 border-highlight bg-highlight/5 p-4">
          <p className="text-small text-ink">
            {state.reason === 'rate_limit' && t('errors.rateLimit')}
            {state.reason === 'rejected' && t('errors.rejected')}
            {state.reason === 'delivery' && t('errors.delivery')}
            {state.reason === 'unavailable' && t('errors.unavailable')}
          </p>
          <p className="mt-1.5 text-small text-muted">
            {t('errors.deliveryFallback', { email: CONTACT_EMAIL })}
          </p>
        </div>
      )}

      {state.status === 'invalid' && (
        <div role="alert" className="border-l-2 border-highlight bg-highlight/5 p-4">
          <p className="text-small font-medium text-ink">{t('errorSummary')}</p>
          <ul className="mt-2 space-y-1">
            {Object.entries(errors).map(([field, key]) => (
              <li key={field} className="text-small">
                <a href={`#${id}-${field}`} className="link">
                  {t(`errors.${key}`)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-small text-muted">{t('requiredHint')}</p>

      <Field
        id={`${id}-name`}
        name="name"
        label={`${t('name')} *`}
        defaultValue={values.name}
        error={fieldError('name')}
        autoComplete="name"
        required
      />

      <Field
        id={`${id}-email`}
        name="email"
        type="email"
        label={`${t('email')} *`}
        defaultValue={values.email}
        error={fieldError('email')}
        autoComplete="email"
        required
      />

      <Field
        id={`${id}-company`}
        name="company"
        label={`${t('company')} (${t('companyOptional')})`}
        defaultValue={values.company}
        error={fieldError('company')}
        autoComplete="organization"
      />

      <div>
        <label htmlFor={`${id}-service`} className="block text-small font-medium text-ink">
          {t('service')} *
        </label>
        <select
          key={attempt}
          id={`${id}-service`}
          name="service"
          required
          defaultValue={values.service ?? initialService}
          aria-invalid={fieldError('service') ? true : undefined}
          aria-describedby={fieldError('service') ? `${id}-service-error` : undefined}
          className="mt-2 min-h-[3rem] w-full border border-line bg-paper px-3.5 py-3 text-body text-ink"
        >
          <option value="" disabled>
            {t('servicePlaceholder')}
          </option>
          {SERVICE_OPTIONS.filter((option) => option !== 'other').map((option) => (
            <option key={option} value={option}>
              {services(`items.${option}`)}
            </option>
          ))}
          <option value="other">{t('serviceOther')}</option>
        </select>
        {fieldError('service') && (
          <p id={`${id}-service-error`} className="mt-1.5 text-small text-critical">
            {fieldError('service')}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${id}-message`} className="block text-small font-medium text-ink">
          {t('message')} *
        </label>
        <p id={`${id}-message-hint`} className="mt-1 text-small text-muted">
          {t('messageHint')}
        </p>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={6}
          required
          minLength={20}
          maxLength={2000}
          defaultValue={values.message}
          aria-invalid={fieldError('message') ? true : undefined}
          aria-describedby={
            fieldError('message') ? `${id}-message-error` : `${id}-message-hint`
          }
          className="mt-2 w-full border border-line bg-paper px-3.5 py-3 text-body text-ink"
        />
        {fieldError('message') && (
          <p id={`${id}-message-error`} className="mt-1.5 text-small text-critical">
            {fieldError('message')}
          </p>
        )}
      </div>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? t('submitting') : t('submit')}
        </Button>
        <p className="measure-tight mt-4 text-small text-muted">
          {t('privacyNote')}{' '}
          <Link href="/privacidad" className="link">
            {t('privacyLink')}
          </Link>
        </p>
      </div>
    </form>
  )
}

function Field({
  id,
  name,
  label,
  error,
  type = 'text',
  ...rest
}: {
  id: string
  name: string
  label: string
  error?: string
  type?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="block text-small font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-2 min-h-[3rem] w-full border border-line bg-paper px-3.5 py-3 text-body text-ink"
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-small text-critical">
          {error}
        </p>
      )}
    </div>
  )
}
