import { expect, test } from '@playwright/test'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { createServer } from 'node:http'
import { resolve, sep } from 'node:path'
import { once } from 'node:events'
import type { AddressInfo } from 'node:net'
import { abschliessen, admin, einrichten, taste } from './bedienung'

test('liefert installierbares Manifest und lokale PNGs in passender Größe', async ({
  request,
}) => {
  const manifest = await (await request.get('/manifest.webmanifest')).json()
  expect(manifest).toMatchObject({
    start_url: '/',
    scope: '/',
    display: 'standalone',
    short_name: 'Glühweinbar',
  })
  for (const size of [192, 512]) {
    const icon = manifest.icons.find(
      (i: { sizes: string }) => i.sizes === size + 'x' + size,
    )
    const buffer = await (await request.get(icon.src)).body()
    expect(buffer.readUInt32BE(16)).toBe(size)
    expect(buffer.readUInt32BE(20)).toBe(size)
  }
})

test('startet dasselbe Profil nach vollständigem Schließen ohne Netz und kassiert weiter', async ({
  playwright,
  browserName,
  viewport,
  hasTouch,
  isMobile,
}) => {
  const browserTyp = playwright[browserName]
  const testTmp = process.env.KASSEN_TEST_TMPDIR ?? tmpdir()
  const verzeichnis = await mkdtemp(resolve(testTmp, 'kassenprofil-'))
  const optionen = {
    baseURL: 'http://127.0.0.1:4173',
    viewport,
    hasTouch,
    isMobile,
  }
  let profil = await browserTyp.launchPersistentContext(verzeichnis, optionen)
  try {
    const seite = await profil.newPage()
    await einrichten(seite)
    await expect(
      seite.getByText('Offline bereit', { exact: true }),
    ).toBeVisible()
    await admin(seite)
    const ausgang = seite.waitForEvent('download')
    await taste(seite, 'Sicherung herunterladen').click()
    const leer = JSON.parse(
      await readFile((await (await ausgang).path())!, 'utf8'),
    )
    expect(leer.daten.transactions).toEqual([])
    await taste(seite, 'Sperren und zur Kasse').click()
    await profil.setOffline(true)
    await taste(seite, /^Glühwein rot \d/).click()
    await abschliessen(seite)
    await admin(seite)
    const download = seite.waitForEvent('download')
    await taste(seite, 'Sicherung herunterladen').click()
    const datei = await readFile((await (await download).path())!)
    const csv = seite.waitForEvent('download')
    await taste(seite, 'CSV herunterladen').click()
    expect((await csv).suggestedFilename()).toBe('Winterfest.csv')
    await taste(seite, 'Letzten Verkauf stornieren').click()
    await taste(seite, 'Storno bestätigen').click()
    await seite.getByLabel('Neuer Veranstaltungsname').fill('Folgefest')
    await taste(seite, 'Neue Veranstaltung starten').click()
    await taste(seite, 'Abschluss bestätigen').click()
    await expect(
      seite.getByRole('heading', { name: 'Statistik · Folgefest' }),
    ).toBeVisible()
    await seite.getByLabel('Sicherungsdatei auswählen').setInputFiles({
      name: 'Kassenstand.json',
      mimeType: 'application/json',
      buffer: datei,
    })
    await taste(seite, 'Gesamten Kassenstand ersetzen').click()
    await expect(taste(seite, 'Admin-Bereich')).toBeVisible()
    await profil.close()
    profil = await browserTyp.launchPersistentContext(verzeichnis, {
      ...optionen,
      offline: true,
    })
    const neu = await profil.newPage()
    await neu.goto('/')
    await expect(neu.getByRole('navigation')).toContainText('Winterfest')
    expect(await neu.evaluate(() => navigator.onLine)).toBe(false)
    await admin(neu)
    await expect(
      neu.getByRole('row').filter({ hasText: 'Glühwein rot' }),
    ).toContainText('4,00 €')
    await taste(neu, 'Sperren und zur Kasse').click()
    await taste(neu, /^Glühwein weiß \d/).click()
    await abschliessen(neu)
    await expect(neu.getByText('Vorgang 2 gebucht.')).toBeVisible()
    await admin(neu)
    await neu.getByLabel('Neuer Veranstaltungsname').fill('Nächster Markttag')
    await taste(neu, 'Neue Veranstaltung starten').click()
    await taste(neu, 'Abschluss bestätigen').click()
    await expect(
      neu.getByRole('heading', { name: 'Statistik · Nächster Markttag' }),
    ).toBeVisible()
    const ende = neu.waitForEvent('download')
    await taste(neu, 'Sicherung herunterladen').click()
    const stand = JSON.parse(
      await readFile((await (await ende).path())!, 'utf8'),
    )
    expect(stand.daten.transactions).toHaveLength(2)
    expect(stand.daten.events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Winterfest', status: 'closed' }),
        expect.objectContaining({
          name: 'Nächster Markttag',
          status: 'active',
        }),
      ]),
    )
  } finally {
    await profil.close()
    if (verzeichnis.startsWith(resolve(testTmp, 'kassenprofil-')))
      await rm(verzeichnis, { recursive: true, force: true, maxRetries: 3 })
  }
})

