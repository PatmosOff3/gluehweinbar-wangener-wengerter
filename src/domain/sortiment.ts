import type { Produkt } from './kasse'

type Vorgabe = [name: string, einheit: string, preis: number, pflicht: boolean]
export const SORTIMENTSSTAND = 'weihnachtsmarkt-2026-final' as const
const vorgaben: Vorgabe[] = [
  ['Glühwein rot', '', 400, true],
  ['Glühwein weiß', '', 400, true],
  ['Bier', '0,33 l', 300, false],
  ['Wein', '0,1 l', 300, true],
  ['Wein', '0,2 l', 600, true],
  ['Wein', 'Flasche, 0,75 l', 1800, false],
  ['Schnaps', '2 cl', 200, false],
  ['Sprudel Classic', '0,5 l', 200, false],
  ['Tresterbrand klar', '0,5 l', 1800, false],
  ['Tresterbrand Barrique', '0,5 l', 1800, false],
  ['Honig', '500 g', 800, false],
]

export function standardsortiment(
  eventId: string,
  neueId: () => string,
): Produkt[] {
  const gruppe = neueId()
  return vorgaben.map(([name, einheit, preis, pflicht], sortierung) => ({
    id: neueId(),
    eventId,
    name,
    einheit,
    preis,
    pflicht,
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
