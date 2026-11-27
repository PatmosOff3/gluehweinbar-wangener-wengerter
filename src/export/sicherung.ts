import { z } from 'zod'
import { barzahlung, berechnen, type Buchung } from '../domain/kasse'
import type { KassenDB } from '../storage/db'
import { finalePreisliste } from '../application/kasse'

const zahl = z.number().int().nonnegative()
const id = z.uuid()
const name = z.string().refine((s) => !!s.trim())
const zeit = z.iso.datetime()
const artikel = z.object({
  id,
  name,
  einheit: z.string(),
  preis: zahl,
  pflicht: z.boolean(),
})
const position = artikel.extend({ menge: zahl.positive(), pfandJeStueck: zahl })
const produkt = artikel.extend({
  symbol: z.string().max(16).optional(),
  alkohol: z.boolean().optional(),
  eventId: id,
  aktiv: z.boolean(),
  sortierung: zahl,
  gruppe: id.optional(),
})
const pin = z.object({
  version: z.literal(1),
  verfahren: z.literal('PBKDF2-SHA-256'),
  iterationen: z.literal(600000),
  salt: z.string().regex(/^[a-f0-9]{32}$/),
  pruefwert: z.string().regex(/^[a-f0-9]{64}$/),
})
const buchung = z.object({
  id,
  eventId: id,
  nummer: zahl.positive(),
  zeit,
  art: z.enum(['verkauf', 'storno']),
  storniertId: id.optional(),
  positionen: z.array(position),
  pfand: zahl,
  automatisch: zahl,
  vorhanden: zahl,
  rueckgaben: zahl,
  ware: zahl,
  eingenommen: zahl,
  ausgezahlt: zahl,
  summe: z.number().int(),
  gegeben: zahl,
  rueckgeld: zahl,
})
const tabellen = z.object({
  deviceSettings: z
    .array(z.object({ id: z.literal('geraet'), activeEventId: id, pin }))
    .length(1),
  events: z.array(
    z.object({
      id,
      name,
      status: z.enum(['active', 'closed']),
      start: zeit,
      ende: zeit.optional(),
      naechsteNummer: zahl.positive(),
    }),
  ),
  eventSettings: z.array(
    z.object({
      eventId: id,
      pfand: zahl,
      sortimentsstand: z.literal('weihnachtsmarkt-2026-final').optional(),
    }),
  ),
  products: z.array(produkt),
  transactions: z.array(buchung),
})
const format = z.object({
  format: z.literal('gluehweinbar-kasse'),
  version: z.literal(2),
  anwendung: z.string().min(1),
  erstellt: zeit,
  daten: tabellen,
})
const alt = format.extend({
  version: z.literal(1),
  daten: tabellen.extend({
    products: z.array(produkt.omit({ sortierung: true })),
  }),
})
type Daten = z.infer<typeof tabellen>

