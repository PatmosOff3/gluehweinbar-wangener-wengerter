import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  barzahlung,
  berechnen,
  euroEingabe,
  geld,
  schnellbetraege,
  type Bestand,
} from '../domain/kasse'
import {
  letzterVerkauf,
  neueId,
  sortiment,
  stornieren,
  verkaufen,
} from '../application/kasse'
import { db } from '../storage/db'
import { Fehler, useAktion } from './formulare'

export function Kasse({
  eventId,
  offenMelden,
}: {
  eventId: string
  offenMelden: (offen: boolean) => void
}) {
  const daten = useLiveQuery(
    () =>
      db.transaction(
        'r',
        [db.products, db.eventSettings, db.transactions],
        async () => ({
          produkte: await sortiment(db, eventId),
          pfand: (await db.eventSettings.get(eventId))?.pfand,
          letzter: await letzterVerkauf(db, eventId),
        }),
      ),
    [eventId],
  )
  const [mengen, setzen] = useState<Record<string, number>>({})
  const [vorhanden, neutralisieren] = useState(0)
  const [rueckgaben, zurueck] = useState(0)
  const [zahlung, bezahlen] = useState<Bestand>()
  const [storno, auswahl] = useState<{ id: string; nummer: number }>()
  const [meldung, melden] = useState('')
  const aktion = useAktion()
  const produkte = daten?.produkte.filter((p) => p.aktiv) ?? []
  const zeilen = produkte
    .filter((p) => mengen[p.id] > 0)
    .map((artikel) => ({ artikel, menge: mengen[artikel.id] }))
  const b = berechnen(zeilen, daten?.pfand ?? 0, vorhanden, rueckgaben)
  const offen = !!(b.positionen.length || rueckgaben || zahlung)
  useEffect(() => {
    offenMelden(offen)
    return () => offenMelden(false)
  }, [offen, offenMelden])
  useEffect(() => {
    if (vorhanden > b.automatisch) neutralisieren(b.automatisch)
  }, [vorhanden, b.automatisch])
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
          neutralisieren(0)
          zurueck(0)
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
                <strong>{p.name}</strong>
                <small>{p.einheit}</small>
                <span>{geld(p.preis)}</span>
              </button>
            ))}
          </div>
          <h3>Gefäße</h3>
          <div className="aktionen">
            <button
              disabled={b.vorhanden >= b.automatisch}
              onClick={() => neutralisieren((v) => v + 1)}
            >
              − Pfand / Gefäß vorhanden
            </button>
            <button onClick={() => zurueck((v) => v + 1)}>Pfandrückgabe</button>
          </div>
        </section>
        <section className="bestellung">
          <h2>Offene Bestellung</h2>
          {!offen && <p>Noch keine Artikel oder Rückgaben.</p>}
          {b.positionen.map((p) => (
            <div className="position" key={p.id}>
              <strong>
                {p.name} <small>{p.einheit}</small>
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
            <dt>Gefäß vorhanden · {b.vorhanden}×</dt>
            <dd>{geld(-b.vorhanden * b.pfand)}</dd>
            <dt>Pfandrückgaben · {b.rueckgaben}×</dt>
            <dd>{geld(-b.ausgezahlt)}</dd>
          </dl>
          {b.vorhanden > 0 && (
            <button onClick={() => neutralisieren((v) => v - 1)}>
              Gefäß vorhanden zurücknehmen
            </button>
          )}
          {rueckgaben > 0 && (
            <button onClick={() => zurueck((v) => v - 1)}>
              Eine Rückgabe entfernen
            </button>
          )}
          {daten.letzter && (
            <button onClick={() => auswahl(daten.letzter)}>
              Letzten Verkauf stornieren
            </button>
          )}
          {storno && (
            <div role="group" aria-label="Storno bestätigen">
              <p>Verkauf {storno.nummer} vollständig stornieren?</p>
              <button onClick={() => auswahl(undefined)}>Abbrechen</button>
              <button
                disabled={aktion.beschaeftigt}
                onClick={() =>
                  void aktion.ausfuehren(async () => {
                    await stornieren(db, eventId, storno.id)
                    auswahl(undefined)
                    melden('Verkauf storniert.')
                  })
                }
              >
                Storno bestätigen
              </button>
            </div>
          )}
          <Fehler text={aktion.fehler} />
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
    <main className="einrichtung">
      <h2>Barzahlung</h2>
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
          <button onClick={() => waehlen('frei')}>Anderer Betrag</button>
          {wahl === 'frei' && (
            <label>
              Erhaltenes Bargeld (€)
              <input
                inputMode="decimal"
                value={text}
                onChange={(e) => eingeben(e.target.value)}
              />
            </label>
          )}
        </div>
      )}
      <p role="status">{hinweis}</p>
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
