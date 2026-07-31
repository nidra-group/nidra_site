import { expect, test } from '@playwright/test'

/**
 * El desplegable de servicio ya rompió dos veces la conversión del sitio, y las
 * dos veces de la misma forma: mostrando un servicio distinto del que enviaba.
 *
 * La causa es que React 19 reinicia el formulario al terminar la acción y un
 * `<select>` vuelve al `selected` del HTML original. No hay prueba unitaria que
 * pueda verlo —depende del DOM real y del ciclo de vida de la acción—, así que
 * vive acá.
 */

const MENSAJE = 'Tenemos un proceso de carga manual que consume horas cada semana.'

/** El servidor rechaza envíos con menos de 3 segundos: es la defensa anti-bot. */
const ESPERA_ANTIBOT = 3_500

async function completar(page: import('@playwright/test').Page, servicio?: string) {
  await page.fill('input[name=name]', 'Ana Prueba')
  await page.fill('input[name=email]', 'ana@ejemplo.com')
  if (servicio) await page.selectOption('select[name=service]', servicio)
  await page.fill('textarea[name=message]', MENSAJE)
  await page.waitForTimeout(ESPERA_ANTIBOT)
}

test.describe('formulario de consulta', () => {
  test('preselecciona el servicio que llega por parámetro', async ({ page }) => {
    await page.goto('/es/contacto?servicio=ai-roadmap')
    await expect(page.locator('select[name=service]')).toHaveValue('ai-roadmap')
  })

  test('descarta un servicio inventado en lugar de mostrarlo', async ({ page }) => {
    await page.goto('/es/contacto?servicio=no-existe')
    await expect(page.locator('select[name=service]')).toHaveValue('')
  })

  test('conserva el servicio elegido cuando el envío falla', async ({ page }) => {
    await page.goto('/es/contacto')
    await completar(page, 'workflow-automation')
    await page.click('button[type=submit]')

    await expect(page.getByRole('alert')).toBeVisible()
    // Lo que se ve es lo que se enviaría: el FormData lee este mismo nodo.
    await expect(page.locator('select[name=service]')).toHaveValue('workflow-automation')
  })

  test('deja cambiar el servicio después de un fallo', async ({ page }) => {
    await page.goto('/es/contacto?servicio=ai-roadmap')
    await completar(page, 'workflow-automation')
    await page.click('button[type=submit]')
    await expect(page.getByRole('alert')).toBeVisible()

    await page.selectOption('select[name=service]', 'internal-knowledge-base')
    await page.waitForTimeout(ESPERA_ANTIBOT)
    await page.click('button[type=submit]')
    await expect(page.locator('select[name=service]')).toHaveValue('internal-knowledge-base')
  })

  test.describe('sin JavaScript', () => {
    test.use({ javaScriptEnabled: false })

    test('preselecciona y repuebla igual que con JavaScript', async ({ page }) => {
      await page.goto('/es/contacto?servicio=ai-roadmap')
      await expect(page.locator('select[name=service]')).toHaveValue('ai-roadmap')

      await page.fill('input[name=name]', 'Ana Prueba')
      await page.fill('input[name=email]', 'correo-mal-formado')
      await page.selectOption('select[name=service]', 'workflow-automation')
      await page.fill('textarea[name=message]', MENSAJE)
      await page.waitForTimeout(ESPERA_ANTIBOT)
      await page.click('button[type=submit]')

      await expect(page.getByRole('alert')).toBeVisible()
      await expect(page.locator('select[name=service]')).toHaveValue('workflow-automation')
      await expect(page.locator('input[name=name]')).toHaveValue('Ana Prueba')
    })
  })
})
