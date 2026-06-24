# Market-Pulse
**Stand: 24. Juni 2026**

Ein elegantes, performantes Echtzeit-Dashboard für weltweite Aktien im modernen Dark-Design. Das Projekt fokussiert sich auf eine saubere, strukturierte Darstellung von echten Live-Marktdaten im gläsernen Look (Glassmorphism), die vollautomatisch in Euro (€) angezeigt werden.

## Features
* **Modernes UI:** Tiefdunkler Hintergrund mit gläsernen Elementen (Glassmorphism) und dynamischen Neon-Trendfarben.
* **Intelligentes Raster:** Vollkommen responsives Grid-Layout, das sich automatisch an Smartphones, Tablets und große Monitore anpasst.
* **Saubere Struktur:** Leicht erweiterbares HTML- und CSS-Gerüst ohne unnötigen Ballast.
* **Globale Live-Daten:** Abfrage von echten, weltweiten Börsenkursen direkt aus einer Finanzdatenbank über einen sicheren CORS-Proxy.
* **Automatische Euro-Konvertierung:** Das System fragt im Hintergrund den aktuellen Währungs-Wechselkurs ab und rechnet US-Dollar-Preise (oder andere Fremdwährungen) vollautomatisch und exakt in Euro (€) um.
* **Unbegrenzte Suche:** Über das optimierte Suchfeld kann jedes beliebige, offiziell existierende Aktienkürzel (z. B. AAPL, MSFT, SAP, BMW) gesucht werden. Die Kacheln werden sofort zur Laufzeit generiert.
* **Dynamische Farbanpassung:** Automatische Grün- oder Rotfärbung der Kacheln via JavaScript, je nachdem, ob der aktuelle Live-Kurs im Plus oder Minus steht.

## Technologien
* HTML5 (Semantische und sauber eingerückte Struktur)
* CSS3 (Flexbox, CSS-Grid, Glassmorphism-Effekte, Übergänge und optimierte Suchleiste)
* JavaScript (ES6+ async/await, Echtzeit-Währungsumrechnung, CORS-Proxy-Integration, dynamische DOM-Erstellung und Event-Listener)

## Installation & Start
1. Klone das Repository oder lade die Dateien herunter.
2. Öffne die `index.html` direkt in einem beliebigen Browser (eine aktive Internetverbindung wird für die Live-Kurse und den Wechselkurs benötigt).

## Hintergrund zum Projekt
Dieses Repository ist als reines Lernprojekt entstanden.