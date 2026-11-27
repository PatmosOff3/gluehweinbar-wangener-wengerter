import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../storage/db'
import {
  neueId,
  letzterVerkauf,
  pfandSetzen,
  produktSpeichern,
  sortiment,
  statistik,
  stornieren,
  umbenennen,
  wechseln,
} from '../application/kasse'
import { dezimal, euroEingabe, geld, type Produkt } from '../domain/kasse'
import { kachelmerkmale } from '../domain/sortiment'
import { csv, herunterladen } from '../export/dateien'
import { Sicherungen } from './Sicherungen'
import { Fehler, useAktion } from './formulare'

function ProduktForm({
  produkt,
  fertig,
}: {
  produkt: Produkt
  fertig: () => void
}) {
  const [p, setzen] = useState(() => ({ ...produkt, ...kachelmerkmale(produkt) }))
  const [preis, eingeben] = useState(dezimal(p.preis))
  const aktion = useAktion()
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void aktion.ausfuehren(async () => {
          await produktSpeichern(db, { ...p, preis: euroEingabe(preis) })
          fertig()
        })
      }}
    >
      <label>
        Bezeichnung
        <input
          value={p.name}
          required
          onChange={(e) => setzen({ ...p, name: e.target.value })}
        />
      </label>
      <label>
        Verkaufseinheit (optional)
        <input
          value={p.einheit}
          onChange={(e) => setzen({ ...p, einheit: e.target.value })}
        />
      </label>
      <label>
        Preis (€)
        <input
          value={preis}
          required
          inputMode="decimal"
          onChange={(e) => eingeben(e.target.value)}
        />
      </label>
      <label>
        Produktsymbol (optional)
        <input value={p.symbol} maxLength={16} onChange={(e) => setzen({ ...p, symbol: e.target.value })} />
      </label>
      <label className="check">
        <input type="checkbox" checked={p.alkohol} onChange={(e) => setzen({ ...p, alkohol: e.target.checked })} />
        Alkoholhaltig
      </label>
      {p.gruppe && (
        <p>Preis und Einheit gelten für roten und weißen Glühwein gemeinsam.</p>
      )}
      <label className="check">
        <input
          type="checkbox"
          checked={p.pflicht}
          onChange={(e) => setzen({ ...p, pflicht: e.target.checked })}
        />{' '}
        Pfandpflichtig
      </label>
      <Fehler text={aktion.fehler} />
      <button disabled={aktion.beschaeftigt}>Artikel speichern</button>
      <button type="button" onClick={fertig}>
        Abbrechen
      </button>
    </form>
  )
}

