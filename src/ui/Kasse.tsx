import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  barzahlung,
  berechnen,
  euroEingabe,
  geld,
  schnellbetraege,
  type Bestand,
} from '../domain/kasse'
import { neueId, sortiment, verkaufen } from '../application/kasse'
import { db } from '../storage/db'
import { Fehler, useAktion } from './formulare'

export function Kasse({
  eventId,
  offenMelden,
  zahlungMelden,
}: {
  eventId: string
  offenMelden: (offen: boolean) => void
  zahlungMelden?: (zahlung: boolean) => void
}) {
  const daten = useLiveQuery(
    () =>
      db.transaction('r', [db.products, db.eventSettings], async () => ({
        produkte: await sortiment(db, eventId),
        pfand: (await db.eventSettings.get(eventId))?.pfand,
      })),
    [eventId],
  )
  const [mengen, setzen] = useState<Record<string, number>>({})
  const [minus, minusSetzen] = useState(0)

  const [zahlung, bezahlen] = useState<Bestand>()
  const [meldung, melden] = useState('')
  const produkte = daten?.produkte.filter((p) => p.aktiv) ?? []
  const zeilen = produkte
    .filter((p) => mengen[p.id] > 0)
    .map((artikel) => ({ artikel, menge: mengen[artikel.id] }))
  const automatisch = zeilen.reduce(
    (n, z) => n + (z.artikel.pflicht ? z.menge : 0),
    0,
  )
  const b = berechnen(
    zeilen,
    daten?.pfand ?? 0,
    Math.min(minus, automatisch),
    Math.max(0, minus - automatisch),
  )
  const offen = !!(b.positionen.length || minus || zahlung)
  useEffect(() => {
    offenMelden(offen)
    return () => offenMelden(false)
  }, [offen, offenMelden])
  useEffect(() => {
    zahlungMelden?.(!!zahlung)
    return () => zahlungMelden?.(false)
  }, [zahlung, zahlungMelden])
  function menge(id: string, neu: number) {
    setzen((alt) => ({ ...alt, [id]: Math.max(0, neu) }))
    melden('')
  }
  if (daten?.pfand === undefined) return <main>Kasse wird geladen …</main>
  if (zahlung)
    return (
      <Zahlung
        bestand={zahlung}
        zurueck={() => bezahlen(undefined)}
        buchen={async (gegeben, id) => {
          const buchung = await verkaufen(db, eventId, id, zahlung, gegeben)
          setzen({})
          minusSetzen(0)
          bezahlen(undefined)
          melden('Vorgang ' + buchung.nummer + ' gebucht.')
        }}
      />
    )
  return (
    <main>
      <div className="kassenraster">
        <section>
          <h2>Sortiment</h2>
          <div className="produkte">
            {produkte.map((p) => (
              <button
                key={p.id}
                className={'produkt' + (p.pflicht ? ' mit-pfand' : '')}
                onClick={() => menge(p.id, (mengen[p.id] ?? 0) + 1)}
              >
                <strong>
                  {p.name === 'Apfelsaftschorle' ? 'Apfelschorle' : p.name}
                </strong>
                <small>{p.einheit}</small>
                <span>{geld(p.preis)}</span>
              </button>
            ))}
          </div>
          <button
            className="minus-pfand"
            onClick={() => minusSetzen((v) => v + 1)}
          >
            − Pfand <span>− {geld(b.pfand)}</span>
          </button>
        </section>
        <section className="bestellung">
          <h2>Offene Bestellung</h2>
          <p className="bestellsumme">
            {geld(Math.abs(b.summe))} {b.summe < 0 ? 'auszahlen' : 'kassieren'}
          </p>
          {!offen && <p>Noch keine Artikel oder Rückgaben.</p>}
          {b.positionen.map((p) => (
            <div className="position" key={p.id}>
              <strong>
                {p.name === 'Apfelsaftschorle' ? 'Apfelschorle' : p.name}{' '}
                <small>{p.einheit}</small>
              </strong>
              <span>
                {p.menge} × {geld(p.preis)}
              </span>
              <div className="aktionen">
                <button
                  aria-label={p.name + ' verringern'}
                  onClick={() => menge(p.id, p.menge - 1)}
                >
                  −
                </button>
                <button
                  aria-label={p.name + ' entfernen'}
                  onClick={() => menge(p.id, 0)}
                >
                  Entfernen
                </button>
              </div>
            </div>
          ))}
          <dl>
            <dt>Automatisches Pfand · {b.automatisch}×</dt>
            <dd>{geld(b.automatisch * b.pfand)}</dd>
            <dt>− Pfand · {minus}×</dt>
            <dd>{geld(-minus * b.pfand)}</dd>
          </dl>
          {minus > 0 && (
            <button onClick={() => minusSetzen((v) => v - 1)}>
              Einen Pfandabzug entfernen
            </button>
          )}
          <button
            className="bestellung-loeschen"
            disabled={!offen}
            onClick={() => {
              setzen({})
              minusSetzen(0)
              melden('')
            }}
          >
            Bestellung leeren
          </button>
          <p role="status">{meldung}</p>
        </section>
      </div>
      <div className="summenleiste">
        <strong>
          {geld(Math.abs(b.summe))} {b.summe < 0 ? 'auszahlen' : 'kassieren'}
        </strong>
        <button
          className="primaer"
          disabled={!offen}
          onClick={() => bezahlen(b)}
        >
          Zur Zahlung
        </button>
      </div>
    </main>
  )
}

