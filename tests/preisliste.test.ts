import 'fake-indexeddb/auto'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { KassenDB } from '../src/storage/db'
import { einrichten, finalePreisliste, pfandSetzen, produktSpeichern, sortiment, verkaufen, wechseln } from '../src/application/kasse'
import { berechnen } from '../src/domain/kasse'
import { sichern, sicherungLesen, wiederherstellen } from '../src/export/sicherung'
import { csv } from '../src/export/dateien'
import { auswerten } from '../src/domain/kasse'
import type { Pin } from '../src/application/pin'
import { readFileSync } from 'node:fs'

const pin: Pin = { version: 1, verfahren: 'PBKDF2-SHA-256', iterationen: 600000, salt: '00'.repeat(16), pruefwert: '00'.repeat(32) }
let db: KassenDB
let id: string
beforeEach(async () => {
  db = new KassenDB(crypto.randomUUID())
  id = await einrichten(db, 'Fest', 500, pin)
})
afterEach(async () => { await db.delete() })

async function vorlaeufig() {
  const artikel = await sortiment(db, id)
  await db.products.bulkDelete(artikel.filter((p) => p.name.startsWith('Tresterbrand') || p.name === 'Honig').map((p) => p.id))
  await db.products.bulkPut(artikel.filter((p) => p.name.startsWith('Glühwein')).map((p) => ({ ...p, preis: 350, einheit: '0,2 l' })))
  await db.eventSettings.put({ eventId: id, pfand: 200 })
  const schorle = { ...artikel[7], id: crypto.randomUUID(), name: 'Apfelsaftschorle', preis: 250, sortierung: 12 }
  const fremd = { ...schorle, id: crypto.randomUUID(), name: 'Kuchen', aktiv: false }
  await db.products.bulkAdd([schorle, fremd])
  return { artikel, schorle, fremd }
}

it('migriert atomar, erhält IDs und Fremdartikel und überschreibt spätere Änderungen nicht', async () => {
  const { artikel, schorle, fremd } = await vorlaeufig()
  await db.products.update(artikel[2].id, { aktiv: false })
  await Promise.all([finalePreisliste(db), finalePreisliste(db)])
  const neu = await sortiment(db, id)
  expect(neu.filter((p) => p.name.startsWith('Tresterbrand'))).toHaveLength(2)
  expect(neu.find((p) => p.name === 'Honig')?.preis).toBe(800)
  expect(await db.products.get(artikel[0].id)).toMatchObject({ preis: 400, einheit: '' })
  expect(await db.products.get(artikel[2].id)).toMatchObject({ aktiv: false })
  expect(await db.products.get(schorle.id)).toMatchObject({ aktiv: false })
  expect(await db.products.get(fremd.id)).toMatchObject({ name: 'Kuchen', preis: 250, aktiv: false })
  expect(await db.eventSettings.get(id)).toMatchObject({ pfand: 500, sortimentsstand: 'weihnachtsmarkt-2026-final' })
  await produktSpeichern(db, { ...neu[0], preis: 450 })
  await pfandSetzen(db, id, 600)
  await finalePreisliste(db)
  expect(await db.products.count()).toBe(neu.length)
  expect((await db.products.get(artikel[0].id))?.preis).toBe(450)
  expect((await db.eventSettings.get(id))?.pfand).toBe(600)
  const folge = await wechseln(db, id, 'Folgefest')
  await finalePreisliste(db)
  expect((await db.eventSettings.get(folge))?.pfand).toBe(600)
})

