import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { KassenDB, schemaV1 } from '../src/storage/db'
import {
  buchungen,
  einrichten,
  letzterVerkauf,
  pfandSetzen,
  produktSpeichern,
  sortiment,
  statistik,
  stornieren,
  umbenennen,
  verkaufen,
  wechseln,
} from '../src/application/kasse'
import { pinErstellen, pinPruefen } from '../src/application/pin'
import {
  sichern,
  sicherungLesen,
  wiederherstellen,
} from '../src/export/sicherung'
import { berechnen } from '../src/domain/kasse'
import { csv } from '../src/export/dateien'

const pin = await pinErstellen('7428')
let db: KassenDB
let id: string
beforeEach(async () => {
  db = new KassenDB(crypto.randomUUID())
  id = await einrichten(db, 'Winterfest', 200, pin)
})
afterEach(async () => {
  await db.delete()
})
async function buchen(index = 0, vorhanden = 0, rueckgabe = 0) {
  const artikel = (await sortiment(db, id))[index]
  const pfand = (await db.eventSettings.get(id))!.pfand
  const b = berechnen([{ artikel, menge: 1 }], pfand, vorhanden, rueckgabe)
  return verkaufen(db, id, crypto.randomUUID(), b, Math.max(b.summe, 0))
}
it('migriert ein v1-Sortiment ohne Reihenfolge', async () => {
  const name = crypto.randomUUID()
  const alt = new Dexie(name)
  alt.version(1).stores(schemaV1)
  await alt.table('products').add({ id: 'a', eventId: id, name: 'Bier' })
  alt.close()
  const neu = new KassenDB(name)
  try {
    expect(await neu.products.get('a')).toMatchObject({
      name: 'Bier',
      sortierung: 0,
    })
    expect(neu.tables).toHaveLength(5)
  } finally {
    await neu.delete()
  }
})
it('bewahrt die Nummer und alle Tabellen bei Abbruch und parallelen Abschlüssen', async () => {
  const [a, b] = await Promise.all([buchen(), buchen()])
  expect([a.nummer, b.nummer].sort()).toEqual([1, 2])
  await expect(
    verkaufen(
      db,
      id,
      a.id,
      berechnen([{ artikel: a.positionen[0], menge: 1 }], 200, 0, 0),
      550,
    ),
  ).rejects.toThrow()
  expect((await db.events.get(id))?.naechsteNummer).toBe(3)
  expect(await db.transactions.count()).toBe(2)
})
it('entscheidet bei gleichem Zeitstempel nach Nummer und korrigiert einen Verkauf genau einmal', async () => {
  const a = await buchen()
  const b = await buchen(8, 0, 2)
  await db.transactions.update(b.id, { zeit: a.zeit })
  expect((await letzterVerkauf(db, id))?.id).toBe(b.id)
  const ergebnisse = await Promise.allSettled([
    stornieren(db, id, b.id),
    stornieren(db, id, b.id),
  ])
  expect(ergebnisse.filter((e) => e.status === 'fulfilled')).toHaveLength(1)
  expect((await letzterVerkauf(db, id))?.id).toBe(a.id)
  expect(await statistik(db, id)).toMatchObject({
    ware: 400,
    eingenommen: 200,
    ausgezahlt: 0,
  })
})
it('kopiert alle Einstellungen und sperrt nach Wechsel auch eine zweite offene Verbindung', async () => {
  const alt = await sortiment(db, id)
  await produktSpeichern(db, { ...alt[0], preis: 400, einheit: 'Becher' })
  await produktSpeichern(db, { ...alt[8], aktiv: false })
  await pfandSetzen(db, id, 300)
  await buchen()
  const zweites = new KassenDB(db.name)
  await zweites.open()
  try {
    const neu = await wechseln(db, id, 'Advent')
    const kopie = await sortiment(db, neu)
    const vorher = await sortiment(db, id)
    expect(
      kopie.map((p) => [
        p.name,
        p.einheit,
        p.preis,
        p.pflicht,
        p.aktiv,
        p.sortierung,
      ]),
    ).toEqual(
      vorher.map((p) => [
        p.name,
        p.einheit,
        p.preis,
        p.pflicht,
        p.aktiv,
        p.sortierung,
      ]),
    )
    expect(kopie[0].gruppe).toBe(kopie[1].gruppe)
    expect(kopie[0].gruppe).not.toBe(vorher[0].gruppe)
    expect(kopie.every((p, i) => p.id !== vorher[i].id)).toBe(true)
    expect(await zweites.eventSettings.get(neu)).toMatchObject({ pfand: 300 })
    expect(await statistik(db, neu)).toEqual({
      ausgegebeneGefaesse: 0,
      zurueckgenommeneGefaesse: 0,
      ware: 0,
      eingenommen: 0,
      ausgezahlt: 0,
      artikel: [],
    })
    expect(await buchungen(db, neu)).toHaveLength(0)
    await expect(produktSpeichern(zweites, alt[0])).rejects.toThrow(
      'abgeschlossen',
    )
    await expect(pfandSetzen(zweites, id, 100)).rejects.toThrow('abgeschlossen')
    await expect(buchen()).rejects.toThrow('abgeschlossen')
    await expect(stornieren(zweites, id, 'x')).rejects.toThrow('abgeschlossen')
    await produktSpeichern(db, { ...kopie[0], preis: 999 })
    expect((await sortiment(db, id))[0].preis).toBe(400)
    await expect(umbenennen(db, id, '  ')).rejects.toThrow()
    await umbenennen(db, id, 'Früheres Fest')
    expect((await db.events.get(id))?.name).toBe('Früheres Fest')
  } finally {
    zweites.close()
  }
})
it('bewahrt gebuchte Werte bei Preis-, Namens-, Pfand- und Verfügbarkeitsänderungen', async () => {
  await buchen(0)
  const bier = (await sortiment(db, id))[2]
  await buchen(2)
  await produktSpeichern(db, { ...bier, preis: 350 })
  await buchen(2)
  expect(
    (await statistik(db, id)).artikel.find((p) => p.name === 'Bier')?.umsatz,
  ).toBe(650)
  await produktSpeichern(db, { ...bier, name: 'Fassbier', aktiv: false })
  await pfandSetzen(db, id, 300)
  await buchen(1, 0, 1)
  const s = await statistik(db, id)
  expect(s).toMatchObject({ eingenommen: 500, ausgezahlt: 300 })
  expect(csv('Fest', s)).toContain('"Bier";"0,33 l";"2";"6,50"')
  expect(csv('Fest', s)).not.toContain('Fassbier')
})
it('legt individuelle Produkte an, aktualisiert und filtert sie', async () => {
  const honig = {
    ...(await sortiment(db, id))[5],
    id: crypto.randomUUID(),
    name: 'Testartikel',
    einheit: '',
    preis: 123,
  }
  await produktSpeichern(db, honig)
  expect(await sortiment(db, id)).toHaveLength(12)
  await expect(produktSpeichern(db, { ...honig, preis: -1 })).rejects.toThrow()
  await expect(produktSpeichern(db, { ...honig, name: ' ' })).rejects.toThrow()
  expect((await db.products.get(honig.id))?.preis).toBe(123)
})
it('sichert alle Tabellen und stellt PIN, Stornos und Veranstaltungen in einer leeren DB wieder her', async () => {
  const b = await buchen()
  await stornieren(db, id, b.id)
  const neu = await wechseln(db, id, 'Zweites Fest')
  const text = await sichern(db)
  const daten = sicherungLesen(text)
  expect(sicherungLesen(await sichern(db))).toEqual(daten)
  expect(text).not.toContain('"7428"')
  const ziel = new KassenDB(crypto.randomUUID())
  try {
    await wiederherstellen(ziel, text, true)
    await wiederherstellen(ziel, text, true)
    expect(sicherungLesen(await sichern(ziel))).toEqual(daten)
    const geraet = (await ziel.deviceSettings.get('geraet'))!
    expect(geraet.activeEventId).toBe(neu)
    expect(await pinPruefen('7428', geraet.pin)).toBe(true)
    expect(await pinPruefen('1234', geraet.pin)).toBe(false)
    expect((await pinErstellen('7428')).salt).not.toBe(geraet.pin.salt)
  } finally {
    await ziel.delete()
  }
})
it('verwirft defekte, unvollständige, widersprüchliche und zu neue Sicherungen sowie Abbruch und Schreibfehler', async () => {
  await buchen()
  const text = await sichern(db)
  const roh = JSON.parse(text)
  for (const s of [
    '{',
    '{}',
    JSON.stringify({ ...roh, version: 999 }),
    text.replace('"deviceSettings"', '"fehlt"'),
    text.replace(
      roh.daten.deviceSettings[0].activeEventId,
      crypto.randomUUID(),
    ),
  ]) {
    await expect(wiederherstellen(db, s, true)).rejects.toThrow()
  }
  await pfandSetzen(db, id, 999)
  const vorher = sicherungLesen(await sichern(db))
  await wiederherstellen(db, text, false)
  expect(sicherungLesen(await sichern(db))).toEqual(vorher)
  const fehler = () => {
    throw new Error('Testabbruch')
  }
  db.transactions.hook('creating', fehler)
  await expect(wiederherstellen(db, text, true)).rejects.toThrow('Testabbruch')
  db.transactions.hook('creating').unsubscribe(fehler)
  expect(sicherungLesen(await sichern(db))).toEqual(vorher)
})
