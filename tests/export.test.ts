import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { csv } from '../src/export/dateien'
import { sicherungLesen } from '../src/export/sicherung'

describe('Dateiformate', () => {
  it('liest das feste v1-Beispiel und ergänzt die Sortierung in der gespeicherten Reihenfolge', () => {
    const text = readFileSync(
      new URL('./fixtures/sicherung-v1.json', import.meta.url),
      'utf8',
    )
    expect(
      sicherungLesen(text).products.map((p) => [p.name, p.sortierung]),
    ).toEqual([
      ['Bier', 0],
      ['Wein', 1],
    ])
  })
  it('liefert BOM und lesbare deutsche Felder auch bei Anführungszeichen, Umlauten und Zeilenumbruch', () => {
    const name = 'Frühlingsfest; "Süd"'
    const artikel = 'Wein\nweiß'
    const s = csv(name, {
      artikel: [{ name: artikel, einheit: '0,2 l', menge: 1, umsatz: 350 }],
      eingenommen: 200,
      ausgezahlt: 0,
      ware: 350,
    })
    expect(s.charCodeAt(0)).toBe(0xfeff)
    const felder: string[][] = []
    let zeile: string[] = []
    for (const feld of s.slice(1).matchAll(/"((?:[^"]|"")*)"([;]|\r\n)/g)) {
      zeile.push(feld[1].replaceAll('""', '"'))
      if (feld[2] === '\r\n') {
        felder.push(zeile)
        zeile = []
      }
    }
    expect(felder[1]).toEqual([name, artikel, '0,2 l', '1', '3,50'])
    expect(felder[3]).toEqual([name, 'Eingenommenes Pfand', '', '', '2,00'])
  })
})
