import { useState } from 'react'
import { sicherungLesen, sichern, wiederherstellen } from '../export/sicherung'
import { herunterladen } from '../export/dateien'
import { db } from '../storage/db'
import { Fehler, useAktion } from './formulare'

export function Wiederherstellung() {
  const [datei, setzen] = useState('')
  const aktion = useAktion()
  return (
    <section>
      <h3>Sicherung wiederherstellen</h3>
      <label>
        Sicherungsdatei auswählen
        <input
          type="file"
          accept=".json,application/json"
          disabled={aktion.beschaeftigt}
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            setzen('')
            if (file)
              void aktion.ausfuehren(async () => {
                const text = await file.text()
                sicherungLesen(text)
                setzen(text)
              })
          }}
        />
      </label>
      {datei && (
        <div role="group" aria-label="Wiederherstellung bestätigen">
          <p>
            Alle lokalen Veranstaltungen, Buchungen und die Admin-PIN durch
            diese Sicherung ersetzen?
          </p>
          <button disabled={aktion.beschaeftigt} onClick={() => setzen('')}>
            Abbrechen
          </button>
          <button
            disabled={aktion.beschaeftigt}
            onClick={() =>
              void aktion.ausfuehren(async () => {
                await wiederherstellen(db, datei, true)
                window.location.reload()
              })
            }
          >
            Gesamten Kassenstand ersetzen
          </button>
        </div>
      )}
      <Fehler text={aktion.fehler} />
    </section>
  )
}
export function Sicherungen() {
  const aktion = useAktion()
  return (
    <>
      <section>
        <h3>Vollständige Sicherung</h3>
        <p>
          Enthält alle Veranstaltungen dieses Geräts und den PIN-Prüfwert. Die
          wiederherstellbare JSON-Datei ist unverschlüsselt. Bitte vertraulich
          aufbewahren.
        </p>
        <button
          onClick={() =>
            void aktion.ausfuehren(async () => {
              herunterladen(
                'Kassensicherung-' +
                  new Date().toISOString().slice(0, 10) +
                  '.json',
                await sichern(db),
                'application/json',
              )
            })
          }
        >
          Sicherung herunterladen
        </button>
        <Fehler text={aktion.fehler} />
      </section>
      <Wiederherstellung />
    </>
  )
}
