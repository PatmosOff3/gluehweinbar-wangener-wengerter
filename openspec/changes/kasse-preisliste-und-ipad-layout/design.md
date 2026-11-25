# Design

## Context

Siehe [Vorschlag](proposal.md) für Anlass und Umfang. Die React-Kasse liest Artikel live aus IndexedDB. `einheit` ist bereits ein String, darf im Produktformular leer bleiben und wird von der Sicherungsvalidierung als leerer String akzeptiert. Eine Datenmodelländerung auf `undefined` ist daher unnötig.

Die heutige Oberfläche hat getrennte Header- und Navigationszeilen, großzügige Abschnittsabstände und eine fixierte Summenleiste mit zusätzlichem Body-Abstand. Die Bestellpositionen besitzen keinen eigenen Scrollbereich. Die Screenshots sind 1105 × 768 Pixel groß; unter den etwa 80 Pixel hohen Safari-Leisten verbleiben ungefähr 1105 × 688 Pixel für die Website. Zusätzlich wird mit 604 Pixeln verfügbarer Höhe geprüft, damit das Layout auch bei weniger Platz funktioniert.

Das Standardsortiment wird nur bei der Einrichtung erzeugt. Neue Veranstaltungen kopieren das Sortiment ihrer Vorgängerveranstaltung. Eine Änderung der Vorgabedatei allein erreicht daher vorhandene Geräte nicht. Historische Buchungen enthalten vollständige Artikelschnappschüsse. Die vorhandene Buchungslogik weist einen inzwischen veränderten Zahlungsentwurf bereits zurück.

## Goals / Non-Goals

**Goals:** Die UI nutzt die verfügbare Höhe und erhält bestehende Buchungslogik, Artikelidentitäten und Offline-Fähigkeit. Die Preisumstellung ist atomar, wiederholbar und auch nach Wiederherstellung nachvollziehbar.

**Non-Goals:** Keine Umgestaltung der bereits zusammengeführten Minus-Pfand-Funktion, kein neues Rechtekonzept, kein Kundenbildschirm und keine Veröffentlichung. Smartphone, Einrichtung und Verwaltung behalten bei Bedarf Dokument-Scrolling; die feste Höhe gilt für die Kassenansicht im Tablet-Querformat. Die Zahlungsseite erhält die vereinbarte Betragsdarstellung; ihre lange Zusammenfassung ist nicht die Positionsliste der Kassenansicht.

## Decisions

### 1. Finale Vorgaben und einmalige Datenumstellung trennen

Die Standardvorgaben enthalten elf Artikel. Beide Tresterbrände werden getrennt gezählt; Wein bleibt nach Größe zusammengefasst. Leere Glühweineinheiten werden als `''` gespeichert. Die Einrichtung schlägt 5 € Pfand vor, lässt aber die vorhandene Bearbeitungsmöglichkeit bestehen.

Eine Anwendungsfunktion stellt ausschließlich die aktive Veranstaltung vor Freigabe der Kasse um. Sie aktualisiert bekannte Produkte anhand der bisherigen Standardnamen und Einheiten; für Apfelschorle werden beide bisherigen Namensformen berücksichtigt. Gefundene IDs und Verfügbarkeiten bleiben erhalten, Apfelschorle wird deaktiviert. Fehlende finale Artikel werden ergänzt, selbst angelegte fremde Artikel bleiben bestehen. Die gemeinsame Preisgruppe der Glühweine wird erhalten beziehungsweise ergänzt.

Ein optionaler Sortimentsstand `weihnachtsmarkt-2026-final` in den Veranstaltungseinstellungen verhindert erneutes Überschreiben. Umstellung und Marker werden in derselben IndexedDB-Transaktion geschrieben. Neue Einrichtungen erhalten den Marker direkt, Veranstaltungswechsel kopieren ihn mit den Einstellungen. Ein Fehler zeigt einen verständlichen Fehlerzustand und lässt keine teilweise umgestellte Kasse zu.

Alternative: Vorgaben bei jedem Start erzwingen. Verworfen, weil das spätere Preis- und Pfandänderungen im Admin-Bereich vernichten würde. Ein reines Datenbankversions-Upgrade genügt ebenfalls nicht, weil später importierte alte Sicherungen auch umgestellt werden müssen.

### 2. Sicherungen erhalten den Sortimentsstand

Der optionale Marker wird in der Sicherungsvalidierung explizit berücksichtigt und beim Export und Import erhalten. Die bestehenden Sicherungsformate 1 und 2 bleiben lesbar. Fehlender Marker bedeutet eine noch ausstehende Umstellung ausschließlich der aktiven Veranstaltung; abgeschlossene Veranstaltungen werden nicht angefasst. Das bestehende Format kann um ein optionales Feld ergänzt werden, ohne Pflichtfelder oder historische Buchungen zu verändern.

### 3. Präsentation der Produktpriorität

