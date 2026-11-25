import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import axe from 'axe-core'
import { abschliessen, admin, einrichten, taste } from './bedienung'

test('prüft Ersteinrichtung, Zugang, Mengentasten, Rückgeld, Auszahlung und Doppeltippen', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'storage', {
      value: { persisted: async () => false, persist: async () => false },
    })
  })
  await page.goto('/')
  await taste(page, 'Kasse einrichten').click()
  await expect(taste(page, 'Admin-Bereich')).toHaveCount(0)
  await einrichten(page)
  const rot = taste(page, /^Glühwein rot \d/)
  const weiss = taste(page, /^Glühwein weiß \d/)
  await rot.click()
  await taste(page, /^− Pfand/).click()
  await taste(page, 'Bestellung leeren').click()
  await expect(taste(page, 'Zur Zahlung')).toBeDisabled()
  await rot.click()
  await rot.click()
  await weiss.click()
  await taste(page, 'Glühwein rot verringern').click()
  await taste(page, 'Glühwein weiß entfernen').click()
  await expect(
    page.locator('.bestellung').getByText('9,00 € kassieren'),
  ).toBeVisible()
  await taste(page, 'Zur Zahlung').click()
  await expect(page.locator('.zahlungszusammenfassung')).toContainText(
    'Glühwein rot',
  )
  await expect(taste(page, 'Admin-Bereich')).toHaveCount(0)
  for (const wert of ['15 €', '30 €', '40 €', '50 €']) {
    await expect(taste(page, wert)).toBeVisible()
  }
  await taste(page, '5 €').click()
  await expect(page.getByText(/reicht nicht aus/)).toBeVisible()
  await expect(taste(page, 'Vorgang abschließen')).toBeDisabled()
  await taste(page, '10 €').click()
  await expect(page.getByText('1,00 € Rückgeld')).toBeVisible()
  await taste(page, 'Anderer Betrag').click()
  await expect(page.getByLabel('Erhaltenes Bargeld (€)')).toBeFocused()
  await expect(page.getByLabel('Erhaltenes Bargeld (€)')).toHaveAttribute(
    'inputmode',
    'decimal',
  )
  await page.getByLabel('Erhaltenes Bargeld (€)').fill('9,50')
  await expect(page.getByText('0,50 € Rückgeld')).toBeVisible()
  await taste(page, 'Vorgang abschließen').evaluate((button) => {
    ;(button as HTMLButtonElement).click()
    ;(button as HTMLButtonElement).click()
  })
  await expect(page.getByText('Vorgang 1 gebucht.')).toBeVisible()
  await taste(page, /^− Pfand/).click()
  await expect(
    page.locator('.bestellung').getByText('5,00 € auszahlen'),
  ).toBeVisible()
  await abschliessen(page, '')
  await expect(page.getByText('Vorgang 2 gebucht.')).toBeVisible()
  await taste(page, 'Admin-Bereich').click()
  await page.getByLabel('Admin-PIN').fill('0000')
  await taste(page, 'Entsperren').click()
  await expect(page.getByText('Die Admin-PIN ist falsch.')).toBeVisible()
  for (const name of [
    'Artikel anlegen',
    'Neue Veranstaltung starten',
    'CSV herunterladen',
    'Sicherung herunterladen',
  ])
    await expect(taste(page, name)).toHaveCount(0)
  await page.getByLabel('Admin-PIN').fill('7428')
  await taste(page, 'Entsperren').click()
  await expect(page.getByText(/lokaler Bedienungsschutz/)).toBeVisible()
  await expect(
    page.getByText(/Dauerhafter Speicher ist nicht bestätigt/),
  ).toBeVisible()
  await expect(page.getByText(/JSON-Datei ist unverschlüsselt/)).toBeVisible()
  await taste(page, 'Sperren und zur Kasse').click()
  await taste(page, 'Admin-Bereich').click()
  await expect(page.getByLabel('Admin-PIN')).toBeEmpty()
})
test('rechnet vier Gläser ab und prüft Offline-CSV, Storno, Sicherung und Wiederherstellung', async ({
  page,
  context,
}) => {
  const fremd: string[] = []
  context.on('request', (req) => {
    if (
      /^https?:/.test(req.url()) &&
      new URL(req.url()).hostname !== '127.0.0.1'
    )
      fremd.push(req.url())
  })
  await einrichten(page)
  await expect(page.getByText('Offline bereit', { exact: true })).toBeVisible()
  await page.evaluate(() => navigator.serviceWorker.ready)
  await context.setOffline(true)
  await page.reload()
  await taste(page, /^Glühwein rot \d/).click()
  await taste(page, /^Glühwein weiß \d/).click()
  const minus = taste(page, /^− Pfand/)
  await minus.click()
  await minus.click()
  await minus.click()
  await minus.click()
  await expect(
    page.locator('.bestellung').getByText('2,00 € auszahlen'),
  ).toBeVisible()
  await abschliessen(page, '')
  await admin(page)
  const download = page.waitForEvent('download')
  await taste(page, 'CSV herunterladen').click()
  const datei = await download
  const inhalt = await readFile((await datei.path())!, 'utf8')
  expect(inhalt.split('\r\n').filter(Boolean)).toHaveLength(6)
  for (const zeile of [
    '"Winterfest";"Glühwein rot";"";"1";"4,00"',
    '"Glühwein weiß";"";"1";"4,00"',
    '"Warenumsatz";"";"";"8,00"',
    '"Eingenommenes Pfand";"";"";"0,00"',
    '"Ausgezahltes Pfand";"";"";"10,00"',
  ])
    expect(inhalt).toContain(zeile)
  const sicherung = page.waitForEvent('download')
  await taste(page, 'Sicherung herunterladen').click()
  const backup = (await (await sicherung).path())!
  await taste(page, 'Letzten Verkauf stornieren').click()
  await taste(page, 'Storno bestätigen').click()
  await expect(taste(page, 'Letzten Verkauf stornieren')).toHaveCount(0)
  await expect(
    page.locator('dt').filter({ hasText: 'Warenumsatz' }).locator('+ dd'),
  ).toHaveText('0,00 €')
  await page.getByLabel('Neuer Veranstaltungsname').fill('Advent')
  await taste(page, 'Neue Veranstaltung starten').click()
  await taste(page, 'Abschluss bestätigen').click()
  await expect(
    page.getByRole('heading', { name: 'Statistik · Advent' }),
  ).toBeVisible()
  await page
    .getByLabel('Veranstaltung auswählen')
    .selectOption({ label: 'Winterfest (abgeschlossen)' })
  await expect(taste(page, 'Artikel anlegen')).toHaveCount(0)
  await expect(taste(page, 'Pfand speichern')).toHaveCount(0)
  await page.getByLabel('Name', { exact: true }).fill('Erstes Fest')
  await taste(page, 'Namen speichern').click()
  await expect(
    page.getByRole('heading', { name: 'Statistik · Erstes Fest' }),
  ).toBeVisible()
  const umbenannt = page.waitForEvent('download')
  await taste(page, 'CSV herunterladen').click()
  expect(await readFile((await (await umbenannt).path())!, 'utf8')).toContain(
    '"Erstes Fest"',
  )
  const input = page.getByLabel('Sicherungsdatei auswählen')
  await input.setInputFiles({
    name: 'Sicherung.json',
    mimeType: 'application/json',
    buffer: await readFile(backup),
  })
  await taste(page, 'Abbrechen').click()
  await expect(
    page.getByRole('heading', { name: 'Statistik · Erstes Fest' }),
  ).toBeVisible()
  await input.setInputFiles({
    name: 'Sicherung.json',
    mimeType: 'application/json',
    buffer: await readFile(backup),
  })
  await taste(page, 'Gesamten Kassenstand ersetzen').click()
  await expect(taste(page, 'Admin-Bereich')).toBeVisible()
  await admin(page)
  await expect(
    page.getByRole('heading', { name: 'Statistik · Winterfest' }),
  ).toBeVisible()
  await expect(
    page.locator('dt').filter({ hasText: 'Warenumsatz' }).locator('+ dd'),
  ).toHaveText('8,00 €')
  expect(fremd).toEqual([])
})
test('verwendet große erreichbare Tasten und passt die Kasse an den Viewport an', async ({
  page,
}) => {
  await einrichten(page)
  for (const width of [320, 1100]) {
    await page.setViewportSize({ width, height: 660 })
    await expect(taste(page, /^Glühwein rot \d/)).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(taste(page, 'Zur Zahlung')).toBeInViewport()
    expect(
      (await taste(page, /^− Pfand/).boundingBox())!.height,
    ).toBeGreaterThanOrEqual(48)
  }
  await page.addScriptTag({ content: axe.source })
  const result = await page.evaluate(async () =>
    (window as unknown as { axe: typeof axe }).axe.run(),
  )
  expect(
    result.violations.map((v) => [v.id, v.nodes.map((n) => n.target)]),
  ).toEqual([])
})
