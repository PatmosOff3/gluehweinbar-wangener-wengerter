import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  barzahlung,
  berechnen,
  euroEingabe,
  geld,
  schnellbetraege,
  type Bestand,
  type Produkt,
  type Buchung,
} from '../domain/kasse'
import { neueId, sortiment, verkaufen } from '../application/kasse'
import { kachelmerkmale } from '../domain/sortiment'
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
      db.transaction('r', [db.products, db.eventSettings, db.transactions], async () => ({
        produkte: await sortiment(db, eventId),
        pfand: (await db.eventSettings.get(eventId))?.pfand,
        buchungen: await db.transactions.where('eventId').equals(eventId).sortBy('nummer'),
      })),
    [eventId],
  )
  const [mengen, setzen] = useState<Record<string, number>>({})
  const [minus, minusSetzen] = useState(0)

  const [zahlung, bezahlen] = useState<Bestand>()
  const [rueckblick, letzteAnzeigen] = useState(false)
  const letzte = daten?.buchungen.filter((p) => p.art === 'verkauf').at(-1)
  const [meldung, melden] = useState('')
  const produkte = daten?.produkte.filter((p) => p.aktiv) ?? []
  const prioritaet = ['Glühwein rot', 'Glühwein weiß', 'Bier']
  const hauptprodukte = produkte
    .filter((p) => prioritaet.includes(p.name))
    .sort((a, b) => prioritaet.indexOf(a.name) - prioritaet.indexOf(b.name))
  const weitere = produkte.filter((p) => !prioritaet.includes(p.name))
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
    zahlungMelden?.(!!zahlung || rueckblick)
    return () => zahlungMelden?.(false)
  }, [zahlung, rueckblick, zahlungMelden])
  function menge(id: string, neu: number) {
    setzen((alt) => ({ ...alt, [id]: Math.max(0, neu) }))
    melden('')
  }
  if (daten?.pfand === undefined) return <main>Kasse wird geladen …</main>
  if (rueckblick && letzte)
    return <LetzteBestellung buchung={letzte} storniert={!!daten.buchungen.find((b) => b.storniertId === letzte.id)} zurueck={() => letzteAnzeigen(false)} />
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
  function produkttaste(p: Produkt) {
    const { symbol, alkohol } = kachelmerkmale(p)
    const farbe = p.name === 'Glühwein rot' ? ' gluehwein-rot'
      : p.name === 'Glühwein weiß' ? ' gluehwein-weiss' : ''
    return (
      <button
        key={p.id}
        className={'produkt' + (p.pflicht ? ' mit-pfand' : '') + farbe}
        onClick={() => menge(p.id, (mengen[p.id] ?? 0) + 1)}
      >
        <span className="produktname">
          {symbol && <span aria-hidden="true">{symbol}</span>}
          <strong>{p.name === 'Apfelsaftschorle' ? 'Apfelschorle' : p.name}</strong>
        </span>
        {p.einheit && <small>{p.einheit}</small>}
        <span className="produktzeile">
          <span>{geld(p.preis)}</span>
          {alkohol && <abbr title="Alkoholhaltig">Alk.</abbr>}
        </span>
      </button>
    )
  }
  return (
    <main className="kassenhaupt">
      <div className="kassenraster">
        <section className="sortiment">
          <h2>Sortiment</h2>
          {hauptprodukte.length > 0 && (
            <div className="hauptprodukte">{hauptprodukte.map(produkttaste)}</div>
          )}
          <div className="produkte">{weitere.map(produkttaste)}</div>
          <button
            className="minus-pfand"
            onClick={() => { minusSetzen((v) => v + 1); melden('') }}
          >
            − Pfand <span>− {geld(b.pfand)}</span>
          </button>
        </section>
        <section className="bestellung">
          <h2>Offene Bestellung</h2>
          <p className={'bestellsumme' + (b.summe < 0 ? ' auszahlung' : b.summe > 0 ? ' einnahme' : '')}>
            {b.summe < 0 ? '−' : '+'} {geld(Math.abs(b.summe))}
          </p>
          <Bestellpositionen>
            {!offen && <p>Noch keine Artikel oder Rückgaben.</p>}
            {b.positionen.map((p) => (
              <div className="position" key={p.id}>
                <strong>
                  {p.name === 'Apfelsaftschorle' ? 'Apfelschorle' : p.name}{' '}
                  {p.einheit && <small>{p.einheit}</small>}
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
          </Bestellpositionen>
          <dl>
            <dt>Automatisches Pfand · {b.automatisch}×</dt>
            <dd>{geld(b.automatisch * b.pfand)}</dd>
            <dt>− Pfand · {minus}×</dt>
            <dd className={minus > 0 ? 'auszahlung' : ''}>{geld(-minus * b.pfand)}</dd>
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
          <p role="status" className="buchungsmeldung">{meldung && <>
            <span aria-hidden="true" className="buchungshaken">✓</span>{' '}
            <span>{meldung}</span>
          </>}</p>
        </section>
      </div>
      <div className="summenleiste">
        <strong className={b.summe < 0 ? 'auszahlung' : b.summe > 0 ? 'einnahme' : ''}>
          {b.summe < 0 ? '−' : '+'} {geld(Math.abs(b.summe))}
        </strong>
        <div className="aktionen">
        <button disabled={!letzte} onClick={() => letzteAnzeigen(true)}>Zur letzten Bestellung</button>
        <button
          className="primaer zur-zahlung"
          disabled={!offen}
          onClick={() => bezahlen(b)}
        >
          Zur Zahlung
        </button>
        </div>
      </div>
    </main>
  )
}

function LetzteBestellung({ buchung, storniert, zurueck }: { buchung: Buchung; storniert: boolean; zurueck: () => void }) {
  return <main className="zahlungsseite">
    <h2>Letzte Bestellung · Vorgang {buchung.nummer}</h2>
    <p>{storniert ? 'Storniert' : 'Bereits abgeschlossen'} · {new Date(buchung.zeit).toLocaleString('de-DE')}</p>
    <section className="zahlungszusammenfassung">
      <h3>Bestellung</h3>
      {buchung.positionen.map((p) => <div className="zahlungsposition" key={p.id}><span>{p.menge} × {p.name} {p.einheit}</span><strong>{geld(p.menge * p.preis)}</strong></div>)}
      <dl>
        <dt>Automatisches Pfand · {buchung.automatisch}×</dt><dd>{geld(buchung.automatisch * buchung.pfand)}</dd>
        <dt>− Pfand · {buchung.vorhanden + buchung.rueckgaben}×</dt><dd className="auszahlung">{geld(-(buchung.vorhanden + buchung.rueckgaben) * buchung.pfand)}</dd>
        <dt>Erhaltenes Bargeld</dt><dd>{geld(buchung.gegeben)}</dd>
      </dl>
    </section>
    <p className={'gross ' + (buchung.summe < 0 ? 'auszahlung' : buchung.summe > 0 ? 'einnahme' : '')}>{buchung.summe < 0 ? '−' : '+'} {geld(Math.abs(buchung.summe))}</p>
    {buchung.summe > 0 && <p className="rueckgeld">{geld(buchung.rueckgeld)} Rückgeld</p>}
    <button className="primaer" onClick={zurueck}>Zurück zur Bestellung</button>
  </main>
}

function ZahlungsPopup({ children, schliessen, gesperrt }: { children: ReactNode; schliessen: () => void; gesperrt: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])
  return <dialog ref={dialog} className="zahlungs-popup" aria-labelledby="rueckgeld-titel" onCancel={(e) => {
    e.preventDefault()
    if (!gesperrt) schliessen()
  }}>{children}</dialog>
}

function Bestellpositionen({ children }: { children: ReactNode }) {
  const liste = useRef<HTMLDivElement>(null)
  const inhalt = useRef<HTMLDivElement>(null)
  const [richtung, setzen] = useState({ oben: false, unten: false })
  useEffect(() => {
    const element = liste.current
    const positionen = inhalt.current
    if (!element || !positionen) return
    const pruefen = () => {
      const oben = element.scrollTop > 1
      const unten = element.scrollHeight - element.clientHeight - element.scrollTop > 1
      setzen((alt) => alt.oben === oben && alt.unten === unten ? alt : { oben, unten })
    }
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(pruefen) : undefined
    observer?.observe(element)
    observer?.observe(positionen)
    element.addEventListener('scroll', pruefen, { passive: true })
    window.addEventListener('resize', pruefen)
    pruefen()
    return () => {
      observer?.disconnect()
      element.removeEventListener('scroll', pruefen)
      window.removeEventListener('resize', pruefen)
    }
  }, [])
  return (
    <div className="bestellbereich">
      <div ref={liste} className="bestellpositionen" tabIndex={0} role="region" aria-label="Bestellpositionen">
        <div ref={inhalt}>{children}</div>
      </div>
      <p className="scrollhinweis" style={{ visibility: richtung.oben || richtung.unten ? 'visible' : 'hidden' }}>
        {richtung.oben && '↑ ' }Weitere Artikel{richtung.unten && ' ↓'}
      </p>
    </div>
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
  const [popup, popupZeigen] = useState(false)
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
        : ''
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
          <dd className={bestand.vorhanden + bestand.rueckgaben > 0 ? 'auszahlung' : ''}>
            {geld(-(bestand.vorhanden + bestand.rueckgaben) * bestand.pfand)}
          </dd>
        </dl>
      </section>
      <p className={'gross' + (bestand.summe < 0 ? ' auszahlung' : bestand.summe > 0 ? ' einnahme' : '')}>
        {bestand.summe < 0 ? '−' : '+'} {geld(Math.abs(bestand.summe))}
      </p>
      {bestand.summe > 0 && (
        <div className="geldwahl" role="group" aria-label="Erhaltenes Bargeld auswählen">
          <button disabled={aktion.beschaeftigt} onClick={() => void aktion.ausfuehren(() => buchen(bestand.summe, id))}>Passend</button>
          {schnellbetraege.map((c) => (
            <button key={c} disabled={aktion.beschaeftigt} aria-pressed={wahl === c} onClick={() => { waehlen(c); popupZeigen(true) }}>
              {c / 100} €
            </button>
          ))}
          <button
            aria-pressed={wahl === 'frei'}
            disabled={aktion.beschaeftigt}
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
              disabled={aktion.beschaeftigt}
              type="text"
              inputMode="decimal"
              value={text}
              onChange={(e) => eingeben(e.target.value)}
            />
          </label>
        </div>
      )}
      {!popup && <p
        role="status"
        className={gueltig && bestand.summe > 0 ? 'rueckgeld' : ''}
      >
        {hinweis}
      </p>}
      {!popup && <Fehler text={aktion.fehler} />}
      <button disabled={aktion.beschaeftigt} onClick={zurueck}>
        Zur Bestellung
      </button>
      <button
        className="primaer"
        disabled={!gueltig || aktion.beschaeftigt}
        onClick={() => bestand.summe > 0 ? popupZeigen(true) : void aktion.ausfuehren(() => buchen(gegeben, id))}
      >
        {bestand.summe > 0 ? 'Rückgeld anzeigen' : 'Vorgang abschließen'}
      </button>
      {popup && <ZahlungsPopup schliessen={() => popupZeigen(false)} gesperrt={aktion.beschaeftigt}>
        <h2 id="rueckgeld-titel">{gueltig ? 'Rückgeld' : 'Bargeld prüfen'}</h2>
        <p className={gueltig ? 'rueckgeld' : 'fehler'} role="status">{hinweis}</p>
        <p>Erhalten: {geld(gegeben)} · Gesamt: {geld(bestand.summe)}</p>
        <Fehler text={aktion.fehler} />
        <button className="primaer popup-abschluss" autoFocus disabled={!gueltig || aktion.beschaeftigt} onClick={() => void aktion.ausfuehren(() => buchen(gegeben, id))}>Vorgang abschließen</button>
        <button className="popup-zurueck" disabled={aktion.beschaeftigt} onClick={() => popupZeigen(false)}>Bargeld ändern</button>
        <button className="popup-zurueck" disabled={aktion.beschaeftigt} onClick={zurueck}>Zurück zur Bestellung</button>
      </ZahlungsPopup>}
    </main>
  )
}
