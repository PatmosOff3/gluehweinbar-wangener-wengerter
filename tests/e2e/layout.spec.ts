import { expect, test } from '@playwright/test'
import axe from 'axe-core'
import { admin, einrichten, taste } from './bedienung'

test('hält das iPad-Layout in beiden Modi im Viewport und scrollt nur Bestellpositionen', async ({ page }, info) => {
  await page.setViewportSize({ width: 1105, height: 688 })
  await einrichten(page)
  await expect(page.getByText('Offline bereit', { exact: true })).toBeVisible()
  await expect(page.locator('.produkt')).toHaveCount(12)
  await expect(page.locator('.produkt abbr')).toHaveCount(9)
  await expect(page.locator('.produkt abbr').first()).toHaveText('ALK')
  expect(await page.locator('.produkt abbr').first().evaluate(el => {
    const text = document.createRange()
    text.selectNodeContents(el)
    const box = el.getBoundingClientRect()
    const label = text.getBoundingClientRect()
    return text.getClientRects().length === 1 && label.left >= box.left && label.right <= box.right
  })).toBe(true)
  await expect(page.locator('.gluehwein-rot .produktname [aria-hidden], .gluehwein-weiss .produktname [aria-hidden]')).toHaveCount(0)
  await expect(taste(page, /^Wein /).locator('[aria-hidden]')).toHaveText(['🍷', '🍷', '🍾'])
  await expect(taste(page, /^Schnaps /).locator('[aria-hidden]')).toHaveText('🥃')
  await expect(taste(page, /^Tresterbrand /).locator('[aria-hidden]')).toHaveText(['🍾', '🍾'])
  expect((await taste(page, 'Zur Zahlung').boundingBox())!.height).toBeGreaterThanOrEqual(64)
  await expect(page.locator('.hauptprodukte .produkt strong')).toHaveText(['Glühwein rot', 'Glühwein weiß', 'Bier'])
  const haupt = (await page.locator('.hauptprodukte .produkt').first().boundingBox())!
  const normal = (await page.locator('.produkte .produkt').first().boundingBox())!
  expect(haupt.width * haupt.height).toBeGreaterThan(normal.width * normal.height)
  await expect(page.locator('.gluehwein-rot small')).toHaveCount(0)

  for (const dunkel of [false, true]) {
    if (dunkel) await taste(page, 'Dunkelmodus').click()
    for (const size of [{ width: 1105, height: 688 }, { width: 1105, height: 604 }, { width: 1024, height: 600 }]) {
      await page.setViewportSize(size)
      expect(await page.evaluate(() => ({
        x: document.documentElement.scrollWidth <= innerWidth,
        y: document.documentElement.scrollHeight <= innerHeight,
      }))).toEqual({ x: true, y: true })
      for (const button of await page.locator('.produkt, .minus-pfand, .summenleiste button').all()) {
        await expect(button).toBeInViewport({ ratio: 1 })
        expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(48)
      }
      const pfand = (await page.locator('.minus-pfand').boundingBox())!
      const zahlleiste = (await page.locator('.summenleiste').boundingBox())!
      expect(pfand.y + pfand.height).toBeLessThanOrEqual(zahlleiste.y)
    }
    for (const label of await page.locator('.hauptprodukte strong, .hauptprodukte span').all())
      await expect(label).toBeInViewport({ ratio: 1 })
    if (info.project.name === 'WebKit') {
      await page.screenshot({ path: info.outputPath(dunkel ? 'ipad-dunkel-leer.png' : 'ipad-hell-leer.png') })
    }
    for (const button of await page.locator('.produkt').all()) await button.click()
    await expect(page.locator('.bestellung')).toHaveClass(/bestellung-aktiv/)
    await expect(page.locator('.position.gluehwein-rot')).toHaveCSS('background-color', 'rgb(121, 44, 68)')
    await expect(page.locator('.position.gluehwein-weiss')).toHaveCSS('background-color', 'rgb(240, 211, 130)')
    await expect(page.locator('.position').filter({ hasText: 'Bier' })).toContainText('🍺')
    await expect(taste(page, 'Glühwein rot verringern')).toHaveCount(0)
    await taste(page, /^Glühwein rot \d/).click()
    await expect(page.locator('.position.gluehwein-rot .positionsmenge')).toHaveText('2×')
    await taste(page, 'Glühwein rot verringern').click()
    await expect(taste(page, 'Glühwein rot verringern')).toHaveCount(0)
    const liste = page.getByRole('region', { name: 'Bestellpositionen' })
    expect(await liste.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true)
    await expect(page.locator('.scrollhinweis')).toBeVisible()
    await expect(page.locator('.scrollhinweis')).toHaveText('Weitere Artikel ↓')
    await liste.evaluate((el) => { el.scrollTop = el.scrollHeight })
    await expect(page.locator('.scrollhinweis')).toHaveText('↑ Weitere Artikel')
    await expect(taste(page, 'Honig entfernen')).toBeInViewport({ ratio: 1 })
    await expect(taste(page, 'Bestellung leeren')).toBeInViewport({ ratio: 1 })
    await expect(taste(page, 'Zur Zahlung')).toBeInViewport({ ratio: 1 })
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true)
    if (info.project.name === 'WebKit') await page.screenshot({ path: info.outputPath(dunkel ? 'ipad-dunkel-bestellung.png' : 'ipad-hell-bestellung.png') })
    await page.addScriptTag({ content: axe.source })
    const fehler = await page.evaluate(async () => (window as unknown as { axe: typeof axe }).axe.run())
    expect(fehler.violations.map((v) => [v.id, v.nodes.map((n) => n.target)])).toEqual([])
    await taste(page, 'Bestellung leeren').click()
    await expect(page.locator('.bestellung')).not.toHaveClass(/bestellung-aktiv/)
    await expect(page.locator('.scrollhinweis')).toBeHidden()
  }
  await page.reload()
  await expect(taste(page, 'Hellmodus')).toBeVisible()
  await admin(page)
  await page.getByRole('listitem').filter({ hasText: 'Bier' }).getByRole('button', { name: 'Deaktivieren', exact: true }).click()
  await taste(page, 'Sperren und zur Kasse').click()
  await expect(page.locator('.hauptprodukte .produkt strong')).toHaveText(['Glühwein rot', 'Glühwein weiß'])
})

