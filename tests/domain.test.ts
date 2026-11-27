import { expect, it } from 'vitest'
import {
  auswerten,
  barzahlung,
  berechnen,
  euroEingabe,
  geld,
  schnellbetraege,
  umkehr,
  type Buchung,
} from '../src/domain/kasse'
import { kachelmerkmale, preisgruppe, standardsortiment } from '../src/domain/sortiment'

const produkte = standardsortiment('fest', () => crypto.randomUUID())
// Historische Rechenbeispiele bleiben unabhängig von den aktuellen Vorgaben.
const rot = { ...produkte[0], preis: 350 }
const weiss = { ...produkte[1], preis: 350 }
it('ergänzt Kennzeichen für Altartikel und respektiert eigene Angaben', () => {
  expect(kachelmerkmale({ ...rot, einheit: '0,25 l', symbol: undefined, alkohol: undefined })).toEqual({ symbol: '☕', alkohol: true })
  expect(kachelmerkmale({ ...rot, symbol: '🍎', alkohol: false })).toEqual({ symbol: '🍎', alkohol: false })
})
const schorle = { ...produkte[7], preis: 250 }
const runde = (artikel = rot, menge = 1, vorhanden = 0, rueck = 0) =>
  berechnen([{ artikel, menge }], 200, vorhanden, rueck)
it('rechnet ausschließlich in sicheren ganzen Cent und Stückzahlen', () => {
  expect(euroEingabe('0,10') + euroEingabe('0.20')).toBe(30)
  expect(geld(30)).toBe('0,30 €')
  expect(euroEingabe('6,2')).toBe(620)
  for (const s of ['0,001', '-1', '1e3', '', '9007199254740992'])
    expect(() => euroEingabe(s)).toThrow()
  expect(() => runde(rot, 1.5)).toThrow()
  expect(() => runde(rot, Number.MAX_SAFE_INTEGER)).toThrow()
})
it('trennt neue Tasse, Nachfüllung und Leergut auch bei Nullbetrag', () => {
  expect(runde()).toMatchObject({ summe: 550, eingenommen: 200 })
  expect(runde(rot, 1, 4)).toMatchObject({
    summe: 350,
    vorhanden: 1,
    eingenommen: 0,
    ausgezahlt: 0,
  })
  expect(runde(rot, 2, 2, 2)).toMatchObject({
    summe: 300,
    ware: 700,
    eingenommen: 0,
    ausgezahlt: 400,
  })
  expect(runde(schorle, 1, 0, 2).summe).toBe(-150)
  expect(berechnen([], 200, 0, 3).summe).toBe(-600)
  expect(runde({ ...schorle, preis: 200 }, 1, 0, 1).summe).toBe(0)
})
it('prüft erhaltenes Bargeld, Schnellbeträge, freie Eingabe und Rückgeld', () => {
  expect(schnellbetraege).toEqual([500, 1000, 1500, 2000, 3000, 4000, 5000])
  expect(barzahlung(550, 550).rueckgeld).toBe(0)
  expect(barzahlung(550, 1000).rueckgeld).toBe(450)
  expect(barzahlung(550, euroEingabe('6')).rueckgeld).toBe(50)
  expect(() => barzahlung(550, 500)).toThrow()
  expect(barzahlung(-600, 0).gegeben).toBe(0)
})
it('summiert gebuchte Positionen und beide Pfandsummen unabhängig vom Wechselgeld', () => {
  const bestellungen = [runde(), runde(weiss, 1, 1), berechnen([{ artikel: schorle, menge: 1 }], 500, 0, 2)]
  const buchungen: Buchung[] = bestellungen.map((b, i) => ({
    ...b,
    ...barzahlung(b.summe, [1000, 350, 0][i]),
    eventId: 'fest',
    id: String(i),
    nummer: i + 1,
    art: 'verkauf',
    zeit: '2026-11-01',
  }))
  expect(auswerten(buchungen)).toMatchObject({
    ware: 950,
    eingenommen: 200,
    ausgezahlt: 1000,
    ausgegebeneGefaesse: 1,
    zurueckgenommeneGefaesse: 2,
    artikel: [
      { name: rot.name, menge: 1, umsatz: 350 },
      { name: weiss.name, menge: 1, umsatz: 350 },
      { name: schorle.name, menge: 1, umsatz: 250 },
    ],
  })
  const storno = umkehr(buchungen[2], '4', 4, '2026-11-02')
  expect(auswerten([...buchungen, storno])).toMatchObject({
    ware: 700,
    ausgegebeneGefaesse: 1,
    zurueckgenommeneGefaesse: 0,
    eingenommen: 200,
    ausgezahlt: 0,
  })
  expect(storno.positionen[0]).not.toBe(buchungen[2].positionen[0])
  expect(
    auswerten([buchungen[1], umkehr(buchungen[1], '5', 5, '2026-11-02')]),
  ).toEqual({ artikel: [], ware: 0, eingenommen: 0, ausgezahlt: 0, ausgegebeneGefaesse: 0, zurueckgenommeneGefaesse: 0 })
})
it('führt elf finale Artikel, getrennte Glühwein-IDs und einen gemeinsamen Preis', () => {
  expect(produkte).toHaveLength(11)
  expect(produkte.map((p) => p.preis)).toEqual([
    400, 400, 300, 300, 600, 1800, 200, 200, 1800, 1800, 800,
  ])
  expect(produkte.map((p) => p.pflicht)).toEqual([
    true,
    true,
    false,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
  ])
  expect(
    preisgruppe(produkte, { ...rot, preis: 400 }).map((p) => [p.id, p.preis]),
  ).toEqual([
    [rot.id, 400],
    [weiss.id, 400],
  ])
  expect(rot.id).not.toBe(weiss.id)
  expect(produkte.some((p) => p.name === 'Honig')).toBe(true)
  expect(produkte.some((p) => p.name.includes('schorle'))).toBe(false)
  expect(produkte.slice(0, 2).map((p) => p.einheit)).toEqual(['', ''])
})
