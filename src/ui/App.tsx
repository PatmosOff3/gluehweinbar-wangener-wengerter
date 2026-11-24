import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Geraet } from '../storage/db'
import { pinPruefen } from '../application/pin'
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
  return (
    <>
      <header>
        <div className="marke">
          <span aria-hidden="true">W</span>
          <h1>Glühweinbar</h1>
        </div>
        <small>Wangener Wengerter</small>
      </header>
      <Fensterwarnung />
      {geraet === undefined ? (
        <main>Kasse wird geladen …</main>
      ) : geraet ? (
        <Betrieb key={geraet.pin.pruefwert} geraet={geraet} />
      ) : (
        <>
          <Einrichtung />
          <PwaStatus offen={false} />
        </>
      )}
    </>
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
  const [persistent, speichern] = useState<boolean>()
  const aktion = useAktion()
  useEffect(() => {
    void speicherPruefen(true).then(speichern)
  }, [ansicht === 'admin'])
  return (
    <>
      <nav aria-label="Kassenbereich">
        <strong>{event?.name}</strong>
        {ansicht === 'kasse' ? (
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
      </nav>
      {wechselHinweis && (
        <aside role="status">
          {wechselHinweis}{' '}
          <button onClick={() => hinweisen('')}>Verstanden</button>
        </aside>
      )}
      <div hidden={ansicht !== 'kasse'}>
        <Kasse
          key={geraet.activeEventId}
          eventId={geraet.activeEventId}
          offenMelden={bestellung}
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
