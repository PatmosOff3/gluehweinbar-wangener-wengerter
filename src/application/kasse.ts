import {
  auswerten,
  barzahlung,
  berechnen,
  positivOderNull,
  umkehr,
  type Bestand,
  type Buchung,
  type Produkt,
} from '../domain/kasse'
import { pfandgefaess, preisgruppe, standardsortiment, SORTIMENTSSTAND } from '../domain/sortiment'
import { type KassenDB, type Veranstaltung } from '../storage/db'
import type { Pin } from './pin'

export const neueId = () => crypto.randomUUID()
const jetzt = () => new Date().toISOString()

function bezeichnung(text: string) {
  if (!text.trim()) throw new Error('Bitte einen Namen eingeben.')
  return text.trim()
}

function veranstaltung(name: string): Veranstaltung {
  return {
    id: neueId(),
    name: bezeichnung(name),
    status: 'active',
    start: jetzt(),
    naechsteNummer: 1,
  }
}

export async function einrichten(
  db: KassenDB,
  name: string,
  pfand: number,
  pin: Pin,
) {
  const event = veranstaltung(name)
  positivOderNull(pfand)
  await db.transaction(
    'rw',
    [db.events, db.products, db.eventSettings, db.deviceSettings],
    async () => {
      await db.deviceSettings.add({
        id: 'geraet',
        activeEventId: event.id,
        pin,
      })
      await db.events.add(event)
      await db.eventSettings.add({ eventId: event.id, pfand, sortimentsstand: SORTIMENTSSTAND })
      await db.products.bulkAdd(standardsortiment(event.id, neueId))
    },
  )
  return event.id
}

async function aktiv(db: KassenDB, eventId: string) {
  const [geraet, event] = await Promise.all([
    db.deviceSettings.get('geraet'),
    db.events.get(eventId),
  ])
  if (geraet?.activeEventId !== eventId || event?.status !== 'active')
    throw new Error(
      'Diese Veranstaltung ist inzwischen abgeschlossen. Bitte die aktive Veranstaltung öffnen.',
    )
  return event
}
export const sortiment = (db: KassenDB, eventId: string) =>
  db.products.where('eventId').equals(eventId).sortBy('sortierung')

export async function finalePreisliste(db: KassenDB) {
  await db.transaction('rw', [db.deviceSettings, db.events, db.eventSettings, db.products], async () => {
    const geraet = await db.deviceSettings.get('geraet')
    if (!geraet) return
    const eventId = geraet.activeEventId
    const event = await db.events.get(eventId)
    const einstellungen = await db.eventSettings.get(eventId)
    if (event?.status !== 'active' || !einstellungen)
      throw new Error('Die aktive Veranstaltung oder ihre Pfandeinstellungen fehlen.')
    const bisher = await sortiment(db, eventId)
    if (einstellungen.sortimentsstand === SORTIMENTSSTAND) {
      if (!bisher.some((p) => p.nurPfand))
        await db.products.add(pfandgefaess(eventId, neueId(), (bisher.at(-1)?.sortierung ?? -1) + 1))
      return
    }
    const vorgaben = standardsortiment(eventId, neueId)
    const gluehweine = bisher.filter((p) => /^Glühwein (rot|weiß)$/.test(p.name) && ['', '0,2 l'].includes(p.einheit))
    const alteGruppe = gluehweine.find((p) => p.gruppe)?.gruppe
    const gruppe = alteGruppe && gluehweine.length === 2 &&
      new Set(gluehweine.map((p) => p.name)).size === 2 &&
      bisher.every((p) => p.gruppe !== alteGruppe || gluehweine.includes(p))
      ? alteGruppe : neueId()
    const aenderungen = vorgaben.map((v) => {
      const treffer = bisher.filter((p) => p.nurPfand === v.nurPfand && p.name === v.name &&
        (p.einheit === v.einheit || (/^Glühwein (rot|weiß)$/.test(v.name) && p.einheit === '0,2 l')))
      // Unbekannte oder mehrdeutige Artikel werden nicht überschrieben.
      const alt = treffer.length === 1 ? treffer[0] : undefined
      return {
        ...v,
        ...(alt ? { id: alt.id, aktiv: alt.aktiv } : {}),
        ...(/^Glühwein (rot|weiß)$/.test(v.name) ? { gruppe } : {}),
      }
    })
    const bekannteIds = new Set(aenderungen.map((p) => p.id))
    const weitere = bisher.filter((p) => !bekannteIds.has(p.id)).map((p, i) => ({
      ...p,
      sortierung: vorgaben.length + i,
      ...(['Apfelschorle', 'Apfelsaftschorle'].includes(p.name) ? { aktiv: false } : {}),
    }))
    await db.products.bulkPut([...aenderungen, ...weitere])
    await db.eventSettings.put({ ...einstellungen, pfand: 500, sortimentsstand: SORTIMENTSSTAND })
  })
}
export const buchungen = (db: KassenDB, eventId: string) =>
  db.transactions.where('eventId').equals(eventId).sortBy('nummer')
export const statistik = async (db: KassenDB, eventId: string) =>
  auswerten(await buchungen(db, eventId))
