import { useState } from 'react'
import { einrichten } from '../application/kasse'
import { pinErstellen } from '../application/pin'
import { euroEingabe, geld } from '../domain/kasse'
import { standardsortiment } from '../domain/sortiment'
import { db } from '../storage/db'
import { Fehler, useAktion } from './formulare'
import { Wiederherstellung } from './Sicherungen'

export function Einrichtung() {
  const [name, benennen] = useState('')
  const [pin, waehlen] = useState('')
  const [pfand, aendern] = useState('5,00')
  const [sortiment] = useState(() =>
    standardsortiment('vorschau', () => crypto.randomUUID()),
  )
  const aktion = useAktion()
  return (
    <main className="einrichtung">
      <h2>Kasse einrichten</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void aktion.ausfuehren(async () => {
            await einrichten(
              db,
              name,
              euroEingabe(pfand),
              await pinErstellen(pin),
            )
          })
        }}
      >
        <label>
          Veranstaltungsname
          <input
            required
            value={name}
            onChange={(e) => benennen(e.target.value)}
          />
        </label>
        <label>
          Admin-PIN
          <input
            type="password"
            autoComplete="new-password"
            inputMode="numeric"
            pattern="[0-9]{4,12}"
            minLength={4}
            maxLength={12}
            required
            value={pin}
            onChange={(e) => waehlen(e.target.value)}
          />
        </label>
        <small>4 bis 12 Ziffern</small>
        <label>
          Pfand pro Gefäß (€)
          <input
            inputMode="decimal"
            required
            value={pfand}
            onChange={(e) => aendern(e.target.value)}
          />
        </label>
        <details>
          <summary>Standardsortiment prüfen</summary>
          <ul>
            {sortiment.map((p) => (
              <li key={p.id}>
                {p.name}{p.einheit && ' · ' + p.einheit} · {geld(p.preis)}
                {p.pflicht && ' + Pfand'}
              </li>
            ))}
          </ul>
        </details>
        <label className="check">
          <input type="checkbox" required /> Standardsortiment übernehmen
        </label>
        <Fehler text={aktion.fehler} />
        <button className="primaer" disabled={aktion.beschaeftigt}>
          Kasse einrichten
        </button>
      </form>
      <Wiederherstellung />
    </main>
  )
}
