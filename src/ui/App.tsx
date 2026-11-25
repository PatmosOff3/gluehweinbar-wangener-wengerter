import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Geraet } from '../storage/db'
import { pinPruefen } from '../application/pin'
import { finalePreisliste } from '../application/kasse'
import { Fensterwarnung, PwaStatus, speicherPruefen } from '../pwa/status'
import { Einrichtung } from './Einrichtung'
import { Verwaltung } from './Verwaltung'
import { Kasse } from './Kasse'
import { Fehler, useAktion } from './formulare'
import './stil.css'

export function App() {
  const geraet = useLiveQuery(
    async () => (await db.deviceSettings.get('geraet')) ?? null,
    [],
  )
  const [vorbereitet, bereit] = useState(false)
  const [fehler, fehlerSetzen] = useState('')
  useEffect(() => {
    let aktiv = true
    void finalePreisliste(db)
      .then(() => {
        if (aktiv) bereit(true)
      })
      .catch((e: Error) => {
        if (aktiv)
          fehlerSetzen('Die Preisliste konnte nicht vorbereitet werden: ' + e.message)
      })
    return () => {
      aktiv = false
    }
  }, [])
  return (
    <>
      <Fensterwarnung />
      {fehler ? (
        <>
          <Kopf />
          <main>
            <Fehler text={fehler} />
            <button onClick={() => window.location.reload()}>Erneut versuchen</button>
          </main>
        </>
      ) : !vorbereitet || geraet === undefined ? (
        <><Kopf /><main>Kasse wird geladen …</main></>
      ) : geraet ? (
        <Betrieb key={geraet.pin.pruefwert} geraet={geraet} />
      ) : (
        <>
          <Kopf />
          <Einrichtung />
          <PwaStatus offen={false} />
        </>
      )}
    </>
  )
}
function Kopf({ children }: { children?: ReactNode }) {
  const [dunkel, setzen] = useState(() => {
    try {
      return localStorage.getItem('gluehweinbar-theme') === 'dunkel'
    } catch {
      return false
    }
  })
  useEffect(() => {
    document.documentElement.dataset.theme = dunkel ? 'dunkel' : 'hell'
    try {
      localStorage.setItem('gluehweinbar-theme', dunkel ? 'dunkel' : 'hell')
    } catch {
      // Die Auswahl gilt bei gesperrtem Speicher weiterhin für diese Sitzung.
    }
  }, [dunkel])
  return (
    <header className="kopf">
      <div className="marke">
        <span aria-hidden="true">W</span>
        <h1>Glühweinbar</h1>
      </div>
      {children}
      <button
        className="theme-schalter"
        aria-pressed={dunkel}
        onClick={() => setzen(!dunkel)}
      >
        {dunkel ? 'Hellmodus' : 'Dunkelmodus'}
      </button>
    </header>
  )
}
function Betrieb({ geraet }: { geraet: Geraet }) {
  const event = useLiveQuery(
    () => db.events.get(geraet.activeEventId),
    [geraet.activeEventId],
  )
  const [ansicht, zeigen] = useState<'kasse' | 'pin' | 'admin'>('kasse')
  const [pin, tippen] = useState('')
  const zuletztAktiv = useRef(geraet.activeEventId)
  const [wechselHinweis, hinweisen] = useState('')
  useEffect(() => {
    if (zuletztAktiv.current !== geraet.activeEventId) {
      hinweisen(
        'Die vorherige Veranstaltung ist abgeschlossen. Die Kasse verwendet jetzt die neue Veranstaltung.',
      )
      zuletztAktiv.current = geraet.activeEventId
    }
  }, [geraet.activeEventId])
  const [offen, bestellung] = useState(false)
  const [zahlungsansicht, zahlungAnzeigen] = useState(false)
  const [persistent, speichern] = useState<boolean>()
  const aktion = useAktion()
  useEffect(() => {
    void speicherPruefen(true).then(speichern)
  }, [ansicht === 'admin'])
  return (
    <>
      <Kopf><nav aria-label="Kassenbereich">
        <strong>{event?.name}</strong>
        {ansicht === 'kasse' && zahlungsansicht ? null : ansicht === 'kasse' ? (
          <button onClick={() => zeigen('pin')}>Admin-Bereich</button>
        ) : (
          <button
            onClick={() => {
              tippen('')
              zeigen('kasse')
            }}
          >
            {ansicht === 'admin' ? 'Sperren und zur Kasse' : 'Zur Kasse'}
          </button>
        )}
      </nav></Kopf>
      {wechselHinweis && (
        <aside role="status">
          {wechselHinweis}{' '}
          <button onClick={() => hinweisen('')}>Verstanden</button>
        </aside>
      )}
      <div className="kassenansicht" hidden={ansicht !== 'kasse'}>
        <Kasse
          key={geraet.activeEventId}
          eventId={geraet.activeEventId}
          offenMelden={bestellung}
          zahlungMelden={zahlungAnzeigen}
        />
      </div>
      {ansicht === 'pin' && (
        <main className="einrichtung">
          <h2>Admin-Bereich öffnen</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void aktion.ausfuehren(async () => {
                if (!(await pinPruefen(pin, geraet.pin)))
                  throw new Error('Die Admin-PIN ist falsch.')
                tippen('')
                zeigen('admin')
              })
            }}
          >
            <label>
              Admin-PIN
              <input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                required
                value={pin}
                onChange={(e) => tippen(e.target.value)}
              />
            </label>
            <Fehler text={aktion.fehler} />
            <button disabled={aktion.beschaeftigt}>Entsperren</button>
          </form>
        </main>
      )}
      {ansicht === 'admin' && (
        <>
          <aside>
            Die Admin-PIN dient als lokaler Bedienungsschutz. Personen mit
            Gerätezugriff können Browserdaten und Sicherungen einsehen.
          </aside>
          {persistent === false && (
            <aside className="warnung">
              Dauerhafter Speicher ist nicht bestätigt. Browserdaten können
              verloren gehen. Vor dem Kassieren eine vollständige Sicherung
              erstellen.
            </aside>
          )}
          <Verwaltung aktivId={geraet.activeEventId} />
        </>
      )}
      <PwaStatus offen={offen} />
    </>
  )
}
