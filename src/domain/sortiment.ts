import type { Produkt } from './kasse'

type Vorgabe = [name: string, einheit: string, preis: number, pflicht: boolean]
const vorgaben: Vorgabe[] = [
  ['Glühwein rot', '0,2 l', 350, true],
  ['Glühwein weiß', '0,2 l', 350, true],
  ['Wein', '0,1 l', 250, true],
  ['Wein', '0,2 l', 500, true],
  ['Wein', 'Flasche, 0,75 l', 1500, false],
  ['Bier', '0,33 l', 300, false],
  ['Schnaps', '2 cl', 250, false],
  ['Sprudel Classic', '0,5 l', 250, false],
  ['Apfelschorle', '0,5 l', 250, false],
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