test('erhält Bestellungen beim Themewechsel und zeigt Auszahlungen und Rückgeld rot', async ({ page }) => {
  await einrichten(page)
  await taste(page, /^Glühwein rot \d/).click()
  await expect(page.locator('.bestellsumme')).toHaveCSS('color', 'rgb(22, 98, 59)')
  await taste(page, 'Dunkelmodus').click()
  await expect(page.locator('.bestellsumme')).toHaveCSS('color', 'rgb(126, 220, 164)')
  await expect(page.locator('.bestellsumme')).toHaveText('+ 9,00 €')
  await taste(page, 'Zur Zahlung').click()
  for (const button of await page.getByRole('group', { name: 'Erhaltenes Bargeld auswählen' }).getByRole('button').all())
    // Firefox kann 80 CSS-Pixel als 79,99997 zurückgeben.
    expect((await button.boundingBox())!.height + 0.01).toBeGreaterThanOrEqual(80)
  await taste(page, 'Hellmodus').click()
  await taste(page, '10 €').click()
  await expect(page.getByText('1,00 € Rückgeld')).toHaveCSS('color', 'rgb(173, 32, 56)')
  await taste(page, 'Vorgang abschließen').click()
  await taste(page, /^− Pfand/).click()
  await expect(page.locator('.bestellsumme')).toHaveText('− 5,00 €')
  await expect(page.locator('.bestellung')).toHaveClass(/bestellung-aktiv/)
  await expect(page.locator('.bestellsumme')).toHaveCSS('color', 'rgb(173, 32, 56)')
  await taste(page, 'Zur Zahlung').click()
  await expect(page.getByText(/Kein erhaltenes Bargeld erforderlich/)).toHaveCount(0)
  await expect(page.locator('.gross')).toHaveCSS('color', 'rgb(173, 32, 56)')
  await taste(page, 'Dunkelmodus').click()
  await expect(page.locator('.gross')).toHaveCSS('color', 'rgb(255, 141, 160)')
  await taste(page, 'Vorgang abschließen').click()
  // Fünf Schnäpse und zwei Rückgaben gleichen sich aus.
  for (let i = 0; i < 5; i++) await taste(page, /^Schnaps \d/).click()
  await taste(page, /^− Pfand/).click()
  await taste(page, /^− Pfand/).click()
  await expect(page.locator('.bestellsumme')).toHaveText('+ 0,00 €')
  await expect(page.locator('.bestellung')).toHaveClass(/bestellung-aktiv/)
  await taste(page, 'Zur Zahlung').click()
  await expect(page.locator('.gross')).toHaveText('+ 0,00 €')
  await expect(taste(page, 'Vorgang abschließen')).toBeEnabled()
})

test('schaltet den Modus auch bei gesperrtem Präferenzspeicher um', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('Speicher gesperrt') }
    Storage.prototype.setItem = () => { throw new Error('Speicher gesperrt') }
  })
  await einrichten(page)
  await taste(page, 'Dunkelmodus').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dunkel')
  await taste(page, /^Glühwein rot \d/).click()
  await expect(page.locator('.bestellsumme')).toHaveText('+ 9,00 €')
})