function Zahlung({
  bestand,
  zurueck,
  buchen,
}: {
  bestand: Bestand
  zurueck: () => void
  buchen: (gegeben: number, id: string) => Promise<void>
}) {
  const [id] = useState(neueId)
  const [wahl, waehlen] = useState<number | 'frei' | undefined>()
  const [text, eingeben] = useState('')
  const eingabe = useRef<HTMLInputElement>(null)
  const aktion = useAktion()
  let gegeben = 0
  let hinweis = ''
  let gueltig = false
  try {
    if (bestand.summe > 0 && wahl === undefined)
      throw new Error('Erhaltenes Bargeld auswählen.')
    gegeben = wahl === 'frei' ? euroEingabe(text) : (wahl ?? 0)
    const bar = barzahlung(bestand.summe, gegeben)
    hinweis =
      bestand.summe > 0
        ? geld(bar.rueckgeld) + ' Rückgeld'
        : 'Kein erhaltenes Bargeld erforderlich.'
    gueltig = true
  } catch (e) {
    hinweis = (e as Error).message
  }
  return (
    <main className="zahlungsseite">
      <h2>Barzahlung</h2>
      <section className="zahlungszusammenfassung">
        <h3>Bestellung</h3>
        {bestand.positionen.map((p) => (
          <div className="zahlungsposition" key={p.id}>
            <span>
              {p.menge} ×{' '}
              {p.name === 'Apfelsaftschorle' ? 'Apfelschorle' : p.name}{' '}
              {p.einheit}
            </span>
            <strong>{geld(p.preis * p.menge)}</strong>
          </div>
        ))}
        <dl>
          <dt>Automatisches Pfand · {bestand.automatisch}×</dt>
          <dd>{geld(bestand.automatisch * bestand.pfand)}</dd>
          <dt>− Pfand · {bestand.vorhanden + bestand.rueckgaben}×</dt>
          <dd>
            {geld(-(bestand.vorhanden + bestand.rueckgaben) * bestand.pfand)}
          </dd>
        </dl>
      </section>
      <p className="gross">
        {geld(Math.abs(bestand.summe))}{' '}
        {bestand.summe < 0 ? 'auszahlen' : 'kassieren'}
      </p>
      {bestand.summe > 0 && (
        <div className="aktionen">
          <button onClick={() => waehlen(bestand.summe)}>Passend</button>
          {schnellbetraege.map((c) => (
            <button key={c} onClick={() => waehlen(c)}>
              {c / 100} €
            </button>
          ))}
          <button
            onClick={() => {
              waehlen('frei')
              if (eingabe.current?.parentElement)
                eingabe.current.parentElement.hidden = false
              eingabe.current?.focus()
            }}
          >
            Anderer Betrag
          </button>
          <label hidden={wahl !== 'frei'}>
            Erhaltenes Bargeld (€)
            <input
              ref={eingabe}
              type="text"
              inputMode="decimal"
              value={text}
              onChange={(e) => eingeben(e.target.value)}
            />
          </label>
        </div>
      )}
      <p
        role="status"
        className={gueltig && bestand.summe > 0 ? 'rueckgeld' : ''}
      >
        {hinweis}
      </p>
      <Fehler text={aktion.fehler} />
      <button disabled={aktion.beschaeftigt} onClick={zurueck}>
        Zur Bestellung
      </button>
      <button
        className="primaer"
        disabled={!gueltig || aktion.beschaeftigt}
        onClick={() => void aktion.ausfuehren(() => buchen(gegeben, id))}
      >
        Vorgang abschließen
      </button>
    </main>
  )
}