export function Verwaltung({ aktivId }: { aktivId: string }) {
  const [id, auswaehlen] = useState(aktivId)
  const [bearbeitung, bearbeiten] = useState<Produkt>()
  const [neu, starten] = useState('')
  const [bestaetigen, fragen] = useState(false)
  const [meldung, melden] = useState('')
  const [storno, auswahl] = useState<{ id: string; nummer: number }>()
  const aktion = useAktion()
  const daten = useLiveQuery(
    () =>
      db.transaction('r', db.tables, async () => ({
        events: (await db.events.toArray()).sort((a, b) =>
          b.start.localeCompare(a.start),
        ),
        artikel: await sortiment(db, id),
        pfand: (await db.eventSettings.get(id))?.pfand,
        statistik: await statistik(db, id),
        letzter: await letzterVerkauf(db, id),
      })),
    [id],
  )
  const event = daten?.events.find((e) => e.id === id)
  if (!daten || !event) return <main>Veranstaltung wird geladen …</main>
  const aktiv = event.status === 'active'
  const s = daten.statistik
  return (
    <main>
      <h2>Verwaltung</h2>
      <label>
        Veranstaltung auswählen
        <select
          value={id}
          onChange={(e) => {
            auswaehlen(e.target.value)
            bearbeiten(undefined)
            melden('')
          }}
        >
          {daten.events.map((ev) => (
            <option value={ev.id} key={ev.id}>
              {ev.name} ({ev.status === 'active' ? 'aktiv' : 'abgeschlossen'})
            </option>
          ))}
        </select>
      </label>
      <div className="adminraster">
        {aktiv && daten.letzter && (
          <section>
            <h3>Verkauf stornieren</h3>
            <button onClick={() => auswahl(daten.letzter)}>
              Letzten Verkauf stornieren
            </button>
            {storno && (
              <div role="group" aria-label="Storno bestätigen">
                <p>Verkauf {storno.nummer} vollständig stornieren?</p>
                <button onClick={() => auswahl(undefined)}>Abbrechen</button>
                <button
                  disabled={aktion.beschaeftigt}
                  onClick={() =>
                    void aktion.ausfuehren(async () => {
                      await stornieren(db, id, storno.id)
                      auswahl(undefined)
                      melden('Verkauf storniert.')
                    })
                  }
                >
                  Storno bestätigen
                </button>
              </div>
            )}
          </section>
        )}
        <section key={id}>
          <h3>Veranstaltungsname</h3>
          <form
            key={event.name}
            onSubmit={(e) => {
              e.preventDefault()
              const name = String(new FormData(e.currentTarget).get('name'))
              void aktion.ausfuehren(async () => {
                await umbenennen(db, id, name)
                melden('Name gespeichert.')
              })
            }}
          >
            <label>
              Name
              <input name="name" required defaultValue={event.name} />
            </label>
            <button>Namen speichern</button>
          </form>
          {aktiv && (
            <>
              <h3>Neue Veranstaltung starten</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  fragen(true)
                }}
              >
                <label>
                  Neuer Veranstaltungsname
                  <input
                    required
                    value={neu}
                    onChange={(e) => starten(e.target.value)}
                  />
                </label>
                <button>Neue Veranstaltung starten</button>
              </form>
              {bestaetigen && (
                <div>
                  <p>
                    „{event.name}“ abschließen und „{neu}“ mit leerer Kasse
                    starten?
                  </p>
                  <button onClick={() => fragen(false)}>Abbrechen</button>
                  <button
                    disabled={aktion.beschaeftigt}
                    onClick={() =>
                      void aktion.ausfuehren(async () => {
                        const folge = await wechseln(db, id, neu)
                        auswaehlen(folge)
                        fragen(false)
                        starten('')
                      })
                    }
                  >
                    Abschluss bestätigen
                  </button>
                </div>
              )}
            </>
          )}
        </section>
        <section>
          <h3>Statistik · {event.name}</h3>
          <table>
            <thead>
              <tr>
                <th>Artikel</th>
                <th>Stück</th>
                <th>Umsatz</th>
              </tr>
            </thead>
            <tbody>
              {s.artikel.map((p, i) => (
                <tr key={i}>
                  <td>
                    {p.name} {p.einheit}
                  </td>
                  <td>{p.menge}</td>
                  <td>{geld(p.umsatz)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl>
            <dt>Warenumsatz</dt>
            <dd>{geld(s.ware)}</dd>
            <dt>Eingenommenes Pfand</dt>
            <dd>{geld(s.eingenommen)} · {s.ausgegebeneGefaesse} Gläser/Tassen</dd>
            <dt>Ausgezahltes Pfand</dt>
            <dd className={s.ausgezahlt > 0 ? 'auszahlung' : ''}>{geld(s.ausgezahlt)} · {s.zurueckgenommeneGefaesse} Gläser/Tassen</dd>
          </dl>
          <h3>CSV-Abrechnung</h3>
          <p>
            Zusammenfassung dieser Veranstaltung auf diesem Gerät für die
            Tabellenkalkulation.
          </p>
          <button
            onClick={() =>
              herunterladen(
                event.name + '.csv',
                csv(event.name, s),
                'text/csv;charset=utf-8',
              )
            }
          >
            CSV herunterladen
          </button>
        </section>
        {aktiv && (
          <section>
            <h3>Sortiment und Pfand</h3>
            <form
              key={id + '-' + daten.pfand}
              onSubmit={(e) => {
                e.preventDefault()
                const wert = String(new FormData(e.currentTarget).get('pfand'))
                void aktion.ausfuehren(async () => {
                  await pfandSetzen(db, id, euroEingabe(wert))
                  melden('Pfand gespeichert.')
                })
              }}
            >
              <label>
                Globales Pfand (€)
                <input
                  name="pfand"
                  inputMode="decimal"
                  required
                  defaultValue={dezimal(daten.pfand ?? 0)}
                />
              </label>
              <button>Pfand speichern</button>
            </form>
            <ul className="artikelliste">
              {daten.artikel.map((p) => (
                <li key={p.id}>
                  <strong>
                    {p.name} {p.einheit}
                  </strong>{' '}
                  · {geld(p.preis)} · {p.aktiv ? 'Verfügbar' : 'Ausverkauft'}
                  <div>
                    <button onClick={() => bearbeiten(p)}>Bearbeiten</button>
                    <button
                      onClick={() =>
                        void aktion.ausfuehren(() =>
                          produktSpeichern(db, { ...p, aktiv: !p.aktiv }),
                        )
                      }
                    >
                      {p.aktiv ? 'Deaktivieren' : 'Reaktivieren'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={() =>
                bearbeiten({
                  id: neueId(),
                  eventId: id,
                  aktiv: true,
                  name: '',
                  preis: 0,
                  einheit: '',
                  pflicht: false,
                  sortierung: daten.artikel.length,
                })
              }
            >
              Artikel anlegen
            </button>
            {bearbeitung && (
              <ProduktForm
                key={bearbeitung.id}
                produkt={bearbeitung}
                fertig={() => bearbeiten(undefined)}
              />
            )}
          </section>
        )}
        <div>
          <Sicherungen />
        </div>
      </div>
      <p role="status">{meldung}</p>
      <Fehler text={aktion.fehler} />
    </main>
  )
}
