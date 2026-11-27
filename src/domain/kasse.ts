export type Cent = number
export type Menge = number

export function ganz(wert: number): number {
  if (!Number.isSafeInteger(wert))
    throw new Error('Nur sichere ganze Zahlen sind zulässig.')
  return wert
}

export function positivOderNull(wert: number): number {
  if (ganz(wert) < 0) throw new Error('Der Wert muss mindestens null sein.')
  return wert
}

export function euroEingabe(text: string): Cent {
  const eingabe = text.trim()
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(eingabe))
    throw new Error(
      'Bitte einen Betrag mit höchstens zwei Nachkommastellen eingeben.',
    )
  const [euro, cent = ''] = eingabe.split(/[.,]/)
  return positivOderNull(Number(euro + cent.padEnd(2, '0')))
}

export function dezimal(cent: Cent): string {
  const ziffern = Math.abs(ganz(cent)).toString().padStart(3, '0')
  return (cent < 0 ? '−' : '') + ziffern.slice(0, -2) + ',' + ziffern.slice(-2)
}

export const geld = (cent: Cent) => dezimal(cent) + ' €'

export interface Artikel {
  nurPfand?: true
  id: string
  name: string
  einheit: string
  preis: Cent
  pflicht: boolean
}
export interface Produkt extends Artikel {
  symbol?: string
  alkohol?: boolean
  eventId: string
  aktiv: boolean
  sortierung: number
  gruppe?: string
}
export interface Position extends Artikel {
  menge: Menge
  pfandJeStueck: Cent
}
export interface Bestand {
  positionen: Position[]
  pfand: Cent
  automatisch: Menge
  vorhanden: Menge
  rueckgaben: Menge
  ware: Cent
  eingenommen: Cent
  ausgezahlt: Cent
  summe: Cent
}
export interface Buchung extends Bestand {
  id: string
  eventId: string
  nummer: number
  zeit: string
  art: 'verkauf' | 'storno'
  storniertId?: string
  gegeben: Cent
  rueckgeld: Cent
}

export function berechnen(
  zeilen: { artikel: Artikel; menge: Menge }[],
  pfand: Cent,
  vorhanden: Menge,
  rueckgaben: Menge,
): Bestand {
  positivOderNull(pfand)
  positivOderNull(rueckgaben)
  let automatisch = 0
  let getraenkeMitPfand = 0
  let ware = 0
  const positionen = zeilen.map(({ artikel, menge }) => {
    if (positivOderNull(menge) === 0) throw new Error('Leere Bestellposition.')
    const { id, name, einheit, preis, pflicht } = artikel
    ware = ganz(ware + ganz(positivOderNull(preis) * menge))
    if (pflicht) automatisch = ganz(automatisch + menge)
    if (pflicht && !artikel.nurPfand) getraenkeMitPfand += menge
    return {
      ...(artikel.nurPfand ? { nurPfand: true as const } : {}),
      id,
      name,
      einheit,
      preis,
      pflicht,
      menge,
      pfandJeStueck: pflicht ? pfand : 0,
    }
  })
  vorhanden = Math.min(getraenkeMitPfand, positivOderNull(vorhanden))
  const eingenommen = ganz((automatisch - vorhanden) * pfand)
  const ausgezahlt = ganz(rueckgaben * pfand)
  return {
    positionen,
    pfand,
    automatisch,
    vorhanden,
    rueckgaben,
    ware,
    eingenommen,
    ausgezahlt,
    summe: ganz(ganz(ware + eingenommen) - ausgezahlt),
  }
}

export const schnellbetraege = [
  500, 1000, 1500, 2000, 3000, 4000, 5000,
] as const

export function barzahlung(summe: Cent, gegeben: Cent) {
  ganz(summe)
  positivOderNull(gegeben)
  if (summe <= 0 && gegeben !== 0)
    throw new Error('Für diese Buchung wird kein Bargeld angenommen.')
  if (gegeben < summe) throw new Error('Der gegebene Betrag reicht nicht aus.')
  return { gegeben, rueckgeld: summe > 0 ? gegeben - summe : 0 }
}

export function umkehr(
  verkauf: Buchung,
  id: string,
  nummer: number,
  zeit: string,
): Buchung {
  if (verkauf.art !== 'verkauf')
    throw new Error('Nur Verkäufe lassen sich stornieren.')
  return {
    ...verkauf,
    positionen: verkauf.positionen.map((p) => ({ ...p })),
    art: 'storno',
    id,
    nummer,
    zeit,
    storniertId: verkauf.id,
  }
}

export function auswerten(buchungen: Buchung[]) {
  const artikel = new Map<
    string,
    { name: string; einheit: string; menge: number; umsatz: Cent }
  >()
  let eingenommen = 0
  let ausgezahlt = 0
  let ausgegebeneGefaesse = 0
  let zurueckgenommeneGefaesse = 0
  let ware = 0
  for (const buchung of buchungen) {
    const faktor = buchung.art === 'storno' ? -1 : 1
    ausgegebeneGefaesse = ganz(ausgegebeneGefaesse + faktor * (buchung.automatisch - buchung.vorhanden))
    zurueckgenommeneGefaesse = ganz(zurueckgenommeneGefaesse + faktor * buchung.rueckgaben)
    eingenommen = ganz(eingenommen + faktor * buchung.eingenommen)
    ausgezahlt = ganz(ausgezahlt + faktor * buchung.ausgezahlt)
    ware = ganz(ware + faktor * buchung.ware)
    for (const p of buchung.positionen) {
      const key = JSON.stringify([p.id, p.name, p.einheit])
      const zeile = artikel.get(key) ?? {
        name: p.name,
        einheit: p.einheit,
        menge: 0,
        umsatz: 0,
      }
      zeile.menge = ganz(zeile.menge + faktor * p.menge)
      zeile.umsatz = ganz(zeile.umsatz + faktor * p.menge * p.preis)
      artikel.set(key, zeile)
    }
  }
  return {
    artikel: [...artikel.values()].filter((p) => p.menge !== 0),
    ausgegebeneGefaesse,
    zurueckgenommeneGefaesse,
    ware,
    eingenommen,
    ausgezahlt,
  }
}