it('bewahrt historische Buchungen, CSV, geschlossene Veranstaltungen und leere Einheiten im Backup', async () => {
  await vorlaeufig()
  const rot = (await sortiment(db, id))[0]
  const b = berechnen([{ artikel: rot, menge: 1 }], 200, 0, 0)
  const alt = await verkaufen(db, id, crypto.randomUUID(), b, 550)
  const altId = id
  const alteArtikel = await sortiment(db, altId)
  id = await wechseln(db, altId, 'Neues Fest')
  await finalePreisliste(db)
  expect(await db.transactions.get(alt.id)).toEqual(alt)
  expect(await sortiment(db, altId)).toEqual(alteArtikel)
  expect((await db.eventSettings.get(altId))?.pfand).toBe(200)
  expect(csv('Alt', auswerten([alt]))).toContain('"Glühwein rot";"0,2 l";"1";"3,50"')
  const neuRot = (await sortiment(db, id))[0]
  const neu = await verkaufen(db, id, crypto.randomUUID(), berechnen([{ artikel: neuRot, menge: 1 }], 500, 0, 0), 900)
  expect(csv('Neu', auswerten([neu]))).toContain('"Glühwein rot";"";"1";"4,00"')
  const text = await sichern(db)
  await wiederherstellen(db, text, true)
  expect(sicherungLesen(await sichern(db))).toEqual(sicherungLesen(text))
})

it('stellt alte Sicherungen vor dem nächsten Verkauf um und bewahrt spätere Anpassungen im Rundlauf', async () => {
  await vorlaeufig()
  const alt = await sichern(db)
  await wiederherstellen(db, alt, true)
  expect((await db.eventSettings.get(id))?.pfand).toBe(500)
  await pfandSetzen(db, id, 700)
  const honig = (await sortiment(db, id)).find((p) => p.name === 'Honig')!
  await produktSpeichern(db, { ...honig, name: 'Met', alkohol: true, symbol: '🍷' })
  const neu = await sichern(db)
  await wiederherstellen(db, neu, true)
  await finalePreisliste(db)
  expect((await db.eventSettings.get(id))?.pfand).toBe(700)
  expect(await db.products.get(honig.id)).toMatchObject({ name: 'Met', alkohol: true, symbol: '🍷' })
})

it('rollt eine fehlgeschlagene Umstellung einschließlich Marker zurück', async () => {
  await vorlaeufig()
  const vorher = sicherungLesen(await sichern(db))
  const fehler = () => { throw new Error('Schreibfehler') }
  db.products.hook('creating', fehler)
  await expect(finalePreisliste(db)).rejects.toThrow('Schreibfehler')
  db.products.hook('creating').unsubscribe(fehler)
  expect(sicherungLesen(await sichern(db))).toEqual(vorher)
})

it('übernimmt auch eine echte v1-Sicherung und erzeugt ein wieder lesbares finales Backup', async () => {
  const text = readFileSync(new URL('./fixtures/sicherung-v1.json', import.meta.url), 'utf8')
  await wiederherstellen(db, text, true)
  const stand = sicherungLesen(await sichern(db))
  expect(stand.eventSettings[0]).toMatchObject({ pfand: 500, sortimentsstand: 'weihnachtsmarkt-2026-final' })
  // Die Fixture hat zwei eigene Verkaufseinheiten; diese Artikel bleiben erhalten.
  expect(stand.products.filter((p) => p.aktiv)).toHaveLength(13)
  for (const alt of sicherungLesen(text).products)
    expect(stand.products.find((p) => p.id === alt.id)).toMatchObject({ name: alt.name, einheit: alt.einheit, preis: alt.preis })
})

it('hält Sicherungen auch bei mehrdeutigen alten Glühweinartikeln konsistent', async () => {
  await vorlaeufig()
  const rot = (await sortiment(db, id))[0]
  await db.products.add({ ...rot, id: crypto.randomUUID() })
  await finalePreisliste(db)
  expect(() => sicherungLesen('')).toThrow()
  const stand = sicherungLesen(await sichern(db))
  expect(stand.products.find((p) => p.id === rot.id)?.preis).toBe(350)
  expect(stand.products.filter((p) => p.name === 'Glühwein rot' && p.einheit === '')).toHaveLength(1)
})
