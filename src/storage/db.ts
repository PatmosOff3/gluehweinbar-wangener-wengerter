import Dexie, { type Table } from 'dexie'
import type { Buchung, Produkt } from '../domain/kasse'
import type { Pin } from '../application/pin'

export interface Geraet {
  id: 'geraet'
  activeEventId: string
  pin: Pin
}
export interface Veranstaltung {
  id: string
  name: string
  status: 'active' | 'closed'
  start: string
  ende?: string
  naechsteNummer: number
}
export interface Einstellungen {
  eventId: string
  pfand: number
  sortimentsstand?: 'weihnachtsmarkt-2026-final'
}

export const schemaV1 = {
  deviceSettings: 'id',
  events: 'id,status',
  eventSettings: 'eventId',
  products: 'id,eventId',
  transactions: 'id,eventId,&[eventId+nummer],&storniertId',
}
export class KassenDB extends Dexie {
  deviceSettings!: Table<Geraet, string>
  events!: Table<Veranstaltung, string>
  eventSettings!: Table<Einstellungen, string>
  products!: Table<Produkt, string>
  transactions!: Table<Buchung, string>
  constructor(name = 'gluehweinbar') {
    super(name)
    this.version(1).stores(schemaV1)
    this.version(2)
      .stores({ products: 'id,eventId,[eventId+sortierung]' })
      .upgrade((tx) =>
        tx
          .table('products')
          .toCollection()
          .modify((p) => {
            p.sortierung ??= 0
          }),
      )
  }
}
export const db = new KassenDB()