test('wartet auf vollständigen Precache und übernimmt Updates erst nach der offenen Bestellung', async ({
  browser,
}) => {
  let revision = 1
  let freigeben!: () => void
  const pause = new Promise<void>((done) => {
    freigeben = done
  })
  const root = resolve('dist')
  const server = createServer(async (req, res) => {
    try {
      const pfad = new URL(req.url ?? '/', 'http://localhost').pathname
      const datei = resolve(root, '.' + (pfad === '/' ? '/index.html' : pfad))
      if (!datei.startsWith(root + sep)) {
        res.writeHead(404).end()
        return
      }
      let bytes = await readFile(datei)
      if (pfad === '/icon-512.png') await pause
      if (pfad === '/sw.js')
        bytes = Buffer.concat([
          bytes,
          Buffer.from('\n// Testversion ' + revision),
        ])
      const typ = pfad.endsWith('.js')
        ? 'application/javascript'
        : pfad.endsWith('.css')
          ? 'text/css'
          : pfad.endsWith('.png')
            ? 'image/png'
            : pfad.endsWith('webmanifest')
              ? 'application/manifest+json'
              : 'text/html'
      res
        .writeHead(200, { 'Content-Type': typ, 'Cache-Control': 'no-store' })
        .end(bytes)
    } catch {
      res.writeHead(404).end()
    }
  })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:' + (server.address() as AddressInfo).port,
  })
  try {
    const page = await context.newPage()
    await page.setViewportSize({ width: 1024, height: 600 })
    await einrichten(page)
    await expect(
      page.getByText('Offline-Bereitschaft ausstehend'),
    ).toBeVisible()
    freigeben()
    await expect(
      page.getByText('Offline bereit', { exact: true }),
    ).toBeVisible()
    await taste(page, /^Glühwein rot \d/).click()
    revision++
    await page.evaluate(async () => {
      await (await navigator.serviceWorker.ready).update()
    })
    const update = taste(page, 'Update übernehmen')
    await expect(update).toBeDisabled()
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true)
    await expect(taste(page, 'Zur Zahlung')).toBeInViewport({ ratio: 1 })
    await expect(
      page.locator('.bestellung').getByText('9,00 € kassieren'),
    ).toBeVisible()
    await abschliessen(page)
    await expect(update).toBeEnabled()
    await Promise.all([page.waitForEvent('load'), update.click()])
    await expect(update).toHaveCount(0)
    await admin(page)
    await expect(taste(page, 'Letzten Verkauf stornieren')).toBeVisible()
  } finally {
    freigeben()
    await context.close()
    server.closeAllConnections()
    server.close()
  }
})
