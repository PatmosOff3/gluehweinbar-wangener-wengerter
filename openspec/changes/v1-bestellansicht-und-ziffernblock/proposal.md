# Proposal

## Why

Beim Kassieren auf dem iPad brauchen die Helfer Platz für Bestellpositionen und möchten Mengen und Getränke sofort erkennen. Die Systemtastatur verdeckt bei freier Bargeldeingabe einen Teil der Zahlungsansicht. Bei passender Zahlung erscheint die Rückmeldung bisher erst auf der nächsten Bestellung.

## What Changes

- Die Überschriften „Sortiment“ und „Letzte Bestellung · Vorgang …“ erhalten eine kleinere serifenlose Darstellung. Der Betrag rückt an die Spitze der offenen Bestellung.
- Ein Rahmen kennzeichnet eine begonnene Bestellung. Größere Mengenangaben, Glühweinfarben, Produktsymbole und mengenabhängige Korrekturtasten erleichtern die Kontrolle.
- Die Glühwein-Standardkacheln verlieren die Kaffeetasse. Alkoholhaltige Produkte tragen unten rechts ein rotes, kreisförmig umrandetes „ALK“.
- „Passend“ bestätigt die gespeicherte Buchung auf der Zahlungsseite und wechselt selbstständig zurück. „Anderer Betrag“ öffnet einen Ziffernblock der Kasse.

## Capabilities

### New Capabilities

### Modified Capabilities

- `kassenbetrieb` – Fortschreibung der v1-Anforderungen an Kacheln, Bestellansicht und Barzahlung.

## Impact

Betroffen sind die Kassenansicht, die Darstellung vorhandener Produktmerkmale, die Bedienungsanleitung und die zugehörigen Tests. Referenz für den Vergleich ist der veröffentlichte Git-Tag `v1` (Commit `2014e73`).
