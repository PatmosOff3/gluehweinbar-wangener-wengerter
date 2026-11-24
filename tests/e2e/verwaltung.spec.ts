import { expect, test } from '@playwright/test'
import { abschliessen, admin, einrichten, taste } from './bedienung'

test('pflegt Artikel, gemeinsame Preise, Pfand und Verfügbarkeit', async ({
  page,
}) => {
  await einrichten(page)
  await admin(page)
  await taste(page, 'Artikel anlegen').click()
  await taste(page, 'Artikel speichern').click()
  expect(
    await page
      .getByLabel('Bezeichnung')
      .evaluate((el) => (el as HTMLInputElement).validity.valueMissing),
  ).toBe(true)
  await page.getByLabel('Bezeichnung').fill('Probeartikel')
  await page.getByLabel('Preis (€)', { exact: true }).fill('-1')
  await taste(page, 'Artikel speichern').click()
  await expect(page.getByRole('alert')).toContainText('Betrag')
  await page.getByLabel('Preis (€)', { exact: true }).fill('1,23')
  await taste(page, 'Artikel speichern').click()
  await expect(page.getByLabel('Bezeichnung')).toHaveCount(0)
  const rot = page.getByRole('listitem').filter({ hasText: 'Glühwein rot' })
  await rot.getByRole('button', { name: 'Bearbeiten' }).click()
  await page.getByLabel('Preis (€)', { exact: true }).fill('4,10')
  await taste(page, 'Artikel speichern').click()
  await expect(
    page.getByRole('listitem').filter({ hasText: 'Glühwein weiß' }),
  ).toContainText('4,10 €')
  await page.getByLabel('Globales Pfand (€)').fill('3')
  await taste(page, 'Pfand speichern').click()
  await taste(page, 'Sperren und zur Kasse').click()
  await taste(page, /^Probeartikel/).click()
  await abschliessen(page)
  await taste(page, /^Glühwein weiß 0/).click()
  await expect(
    page.locator('.bestellung').getByText('7,10 € kassieren'),
  ).toBeVisible()
  await abschliessen(page)
  await admin(page)
  const probe = page.getByRole('listitem').filter({ hasText: 'Probeartikel' })
  await probe.getByRole('button', { name: 'Deaktivieren' }).click()
  await expect(probe).toContainText('Ausverkauft')
  await expect(
    page.getByRole('row').filter({ hasText: 'Probeartikel' }),
  ).toContainText('1,23 €')
  await taste(page, 'Sperren und zur Kasse').click()
  await expect(taste(page, /^Probeartikel/)).toHaveCount(0)
  await admin(page)
  await probe.getByRole('button', { name: 'Reaktivieren' }).click()
  await taste(page, 'Sperren und zur Kasse').click()
  await expect(taste(page, /^Probeartikel/)).toBeVisible()
})
test('warnt im zweiten Fenster und verhindert Buchung in das abgeschlossene Fest', async ({
  page,
  context,
}) => {
  await einrichten(page)
  const zweites = await context.newPage()
  await zweites.goto('/')
  await expect(zweites.getByText(/weiteren Fenster geöffnet/)).toBeVisible()
  await taste(zweites, /^Glühwein rot 0/).click()
  await taste(zweites, 'Zur Zahlung').click()
  await taste(zweites, 'Passend').click()
  await admin(page)
  await page.getByLabel('Neuer Veranstaltungsname').fill('Zweites Fest')
  await taste(page, 'Neue Veranstaltung starten').click()
  await taste(page, 'Abschluss bestätigen').click()
  await expect(
    zweites.getByText(/vorherige Veranstaltung ist abgeschlossen/),
  ).toBeVisible()
  await expect(taste(zweites, 'Vorgang abschließen')).toHaveCount(0)
  await expect(zweites.getByRole('navigation')).toContainText('Zweites Fest')
  await page
    .getByLabel('Veranstaltung auswählen')
    .selectOption({ label: 'Winterfest (abgeschlossen)' })
  await expect(
    page.locator('dt').filter({ hasText: 'Warenumsatz' }).locator('+ dd'),
  ).toHaveText('0,00 €')
})
