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
  type Zahlungsart,
} from '../domain/kasse'
import { neueId, sortiment, verkaufen } from '../application/kasse'
import { kachelmerkmale } from '../domain/sortiment'
import { db } from '../storage/db'
import { Fehler, useAktion } from './formulare'

function produktfarbe(name: string) {
  if (name === 'Glühwein rot') return ' gluehwein-rot'
  if (name === 'Glühwein weiß') return ' gluehwein-weiss'
  return ''
}

function Produktsymbol({ produkt }: { produkt?: Produkt }) {
  if (!produkt) return null
  if (produkt.nurPfand) return <span className="glas-symbol" aria-hidden="true" />
  const { symbol } = kachelmerkmale(produkt)
  return symbol ? <span aria-hidden="true">{symbol}</span> : null
}

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
  const [gebucht, buchungBestaetigen] = useState(false)
  useEffect(() => {
    if (!gebucht) return
    const timer = window.setTimeout(() => {
      bezahlen(undefined)
      buchungBestaetigen(false)
    }, 800)
    return () => window.clearTimeout(timer)
  }, [gebucht])
  const produkte = daten?.produkte.filter((p) => p.aktiv) ?? []
  const prioritaet = ['Glühwein rot', 'Glühwein weiß', 'Bier']
  const hauptprodukte = produkte
    .filter((p) => prioritaet.includes(p.name))
    .sort((a, b) => prioritaet.indexOf(a.name) - prioritaet.indexOf(b.name))
  const weitere = produkte.filter((p) => !prioritaet.includes(p.name) && !p.nurPfand)
  const gefaess = produkte.find((p) => p.nurPfand)
  const zeilen = produkte
    .filter((p) => mengen[p.id] > 0)
    .map((artikel) => ({ artikel, menge: mengen[artikel.id] }))
  const getraenkeMitPfand = zeilen.reduce(
    (n, z) => n + (z.artikel.pflicht && !z.artikel.nurPfand ? z.menge : 0),
    0,
  )
  const b = berechnen(
    zeilen,
    daten?.pfand ?? 0,
    Math.min(minus, getraenkeMitPfand),
    Math.max(0, minus - getraenkeMitPfand),
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
        produkte={daten.produkte}
        bestand={zahlung}
        zurueck={() => bezahlen(undefined)}
        erfolgsmeldung={gebucht ? meldung : ''}
        buchen={async (gegeben, id, zahlungsart) => {
          const buchung = await verkaufen(db, eventId, id, zahlung, gegeben, zahlungsart)
          setzen({})
          minusSetzen(0)
          buchungBestaetigen(true)
          melden('Vorgang ' + buchung.nummer + ' gebucht.')
        }}
      />
    )
  function produkttaste(p: Produkt) {
    const { alkohol } = kachelmerkmale(p)
    return (
      <button
        key={p.id}
        className={'produkt' + (p.pflicht ? ' mit-pfand' : '') + produktfarbe(p.name)}
        onClick={() => menge(p.id, (mengen[p.id] ?? 0) + 1)}
      >
        <span className="produktname">
          <Produktsymbol produkt={p} />
          <strong>{p.name === 'Apfelsaftschorle' ? 'Apfelschorle' : p.name}</strong>
        </span>
        {p.einheit && <small>{p.einheit}</small>}
        <span className="produktzeile">
          <span>{geld(p.nurPfand ? b.pfand : p.preis)}{p.nurPfand && ' Pfand'}</span>
          {alkohol && <abbr title="Alkoholhaltig">ALK</abbr>}
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
          <div className="pfandtasten">
            {gefaess && produkttaste(gefaess)}
            <button
              className="minus-pfand"
              onClick={() => { minusSetzen((v) => v + 1); melden('') }}
            >
              − Pfand <span>− {geld(b.pfand)}</span>
            </button>
          </div>
        </section>
        <section aria-label="Offene Bestellung" className={'bestellung' + (offen ? ' bestellung-aktiv' : '')}>
          <p className={'bestellsumme' + (b.summe < 0 ? ' auszahlung' : b.summe > 0 ? ' einnahme' : '')}>
            {b.summe < 0 ? '−' : '+'} {geld(Math.abs(b.summe))}
          </p>
          <Bestellpositionen>
            {!offen && <p>Noch keine Artikel oder Rückgaben.</p>}
            {zeilen.map(({ artikel: p, menge: anzahl }) => (
              <div className={'position' + produktfarbe(p.name)} key={p.id}>
                <strong className="positionsmenge">{anzahl}×</strong>
                <div className="positionsartikel">
                  <strong><Produktsymbol produkt={p} />{' '}
                    {p.name === 'Apfelsaftschorle' ? 'Apfelschorle' : p.name}
                  </strong>
                  <small>{p.einheit && p.einheit + ' · '}{geld(p.nurPfand ? b.pfand : p.preis)}{p.nurPfand && ' Pfand'}</small>
                </div>
                <div className="aktionen">
                  {anzahl > 1 && <button
                    className="menge-verringern"
                    aria-label={p.name + ' verringern'}
                    onClick={() => menge(p.id, anzahl - 1)}
                  >
                    −
                  </button>}
                  <button
                    className="position-entfernen"
                    aria-label={p.name + ' entfernen'}
                    onClick={() => menge(p.id, 0)}
                  >
                    ×
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
    <h2 className="rueckblick-titel">Letzte Bestellung · Vorgang {buchung.nummer}</h2>
    <p>{storniert ? 'Storniert' : 'Bereits abgeschlossen'} · {new Date(buchung.zeit).toLocaleString('de-DE')}</p>
    <section className="zahlungszusammenfassung">
      <h3>Bestellung</h3>
      {buchung.positionen.map((p) => <div className="zahlungsposition" key={p.id}><span>{p.menge} × {p.name} {p.einheit}</span><strong>{geld(p.menge * (p.nurPfand ? p.pfandJeStueck : p.preis))}{p.nurPfand && ' Pfand'}</strong></div>)}
      <dl>
        <dt>Automatisches Pfand · {buchung.automatisch}×</dt><dd>{geld(buchung.automatisch * buchung.pfand)}</dd>
        <dt>− Pfand · {buchung.vorhanden + buchung.rueckgaben}×</dt><dd className="auszahlung">{geld(-(buchung.vorhanden + buchung.rueckgaben) * buchung.pfand)}</dd>
        {buchung.zahlungsart === 'paypal'
          ? <><dt>Per PayPal bezahlt</dt><dd>{geld(buchung.summe)}</dd></>
          : <><dt>Erhaltenes Bargeld</dt><dd>{geld(buchung.gegeben)}</dd></>}
      </dl>
    </section>
    <p className={'gross ' + (buchung.summe < 0 ? 'auszahlung' : buchung.summe > 0 ? 'einnahme' : '')}>{buchung.summe < 0 ? '−' : '+'} {geld(Math.abs(buchung.summe))}</p>
    {buchung.summe > 0 && buchung.zahlungsart !== 'paypal' && <p className="rueckgeld">{geld(buchung.rueckgeld)} Rückgeld</p>}
    <button className="primaer" onClick={zurueck}>Zurück zur Bestellung</button>
  </main>
}

function ZahlungsPopup({ children, titel, schliessen, gesperrt = false, klasse = '' }: {
  children: ReactNode
  titel: string
  schliessen?: () => void
  gesperrt?: boolean
  klasse?: string
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])
  return <dialog ref={dialog} className={'zahlungs-popup ' + klasse} aria-labelledby={titel} onCancel={(e) => {
    e.preventDefault()
    if (!gesperrt) schliessen?.()
  }}>{children}</dialog>
}

function Ziffernblock({ startwert, summe, abbrechen, uebernehmen }: {
  startwert: string
  summe: number
  abbrechen: () => void
  uebernehmen: (wert: string) => void
}) {
  const [wert, setzen] = useState(startwert)
  let gueltig = false
  let hinweis = ''
  if (wert) {
    try {
      const centFehlen = wert.endsWith(',')
      barzahlung(summe, euroEingabe(centFehlen ? wert + '0' : wert))
      gueltig = !centFehlen
    } catch (fehler) {
      hinweis = (fehler as Error).message
    }
  }
  function tippen(taste: string) {
    setzen((alt) => {
      if (taste === 'Backspace') return alt.slice(0, -1)
      const neu = (alt || (taste === ',' ? '0' : '')) + taste
      return /^\d+(?:,\d{0,2})?$/.test(neu) ? neu.replace(/^0+(?=\d)/, '') : alt
    })
  }
  return <ZahlungsPopup titel="ziffern-titel" klasse="ziffern-popup" schliessen={abbrechen}>
    <div onKeyDown={(e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (/^[0-9,.]$/.test(e.key) || e.key === 'Backspace') {
        e.preventDefault()
        tippen(e.key === '.' ? ',' : e.key)
      }
    }}>
      <h2 id="ziffern-titel">Erhaltenes Bargeld</h2>
      <div className="ziffern-betrag"><span>Fällig {geld(summe)}</span>
        <output aria-label="Eingegebener Betrag">{wert || '0'} €</output>
      </div>
      <div className="zifferntasten">
        {['1','2','3','4','5','6','7','8','9',',','0','Backspace'].map((taste) =>
          <button key={taste} aria-label={taste === 'Backspace' ? 'Letzte Stelle löschen' : undefined}
            onClick={() => tippen(taste)}>{taste === 'Backspace' ? '⌫' : taste}</button>
        )}
      </div>
      <p className="betragsmeldung" role="status">{hinweis}</p>
      <div className="aktionen">
        <button onClick={abbrechen}>Abbrechen</button>
        <button className="primaer" disabled={!gueltig} onClick={() => uebernehmen(wert)}>Rückgeld anzeigen</button>
      </div>
    </div>
  </ZahlungsPopup>
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
  produkte,
  zurueck,
  buchen,
  erfolgsmeldung,
}: {
  bestand: Bestand
  produkte: Produkt[]
  zurueck: () => void
  buchen: (gegeben: number, id: string, zahlungsart?: Zahlungsart) => Promise<void>
  erfolgsmeldung: string
}) {
  const [id] = useState(neueId)
  const [wahl, waehlen] = useState<number | 'frei' | undefined>()
  const [text, eingeben] = useState('')
  const [popup, popupZeigen] = useState<'ziffern' | 'rueckgeld' | 'paypal'>()
  const aktion = useAktion()
  const berechnetesPfand = bestand.eingenommen - bestand.ausgezahlt
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
      <h2 className="zahlungstitel">Barzahlung</h2>
      <section className="zahlungszusammenfassung">
        <h3>Bestellung</h3>
        {bestand.positionen.map((p) => (
          <div className={'zahlungsposition zahlungsartikel' + produktfarbe(p.name)} key={p.id}>
            <strong className="positionsmenge">{p.menge}×</strong>
            <span>
              <Produktsymbol produkt={produkte.find((artikel) => artikel.id === p.id)} />{' '}
              {p.name === 'Apfelsaftschorle' ? 'Apfelschorle' : p.name}{' '}
              {p.einheit}
            </span>
            <strong>{geld((p.nurPfand ? p.pfandJeStueck : p.preis) * p.menge)}{p.nurPfand && ' Pfand'}</strong>
          </div>
        ))}
        <dl>
          <dt>Automatisches Pfand · {bestand.automatisch}×</dt>
          <dd>{geld(bestand.automatisch * bestand.pfand)}</dd>
          <dt>− Pfand · {bestand.vorhanden + bestand.rueckgaben}×</dt>
          <dd className={bestand.vorhanden + bestand.rueckgaben > 0 ? 'auszahlung' : ''}>
            {geld(-(bestand.vorhanden + bestand.rueckgaben) * bestand.pfand)}
          </dd>
          <dt>Berechnetes Pfand</dt>
          <dd className={berechnetesPfand < 0 ? 'auszahlung' : ''}><strong>{geld(berechnetesPfand)}</strong></dd>
        </dl>
      </section>
      <p className={'gross' + (bestand.summe < 0 ? ' auszahlung' : bestand.summe > 0 ? ' einnahme' : '')}>
        {bestand.summe < 0 ? '−' : '+'} {geld(Math.abs(bestand.summe))}
      </p>
      {bestand.summe > 0 && (
        <div className="geldwahl" role="group" aria-label="Zahlung auswählen">
          <div className="geldscheine">
            {schnellbetraege.map((c) => (
              <button key={c} disabled={aktion.beschaeftigt} aria-pressed={wahl === c} onClick={() => { waehlen(c); popupZeigen('rueckgeld') }}>
                {c / 100} €
              </button>
            ))}
          </div>
          <div className="zahlungsoptionen">
            <button disabled={aktion.beschaeftigt || !!erfolgsmeldung} onClick={() => void aktion.ausfuehren(() => buchen(bestand.summe, id))}>Passend</button>
            <button
              aria-pressed={wahl === 'frei'}
              disabled={aktion.beschaeftigt}
              onClick={() => popupZeigen('ziffern')}
            >
              Anderer Betrag
            </button>
            <button disabled={aktion.beschaeftigt} onClick={() => popupZeigen('paypal')}>PayPal</button>
          </div>
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
        onClick={() => bestand.summe > 0 ? popupZeigen('rueckgeld') : void aktion.ausfuehren(() => buchen(gegeben, id))}
      >
        {bestand.summe > 0 ? 'Rückgeld anzeigen' : 'Vorgang abschließen'}
      </button>
      {erfolgsmeldung && <ZahlungsPopup titel="buchung-erfolg" klasse="erfolgs-popup">
        <span className="erfolgs-haken" aria-hidden="true">✓</span>
        <h2 id="buchung-erfolg">{erfolgsmeldung}</h2>
      </ZahlungsPopup>}
      {!erfolgsmeldung && popup === 'paypal' && <ZahlungsPopup titel="paypal-titel" schliessen={() => popupZeigen(undefined)} gesperrt={aktion.beschaeftigt}>
        <h2 id="paypal-titel">PayPal-Zahlung bestätigen</h2>
        <p>Sind die {geld(bestand.summe)} bei PayPal eingegangen?</p>
        <Fehler text={aktion.fehler} />
        <button className="primaer popup-abschluss" disabled={aktion.beschaeftigt} onClick={() => void aktion.ausfuehren(() => buchen(0, id, 'paypal'))}>Vorgang abschließen</button>
        <button disabled={aktion.beschaeftigt} onClick={() => popupZeigen(undefined)}>Abbrechen</button>
      </ZahlungsPopup>}
      {popup === 'ziffern' && <Ziffernblock startwert={text} summe={bestand.summe}
        abbrechen={() => popupZeigen(undefined)} uebernehmen={(wert) => {
          eingeben(wert)
          waehlen('frei')
          popupZeigen('rueckgeld')
        }} />}
      {!erfolgsmeldung && popup === 'rueckgeld' && <ZahlungsPopup titel="rueckgeld-titel" schliessen={() => popupZeigen(undefined)} gesperrt={aktion.beschaeftigt}>
        <h2 id="rueckgeld-titel">{gueltig ? 'Rückgeld' : 'Bargeld prüfen'}</h2>
        <p className={gueltig ? 'rueckgeld' : 'fehler'} role="status">{hinweis}</p>
        <p>Erhalten: {geld(gegeben)} · Gesamt: {geld(bestand.summe)}</p>
        <Fehler text={aktion.fehler} />
        <button className="primaer popup-abschluss" autoFocus disabled={!gueltig || aktion.beschaeftigt} onClick={() => void aktion.ausfuehren(() => buchen(gegeben, id))}>Vorgang abschließen</button>
        <button className="popup-zurueck" disabled={aktion.beschaeftigt} onClick={() => popupZeigen(wahl === 'frei' ? 'ziffern' : undefined)}>Bargeld ändern</button>
        <button className="popup-zurueck" disabled={aktion.beschaeftigt} onClick={zurueck}>Zurück zur Bestellung</button>
      </ZahlungsPopup>}
    </main>
  )
}
