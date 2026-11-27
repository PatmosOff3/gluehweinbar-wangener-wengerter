# Design

## Context

In v1 erhält „Anderer Betrag“ den Fokus auf einem Textfeld mit Dezimaltastatur. Bei „Passend“ speichert der bestehende Buchungspfad den Verkauf, leert die Bestellung und zeigt erst dort das Häkchen. Die zwei Anforderungen „Erkennbare Produktkacheln“ und „Passendes Bargeld direkt buchen“ stammen aus dem noch nicht archivierten Change `v1-kacheln-zahlung-und-pfand`. Der neue Delta-Text schreibt diese Anforderungen fort.

## Goals / Non-Goals

Im Kassenbetrieb sollen Betrag, Menge und Produkt auf dem iPad mit einem Blick erkennbar sein. Die Änderungen betreffen die Bedienung und Darstellung. Fachliche Grundlage sind die bisherigen Preise, Pfandbeträge, Buchungen und Stornoregeln.

## Decisions

- „Sortiment kleiner“ bezieht sich im Entwurf auf die Überschrift. Für sie und den Kopf der letzten Bestellung ist die serifenlose Systemschrift des Geräts vorgesehen. Diese ist offline verfügbar. Die Produkttasten behalten ihre Touchflächen.
- Ein zugänglicher Bereichsname ersetzt die sichtbare Bestellüberschrift. Der Rahmen richtet sich nach erfassten Positionen und Pfandabzügen. Er reserviert im Leerzustand denselben Platz, damit die Liste beim ersten Tippen nicht springt.
- Für Glühwein erhält der Zeilenhintergrund die jeweilige Kachelfarbe mit ihrer passenden Textfarbe. Bei anderen Getränken wird das bereits auf der Taste verwendete Symbol übernommen. Eine gemeinsame Darstellungslogik berücksichtigt auch explizit gespeicherte alte Standardtassen und alte Artikel ohne Symbolfeld. Individuelle Symboländerungen bleiben erhalten.
- Der Zahlungsvorgang unterscheidet Speichern, Erfolg und Rückkehr. Für „Passend“ ist eine sichtbare Bestätigung von rund 0,8 Sekunden vorgesehen. Der Erfolg blendet sanft aus, die Kasse nimmt dann die nächste Bestellung an. Mehrfachtipps bleiben bis zum Wechsel gesperrt. Bei reduzierter Bewegung erscheint eine ruhige Bestätigung.
- Der Ziffernblock verwendet große Schaltflächen und eine reine Betragsanzeige. Vorgeschlagen ist die Euro-Eingabe mit explizitem Komma: 2 und 0 ergeben 20,00 €, 2 – Komma – 5 ergeben 2,50 €. Die Eingabe erlaubt höchstens zwei Nachkommastellen. Die vorhandene Betragsprüfung und Rückgeldberechnung verarbeiten die Eingabe. Eine externe Tastatur kann Ziffern, Komma, Rücktaste und Escape bedienen.

## Risks / Trade-offs

- Auf weinrotem Grund braucht das rote ALK-Zeichen eine kontrastierende Innenfläche. Beide Farbmodi und alle Standardkacheln werden geprüft.
- Größere Mengen können die gewonnene Höhe aufbrauchen. Die Abnahme vergleicht Listenhöhe und sichtbare vollständige Positionen bei gleicher Bestellung, gleichem Viewport und Farbmodus mit dem veröffentlichten v1-Stand.
- Die Browseremulation prüft Dialog, Fokus und Überlauf. Ob die iPad-Systemtastatur tatsächlich geschlossen bleibt, wird zusätzlich auf einem echten iPad geprüft.

## Bestätigte Bedienentscheidungen

Bestätigt sind die Euro-Eingabe mit Komma, die kleinere Überschrift „Sortiment“ und die Bestätigungsdauer von rund 0,8 Sekunden.
