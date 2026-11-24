import { expect, type Page } from '@playwright/test'

export const taste = (page: Page, name: string | RegExp) =>
  page.getByRole('button', { name, exact: typeof name === 'string' })
export async function einrichten(page: Page) {
  await page.goto('/')
  await page
    .getByLabel('Veranstaltungsname', { exact: true })
    .fill('Winterfest')
  await page.getByLabel('Admin-PIN').fill('7428')
  await page.getByLabel('Standardsortiment übernehmen').check()
  await taste(page, 'Kasse einrichten').click()
  await expect(taste(page, 'Admin-Bereich')).toBeVisible()
}
export async function admin(page: Page) {
  await taste(page, 'Admin-Bereich').click()
  await page.getByLabel('Admin-PIN').fill('7428')
  await taste(page, 'Entsperren').click()
  await expect(
    page.getByRole('heading', { name: 'Verwaltung', exact: true }),
  ).toBeVisible()
}
export async function abschliessen(page: Page, zahlung = 'Passend') {
  await taste(page, 'Zur Zahlung').click()
  if (zahlung) await taste(page, zahlung).click()
  await taste(page, 'Vorgang abschließen').click()
  await expect(page.getByText(/Vorgang \d+ gebucht/)).toBeVisible()
}
