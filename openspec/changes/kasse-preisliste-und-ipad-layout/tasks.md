# Tasks

## 1. Finale Preisliste und sichere Übernahme

- [x] 1.1 Die elf finalen Standardartikel in `src/domain/sortiment.ts` sowie 5 € Pfandvorgabe in `src/ui/Einrichtung.tsx` hinterlegen; Standardartikel-, Preisgruppen- und Einrichtungstests prüfen Preise, Pfandpflichten, leere Glühweineinheiten und fehlende Apfelschorle.
- [x] 1.2 Den optionalen Sortimentsstand in den Veranstaltungseinstellungen und eine atomare, einmalige Umstellung der aktiven Veranstaltung implementieren; Datenbanktests prüfen aktualisierte Preise, erhaltene IDs und Verfügbarkeiten, neue Artikel, deaktivierte Apfelschorle, unveränderte Fremdartikel und keine Duplikate beim zweiten Aufruf.
- [x] 1.3 Den Umstellungsstand bei Einrichtung und Veranstaltungswechsel setzen beziehungsweise kopieren und die Umstellung vor Freigabe der Kasse ausführen; Integrationstests prüfen unveränderte historische Buchungen und abgeschlossene Veranstaltungen sowie erhaltene Admin-Anpassungen nach erneutem Start.
- [x] 1.4 Den optionalen Marker in Sicherungsvalidierung, Export und Wiederherstellung erhalten; Importtests mit alten Formaten und neuen Sicherungen prüfen die einmalige Umstellung alter Daten, Marker-Rundlauf und unveränderte Buchungsschnappschüsse.
- [x] 1.5 Preisabhängige vorhandene Unit- und Browsertests sowie `docs/bedienung.md` und `docs/einsatz.md` aktualisieren; die dokumentierten Beispielrechnungen mit 4 € Glühwein und 5 € Pfand stimmen mit Berechnung und CSV überein.

## 2. Hervorgehobene Produkttasten und optionale Einheiten

- [x] 2.1 Glühwein rot, Glühwein weiß und Bier als größere erste Reihe gestalten, Weinrot und Goldgelb für die Glühweine ergänzen und übrige Artikel stabil anordnen; Browserprüfungen bestätigen Reihenfolge, größere Fläche und korrektes Verhalten bei deaktiviertem Hauptartikel.
- [x] 2.2 Leere Einheiten in Produkttasten, Bestellung, Zahlungszusammenfassung, Einrichtungsvorschau und Verwaltung ohne leere Zeile oder zusätzliche Trennzeichen rendern; UI- und Exporttests prüfen Verkauf, CSV und Wiederherstellung eines Artikels ohne Einheit.

## 3. Theme und Auszahlungen

- [x] 3.1 Farbvariablen für beide Modi und einen direkt erreichbaren, beschrifteten Theme-Schalter ergänzen; UI-/Browsertests prüfen Bedienung ohne PIN, Persistenz, Umschalten bei offener Bestellung und Zahlung sowie Bedienbarkeit bei nicht verfügbarem Präferenzspeicher.
- [x] 3.2 Negative Bestellsummen, Pfandabzüge und positives Rückgeld in allen relevanten Kassenanzeigen rot darstellen und bei Auszahlungen den unnötigen Bargeldsatz entfernen; UI-/Browsertests prüfen Auszahlung ohne Bargeldeingabe, 9 € Zahlung mit 1 € Rückgeld, Nullsumme und beide Farbmodi.
- [x] 3.3 Theme-Schalter und Farbbedeutung in `docs/bedienung.md` dokumentieren; Anleitung und tatsächliche Beschriftungen stimmen überein.

## 4. iPad-Layout und Scrollverhalten

- [x] 4.1 Kopfzeile zusammenführen und die Tablet-Kassenhülle anhand der dynamischen Viewport-Höhe mit integrierter Summenleiste aufteilen; WebKit-Prüfungen bei 1105 × 688, 1105 × 604 und 1024 × 600 Pixeln bestätigen alle elf Standardprodukte, Minus-Pfand und Zahlungsaktion ohne Dokumentüberlauf oder Überdeckung.
- [x] 4.2 Nur die Positionsliste innerhalb der offenen Bestellung scrollbar machen; Browserprüfungen mit allen Standardartikeln prüfen den tatsächlichen Scrollüberlauf der Liste und unveränderte Sichtbarkeit von Summe, Pfandübersicht, Bestellaktionen und Zahlungsleiste.
- [x] 4.3 PWA-Status und sichtbare Status-/Updatehinweise im Höhenbudget berücksichtigen und schmale Ansichten erhalten; Browserprüfungen bestätigen die Updatesperre bei offener Bestellung, Viewport-Höhenwechsel und horizontale Überlauffreiheit bei 320 Pixeln Breite.
- [x] 4.4 Die iPad-Prüfschritte für Safari-Leisten, lange Bestellung und beide Farbmodi in `docs/einsatz.md` ergänzen; automatisierte emulierte Prüfung und noch ausstehende Realgeräteprüfung sind nachvollziehbar getrennt.

## 5. Integrationsprüfung

- [x] 5.1 Lint, Typprüfung, Unit-Tests, Produktionsbuild und bestehende Browsermatrix ausführen; sämtliche Prüfungen bestehen und alte Sicherungsfixtures bleiben kompatibel.
- [x] 5.2 Screenshots im iPad-Querformat in beiden Modi mit leerer und überfüllter Bestellung visuell kontrollieren sowie Kontrast-/Zugänglichkeitsprüfung durchführen; es gibt keine abgeschnittenen Bedienelemente oder Überdeckungen und die Positionsliste bleibt bedienbar.