function pruefe(bedingung: boolean) {
  if (!bedingung)
    throw new Error('Die Sicherung enthält widersprüchliche Daten.')
}
function eindeutig(ids: (string | number)[]) {
  pruefe(new Set(ids).size === ids.length)
}
function pruefeBuchung(b: Buchung) {
  const neu = berechnen(
    b.positionen.map((p) => ({ artikel: p, menge: p.menge })),
    b.pfand,
    b.vorhanden,
    b.rueckgaben,
  )
  pruefe(b.positionen.length > 0 || b.rueckgaben > 0)
  for (const feld of [
    'summe',
    'ware',
    'automatisch',
    'vorhanden',
    'eingenommen',
    'ausgezahlt',
  ] as const)
    pruefe(neu[feld] === b[feld])
  pruefe(barzahlung(b.summe, b.gegeben).rueckgeld === b.rueckgeld)
  eindeutig(b.positionen.map((p) => p.id))
  pruefe(
    b.positionen.every(
      (p, i) => p.pfandJeStueck === neu.positionen[i].pfandJeStueck,
    ),
  )
}
function referenzen(d: Daten) {
  const events = new Map(d.events.map((e) => [e.id, e]))
  const produkte = new Map(d.products.map((p) => [p.id, p]))
  const vorgaenge = new Map(d.transactions.map((b) => [b.id, b]))
  eindeutig(d.events.map((e) => e.id))
  eindeutig(d.products.map((p) => p.id))
  eindeutig(d.transactions.map((b) => b.id))
  eindeutig(d.eventSettings.map((s) => s.eventId))
  pruefe(
    d.eventSettings.length === events.size &&
      d.eventSettings.every((s) => events.has(s.eventId)),
  )
  pruefe(
    d.events.filter((e) => e.status === 'active').length === 1 &&
      events.get(d.deviceSettings[0].activeEventId)?.status === 'active',
  )
  pruefe(d.events.every((e) => (e.status === 'closed' ? !!e.ende : !e.ende)))
  const gruppen = new Map<string, string>()
  for (const p of d.products) {
    pruefe(events.has(p.eventId))
    if (!p.gruppe) continue
    const einstellung = JSON.stringify([p.eventId, p.preis, p.einheit])
    pruefe(!gruppen.has(p.gruppe) || gruppen.get(p.gruppe) === einstellung)
    gruppen.set(p.gruppe, einstellung)
  }
  const storniert = new Set<string>()
  const nummern = new Map<string, Set<number>>()
  for (const b of d.transactions) {
    const event = events.get(b.eventId)
    pruefe(!!event && b.nummer < event.naechsteNummer)
    const folge = nummern.get(b.eventId) ?? new Set<number>()
    pruefe(!folge.has(b.nummer))
    folge.add(b.nummer)
    nummern.set(b.eventId, folge)
    pruefe(b.positionen.every((p) => produkte.get(p.id)?.eventId === b.eventId))
    pruefeBuchung(b)
    if (b.art === 'verkauf') {
      pruefe(!b.storniertId)
      continue
    }
    const original = vorgaenge.get(b.storniertId ?? '')
    if (!original) throw new Error('Der Verkauf zum Storno fehlt.')
    pruefe(
      original.art === 'verkauf' &&
        original.eventId === b.eventId &&
        original.nummer < b.nummer &&
        !storniert.has(original.id),
    )
    for (const feld of [
      'positionen',
      'pfand',
      'vorhanden',
      'rueckgaben',
      'gegeben',
    ] as const) {
      pruefe(JSON.stringify(b[feld]) === JSON.stringify(original[feld]))
    }
    storniert.add(original.id)
  }
  for (const e of d.events)
    pruefe((nummern.get(e.id)?.size ?? 0) === e.naechsteNummer - 1)
}

export function sicherungLesen(text: string): Daten {
  let roh: unknown
  try {
    roh = JSON.parse(text)
  } catch {
    throw new Error('Die Datei enthält kein gültiges JSON.')
  }
  const kopf = z
    .object({ version: z.number(), format: z.literal('gluehweinbar-kasse') })
    .safeParse(roh)
  if (!kopf.success || ![1, 2].includes(kopf.data.version))
    throw new Error(
      'Unbekanntes Sicherungsformat oder nicht unterstützte Version.',
    )
  if (kopf.data.version === 1) {
    const quelle = alt.safeParse(roh)
    if (!quelle.success)
      throw new Error('Die ältere Sicherung ist unvollständig.')
    const v1 = quelle.data
    roh = {
      ...v1,
      version: 2,
      daten: {
        ...v1.daten,
        products: v1.daten.products.map((p, sortierung) => ({
          ...p,
          sortierung,
        })),
      },
    }
  }
  const aktuell = format.safeParse(roh)
  if (!aktuell.success)
    throw new Error('Die Sicherung enthält ungültige oder fehlende Angaben.')
  referenzen(aktuell.data.daten)
  return aktuell.data.daten
}
export async function sichern(db: KassenDB) {
  const daten = await db.transaction('r', db.tables, async () =>
    Object.fromEntries(
      await Promise.all(
        db.tables.map(async (t) => [t.name, await t.toArray()]),
      ),
    ),
  )
  return JSON.stringify(
    {
      format: 'gluehweinbar-kasse',
      version: 2,
      anwendung: '1.0.0',
      erstellt: new Date().toISOString(),
      daten,
    },
    null,
    2,
  )
}
export async function wiederherstellen(
  db: KassenDB,
  text: string,
  bestaetigt: boolean,
) {
  const daten = sicherungLesen(text)
  if (!bestaetigt) return
  await db.transaction('rw', db.tables, async () => {
    for (const t of db.tables) {
      await t.clear()
      await t.bulkAdd(daten[t.name as keyof Daten])
    }
    await finalePreisliste(db)
  })
}