Die UI ordnet erkannte aktive Glühwein- und Bierartikel vor den übrigen Artikeln ein; deren bestehende Reihenfolge bleibt stabil. Eine eigene erste Reihe mit drei gleich breiten größeren Tasten macht die Priorität unabhängig vom automatischen Rest-Raster. Benannte CSS-Klassen bilden weinrot, goldgelb und die Hervorhebung ab; Produktname und Preis bleiben lesbar. Bei fehlender Einheit wird kein leeres Größenelement gerendert. Eine zusätzliche Produktklassifikation im Sicherungsformat ist für diesen Umfang unnötig.

### 4. Höhenaufteilung statt verdeckender Fixleiste

Im Tablet-Querformat bekommt die Kassenhülle die dynamische Viewport-Höhe mit `100dvh` und einem geeigneten Fallback. Kompakte Kopfzeile, eventuelle Statushinweise, Arbeitsbereich, Summenleiste und PWA-Status bilden gemeinsam das Höhenbudget. Die Summenleiste liegt dabei im Layout statt über den Inhalten. Die Kassenraster-Kinder erhalten `min-height: 0`; nur die Positionsliste erhält `overflow-y: auto`.

Bestellüberschrift, Summe, Pfandübersicht und Aktionen stehen außerhalb des Scrollbereichs. Produkte werden in einer großen ersten Reihe und einem kompakteren Rest-Raster dargestellt. Statusmeldungen und Updatehinweise dürfen keinen Überlauf verursachen; die vorhandene Updatesperre bei offener Bestellung bleibt erhalten. Unterhalb der Tablet-Breite bleibt das vorhandene vertikale Bedienmuster erreichbar.

Alternative: Nur Header und Schrift verkleinern. Verworfen, weil lange Bestellungen damit weiterhin die Seite verlängern und Aktionen überdecken würden.

### 5. Farben und lokal gespeicherter Modus

CSS-Variablen bündeln Hintergrund-, Oberflächen-, Text-, Rand-, Fokus- und Auszahlungsfarben. Ein Theme-Attribut an der Dokumentwurzel steuert sämtliche Ansichten. Eine lokale Browserpräferenz speichert Hell oder Dunkel; ohne Auswahl bleibt der bisherige helle Modus. Der beschriftete Schalter in der gemeinsamen Kopfzeile benötigt keine PIN und verändert keine Kassendaten. Bei blockiertem Präferenzspeicher funktioniert das Umschalten weiterhin für die laufende Sitzung.

Eine gemeinsame Auszahlungsdarstellung markiert negative Bestellsummen, negative Pfandabzüge und positives Rückgeld rot. Wortlaut beziehungsweise Vorzeichen bleiben zusätzlich bestehen. Der Hinweis zu fehlendem erhaltenem Bargeld wird bei negativer Summe nicht gerendert; die bestehende Gültigkeitsprüfung für Auszahlungen und Nullsummen bleibt erhalten.

## Risks / Trade-offs

- Namensbasierte Zuordnung individuell umbenannter Artikel kann mehrdeutig sein → Nur eindeutig erkannte Standardartikel ändern; unbekannte Artikel erhalten, finale fehlende Artikel ergänzen und keine historischen Positionen umschreiben.
- Benutzerdefinierte zusätzliche Produkte können mehr Platz als das Standardsortiment benötigen → Die Zusage ohne Seitenscrollen bezieht sich auf das finale Standardsortiment bei normaler Schriftgröße; die elf Standardtasten werden vollständig getestet.
- Safari-Leisten verändern die verfügbare Höhe → WebKit-Tests mit 1105 × 604 und 1024 × 600 Pixeln sowie größere Querformat-Viewports; ergänzende Realgeräteprüfung mit eingeblendeten Safari-Leisten.
- Rot und Gold können im Dunkelmodus unlesbar werden → Kontraste und Fokuszustände in beiden Modi prüfen, Farbe stets durch Text ergänzen.
- Die ursprünglichen Hauptspezifikationen wurden noch nicht veröffentlicht → Vor späterem Archivieren beide Changes inhaltlich zusammenführen; dieser Folgechange ist für die finale Preisliste maßgeblich. Keine automatische Archivierung im Rahmen der Umsetzung.

## Migration Plan

1. Finale Vorgaben und Marker-Verarbeitung einschließlich Import zuerst implementieren und mit einer alten Sicherung sowie historischen Buchungen prüfen.
2. Die Umstellung vor dem ersten neuen Verkauf ausführen; bei Fehlern keine teilweise aktualisierte Ansicht freigeben. Eine alte Sicherung wird vor dem nächsten Verkauf auf denselben finalen Stand gebracht.
3. UI, Layout und Theme ergänzen. Bestehende Referenzwerte in Tests und Anleitungen aktualisieren; eigene Tests für Historienwerte unverändert beibehalten.
4. Lint, Typprüfung, Unit-Tests, Build und relevante Browsermatrix ausführen. Screenshots beider Modi und einer langen Bestellung kontrollieren; Realgeräteprüfung gesondert kennzeichnen.
5. Ein Code-Rollback setzt bereits migrierte Preise nicht automatisch zurück. Bei notwendiger Datenrückkehr eine vor der Umstellung gesicherte Datei verwenden; ein altes App-Release darf erst nach gesonderter Kompatibilitätsprüfung eingesetzt werden.
