# Spec Delta

## ADDED Requirements

### Requirement: Pfandgefäße in der Veranstaltungsstatistik
Die Admin-Statistik MUST neben eingenommenem und ausgezahltem Pfand die jeweilige Anzahl Gläser/Tassen der ausgewählten Veranstaltung zeigen. Maßgeblich sind gebuchte Gefäße und zugehörige Stornos.

#### Scenario: Eigene Tasse und Rückgabe
- **WHEN** bei fünf pfandpflichtigen Getränken eine mitgebrachte Tasse verwendet wird und später zwei Gefäße zurückgegeben werden
- **THEN** zeigt die Statistik bei 5 € Pfand vier Gläser/Tassen zu 20 € eingenommenem Pfand und zwei zu 10 € ausgezahltem Pfand

#### Scenario: Wechselnder Pfandpreis und Storno
- **WHEN** sich der Pfandpreis nach einem Verkauf ändert und eine Rückgabe storniert wird
- **THEN** bleiben die ursprünglich ausgegebenen Gefäße mit ihrem gebuchten Betrag erhalten und die stornierte Rückgabe trägt null zum Auszahlungsbetrag und zur Rückgabemenge bei
