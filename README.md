# Market-Pulse
**Stand: 29. Juni 2026**

Ein elegantes, performantes Echtzeit-Dashboard für weltweite Aktien im modernen Dark-Design. Das Projekt fokussiert sich auf eine saubere, strukturierte Darstellung von echten Live-Marktdaten auf einer interaktiven Website im gläsernen Look (Glassmorphism), abgerundet durch umschaltbare Neon-Trend-Diagramme für verschiedene Zeiträume.

## Features
* **Flexible Zeitraum-Auswahl:** Jede Kachel verfügt über integrierte Steuerungsknöpfe (1D, 1W, 1M, 1J), um den historischen Zeitraum des Diagramms sofort anzupassen.
* **Dynamische Prozentberechnung:** Die angezeigte Prozentzahl kalkuliert sich vollautomatisch auf Basis des ausgewählten Zeitfensters (z. B. Kursgewinn über das gesamte letzte Jahr).
* **Integrierte Trend-Diagramme:** Jede Aktienkachel enthält ein elegantes Liniendiagramm (Sparkline) auf schwarzem Hintergrund. Die Kurve leuchtet via JavaScript-Glow-Effekt in sattem Neon-Grün bei Gewinnen oder Neon-Rot bei Verlusten im jeweiligen Zeitraum.
* **Modernes UI:** Tiefdunkler Hintergrund mit gläsernen Elementen (Glassmorphism) und dynamisch gefärbten Bedienelementen.
* **Intelligentes Raster:** Vollkommen responsives Grid-Layout, das sich automatisch an Smartphones, Tablets und große Monitore anpasst.
* **Globale Live-Daten:** Abfrage von echten, weltweiten Börsenkursen direkt über die v8-Chart-Schnittstelle mittels eines sicheren, kostenlosen CORS-Proxys.
* **Intelligente Eingabe-Übersetzung:** Die unbegrenzte Suche erlaubt sowohl offizielle Kürzel (z. B. AAPL, MSFT) als auch echte Namen (z. B. Microsoft, S&P 500, Allianz) in Groß- oder Kleinschreibung. Eine integrierte Datenbank übersetzt 50 der größten Werte vollautomatisch.
* **Automatische Euro-Konvertierung:** Die Website fragt im Hintergrund den aktuellen Währungs-Wechselkurs ab und rechnet US-Dollar-Preise (oder andere Fremdwährungen) vollautomatisch und exakt in Euro (€) um.

## Technologien
* HTML5 (Semantische Struktur, Kachel-Menüs und performante `<canvas>`-Elemente für die Diagramme)
* CSS3 (Flexbox, CSS-Grid, Zeitachsen-Styling, Glassmorphism-Effekte und sanfte Übergänge)
* JavaScript (ES6+ async/await, dynamische API-Parameter-Steuerung für Charts, HTML5-Canvas-Rendering, automatisches Ticker-Mapping und Echtzeit-Währungsumrechnung)

## Hintergrund zum Projekt
Dieses Repository ist als reines Lernprojekt entstanden.