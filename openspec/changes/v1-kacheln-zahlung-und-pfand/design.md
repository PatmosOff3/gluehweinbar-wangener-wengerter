# Design

## Context

Die Kasse liest Produkte aus IndexedDB. Alte Installationen und Sicherungen kennen weder Kachelsymbole noch Alkoholkennzeichen. Verkäufe enthalten bereits den Pfandsatz und die Gefäßzahlen zum Buchungszeitpunkt.

## Goals / Non-Goals

Der Ablauf nutzt die vorhandene transaktionale Buchung und die Auswertung pro Veranstaltung. Die CSV behält ihr bisheriges Format.

## Decisions

- Das Standardsortiment legt Symbol und Alkoholkennzeichen je Artikel fest. Bei Altdaten liefert die bekannte Kombination aus Name und Verkaufseinheit die Vorgaben. Im Produktformular lassen sich beide Angaben festlegen, damit auch eigene Artikel und umbenannte Getränke korrekt erscheinen. Sicherungen übernehmen die optionalen Angaben.
- Der exakte Betrag geht unmittelbar an die bestehende, gegen Mehrfachauslösung gesperrte Buchungsaktion. Erst nach erfolgreichem Speichern wechselt die Ansicht. Die Bestätigung nutzt die vorhandene Statusmeldung und berücksichtigt reduzierte Bewegung.
- Die Statistik summiert je Verkauf automatische Pfandmenge abzüglich mitgebrachter Gefäße sowie tatsächliche Rückgaben. Stornos verwenden denselben negativen Faktor wie die Beträge.

## Risks / Trade-offs

- Bei frei benannten Altartikeln lässt sich der Alkoholgehalt nicht zuverlässig aus dem Namen ableiten. Die Produktpflege ermöglicht eine ausdrückliche Zuordnung.
- Größere Tasten können den sichtbaren Bereich verdrängen. Die Layoutprüfungen decken die bisherigen Querformatgrößen und schmale Ansichten ab.
