# Proposal

## Why

Am Stand sind Wein und Brand als Ausschank und als Flasche auf den ersten Blick schwer zu unterscheiden. Passende Barzahlungen erfordern eine zweite Bestätigung und die Abrechnung zeigt bisher nur Pfandbeträge.

## What Changes

- Alle Standardprodukte erhalten ein Symbol rechts neben dem Namen. Alkoholische Getränke tragen unten rechts „Alk.“.
- Die größere Zahlungstaste bleibt auf dem iPad sichtbar.
- „Passend“ bucht unmittelbar und bestätigt den Erfolg auf der leeren Kasse. Im Rückgelddialog rückt „Bargeld ändern“ über „Zurück zur Bestellung“.
- Die Veranstaltungsstatistik zeigt die Stückzahl der ausgegebenen und zurückgenommenen Pfandgefäße neben dem jeweiligen Betrag.

## Capabilities

### New Capabilities

### Modified Capabilities

- `kassenbetrieb` ergänzt die Anforderungen der offenen v1-Changes an Produktwahl und Barzahlung.
- `veranstaltungsabrechnung` ergänzt die Pfandstatistik um Gefäßzahlen.

## Impact

Betroffen sind die Kassenansicht, das Layout, die lokale Auswertung, die Bedienungsanleitung und die zugehörigen Tests. Der Change gehört zur Vergleichsbasis v1.
