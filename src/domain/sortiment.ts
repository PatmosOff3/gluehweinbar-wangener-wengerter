import type { Produkt } from './kasse'

type Vorgabe = [name: string, einheit: string, preis: number, pflicht: boolean, symbol: string, alkohol: boolean]
export const SORTIMENTSSTAND = 'weihnachtsmarkt-2026-final' as const
const vorgaben: Vorgabe[] = [
  ['Glühwein rot', '', 400, true, '', true],
  ['Glühwein weiß', '', 400, true, '', true],
  ['Bier', '0,33 l', 300, false, '🍺', true],
  ['Wein', '0,1 l', 300, true, '🍷', true],
  ['Wein', '0,2 l', 600, true, '🍷', true],
  ['Wein', 'Flasche, 0,75 l', 1800, false, '🍾', true],
  ['Schnaps', '2 cl', 200, false, '🥃', true],
  ['Sprudel Classic', '0,5 l', 200, false, '💧', false],
  ['Tresterbrand klar', '0,5 l', 1800, false, '🍾', true],
  ['Tresterbrand Barrique', '0,5 l', 1800, false, '🍾', true],
  ['Honig', '500 g', 800, false, '🍯', false],
]

export function kachelmerkmale(p: Produkt) {
  const varianten = vorgaben.filter(([name]) => p.name === name)
  const vorgabe = varianten.length === 1 ? varianten[0] : varianten.find(([, einheit]) => p.einheit === einheit)
  const alteStandardtasse = vorgabe?.[4] === '' && p.symbol === '☕'
  return {
    symbol: alteStandardtasse ? '' : p.symbol ?? vorgabe?.[4] ?? '',
    alkohol: p.alkohol ?? varianten[0]?.[5] ?? false,
  }
}

export function standardsortiment(
  eventId: string,
  neueId: () => string,
): Produkt[] {
  const gruppe = neueId()
  return vorgaben.map(([name, einheit, preis, pflicht, symbol, alkohol], sortierung) => ({
    id: neueId(),
    eventId,
    name,
    einheit,
    preis,
    pflicht,
    symbol,
    alkohol,
    aktiv: true,
    sortierung,
    ...(sortierung < 2 ? { gruppe } : {}),
  }))
}

export function preisgruppe(produkte: Produkt[], neu: Produkt): Produkt[] {
  return produkte
    .filter((p) => p.id === neu.id || (neu.gruppe && p.gruppe === neu.gruppe))
    .map((p) =>
      p.id === neu.id ? neu : { ...p, preis: neu.preis, einheit: neu.einheit },
    )
}
