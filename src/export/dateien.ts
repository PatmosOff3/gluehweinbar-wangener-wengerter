import { auswerten, dezimal } from '../domain/kasse'

export function csv(name: string, statistik: ReturnType<typeof auswerten>) {
  const zeilen: (string | number)[][] = [
    [
      'Veranstaltung',
      'Position',
      'Verkaufseinheit',
      'Stückzahl',
      'Betrag in Euro',
    ],
    ...statistik.artikel.map((p) => [
      name,
      p.name,
      p.einheit,
      p.menge,
      dezimal(p.umsatz),
    ]),
    [name, 'Warenumsatz', '', '', dezimal(statistik.ware)],
    [name, 'Eingenommenes Pfand', '', '', dezimal(statistik.eingenommen)],
    [name, 'Ausgezahltes Pfand', '', '', dezimal(statistik.ausgezahlt)],
  ]
  const feld = (wert: string | number) => {
    let s = String(wert)
    if (/^\s*[=+@-]/.test(s)) s = "'" + s
    return '"' + s.replaceAll('"', '""') + '"'
  }
  return (
    '\uFEFF' + zeilen.map((z) => z.map(feld).join(';')).join('\r\n') + '\r\n'
  )
}

export function herunterladen(name: string, inhalt: string, typ: string) {
  const url = URL.createObjectURL(new Blob([inhalt], { type: typ }))
  const link = document.createElement('a')
  link.href = url
  link.download = name.replace(/[<>:"/\\|?*]/g, '_')
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30000)
}