export async function letzterVerkauf(db: KassenDB, eventId: string) {
  const alle = await buchungen(db, eventId)
  const storniert = new Set(alle.map((b) => b.storniertId))
  return alle.reverse().find((b) => b.art === 'verkauf' && !storniert.has(b.id))
}
export async function pfandSetzen(
  db: KassenDB,
  eventId: string,
  pfand: number,
) {
  await db.transaction(
    'rw',
    [db.events, db.deviceSettings, db.eventSettings],
    async () => {
      await aktiv(db, eventId)
      await db.eventSettings.update(eventId, { pfand: positivOderNull(pfand) })
    },
  )
}
export async function produktSpeichern(db: KassenDB, produkt: Produkt) {
  const p = {
    ...produkt,
    name: bezeichnung(produkt.name),
    preis: positivOderNull(produkt.preis),
  }
  await db.transaction(
    'rw',
    [db.events, db.deviceSettings, db.products],
    async () => {
      await aktiv(db, p.eventId)
      const bisher = await db.products.get(p.id)
      if (!bisher) {
        await db.products.add(p)
        return
      }
      if (bisher.eventId !== p.eventId)
        throw new Error('Artikel gehört zu einer anderen Veranstaltung.')
      await db.products.bulkPut(
        preisgruppe(await sortiment(db, p.eventId), {
          ...p,
          gruppe: bisher.gruppe,
        }),
      )
    },
  )
}
export async function umbenennen(db: KassenDB, id: string, name: string) {
  if (!(await db.events.update(id, { name: bezeichnung(name) })))
    throw new Error('Veranstaltung wurde nicht gefunden.')
}
export async function wechseln(db: KassenDB, eventId: string, name: string) {
  const neu = veranstaltung(name)
  await db.transaction(
    'rw',
    [db.events, db.products, db.eventSettings, db.deviceSettings],
    async () => {
      await aktiv(db, eventId)
      const bisher = await db.eventSettings.get(eventId)
      if (!bisher) throw new Error('Pfandeinstellungen fehlen.')
      const gruppen = new Map<string, string>()
      const kopien = (await sortiment(db, eventId)).map((p) => {
        if (p.gruppe && !gruppen.has(p.gruppe)) gruppen.set(p.gruppe, neueId())
        return {
          ...p,
          id: neueId(),
          eventId: neu.id,
          gruppe: p.gruppe && gruppen.get(p.gruppe),
        }
      })
      await db.events.update(eventId, { status: 'closed', ende: neu.start })
      await db.events.add(neu)
      await db.eventSettings.add({ ...bisher, eventId: neu.id })
      await db.products.bulkAdd(kopien)
      await db.deviceSettings.update('geraet', { activeEventId: neu.id })
    },
  )
  return neu.id
}

export async function verkaufen(
  db: KassenDB,
  eventId: string,
  id: string,
  entwurf: Bestand,
  gegeben: number,
) {
  return db.transaction('rw', db.tables, async () => {
    const event = await aktiv(db, eventId)
    const produktliste = await db.products.bulkGet(
      entwurf.positionen.map((p) => p.id),
    )
    const einstellungen = await db.eventSettings.get(eventId)
    if (!einstellungen) throw new Error('Pfandeinstellungen fehlen.')
    const zeilen = entwurf.positionen.map((p, i) => {
      const artikel = produktliste[i]
      if (!artikel?.aktiv || artikel.eventId !== eventId)
        throw new Error('Ein bestellter Artikel ist nicht mehr verfügbar.')
      return { artikel, menge: p.menge }
    })
    const bestand = berechnen(
      zeilen,
      einstellungen.pfand,
      entwurf.vorhanden,
      entwurf.rueckgaben,
    )
    if (!zeilen.length && !bestand.rueckgaben)
      throw new Error('Die Bestellung ist leer.')
    if (JSON.stringify(bestand) !== JSON.stringify(entwurf))
      throw new Error(
        'Preise oder Artikel wurden geändert. Bitte die Bestellung erneut prüfen.',
      )
    const buchung: Buchung = {
      ...bestand,
      ...barzahlung(bestand.summe, gegeben),
      id,
      eventId,
      art: 'verkauf',
      zeit: jetzt(),
      nummer: event.naechsteNummer,
    }
    await db.events.update(eventId, {
      naechsteNummer: event.naechsteNummer + 1,
    })
    await db.transactions.add(buchung)
    return buchung
  })
}
export async function stornieren(
  db: KassenDB,
  eventId: string,
  verkaufId: string,
) {
  return db.transaction(
    'rw',
    [db.events, db.deviceSettings, db.transactions],
    async () => {
      const event = await aktiv(db, eventId)
      const verkauf = await letzterVerkauf(db, eventId)
      if (!verkauf || verkauf.id !== verkaufId)
        throw new Error('Dieser Verkauf kann nicht mehr storniert werden.')
      const storno = umkehr(verkauf, neueId(), event.naechsteNummer, jetzt())
      await db.transactions.add(storno)
      await db.events.update(eventId, {
        naechsteNummer: event.naechsteNummer + 1,
      })
    },
  )
}
