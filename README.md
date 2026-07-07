# Market-Pulse 📈

**Stand:** 07. Juli 2026

Ein elegantes, performantes Echtzeit-Dashboard für weltweite Aktien, Indizes und ETFs. Die Anwendung startet mit einer komplett leeren, minimalistischen Oberfläche und baut sich dynamisch auf, sobald Suchen getätigt werden. 

Mehrere eingegebene Werte werden automatisch in kompakten, platzsparenden Karten (Cards) nebeneinander dargestellt.

---

## ✨ Features

* **Clean-Start-Prinzip:** Keine voreingestellten Charts beim Laden der Seite. Das Dashboard bleibt völlig leer, bis eine gezielte Suche gestartet wird.
* **Automatische Namensauflösung:** Das Dashboard zieht sich die vollständigen Firmen- und Asset-Namen (z. B. *Microsoft Corporation* statt nur *MSFT*) live aus den API-Metadaten. Das offizielle Kürzel bleibt als dezenter Ticker daneben bestehen.
* **Kompakte Multi-Cards:** Suchst du nach mehreren Werten, ordnen sich diese automatisch in verkleinerten, eleganten Kacheln im responsiven Grid an.
* **Echtzeit-Daten:** Direkte Abfrage von Live-Marktdaten (inklusive automatischer Währungsumrechnung von USD/GBp in Euro).
* **Interaktive Sparklines:** Jede Karte enthält einen kompakten Mini-Chart, der sich visuell (Grün/Rot) an die Performance des gewählten Zeitraums anpasst.
* **Flexible Zeiträume:** Unabhängige Steuerung (1D, 1W, 1M, 1J) für jede einzelne Karte.
* **Lebendiger Hintergrund:** Ein dezenter, animierter Sternenhimmel-Effekt im Hintergrund sorgt für ein modernes FinTech-Ambiente.

---

## 🛠️ Technologie-Stack

* **Frontend:** Reines HTML5, CSS3 (Flexbox & Grid) und Vanilla JavaScript (ES6).
* **Daten-Quelle:** Yahoo Finance API (via CORS-Proxy).
* **Charts:** HTML5 Canvas API (vollkommen ohne schwere externe Chart-Bibliotheken).

---


## 🔍 Nutzung & Namens-Mapping

Du kannst direkt nach **Tickern** (z.B. `AAPL`, `MSFT`, `TSLA`) oder nach den **Namen** großer Unternehmen und ETFs suchen. Das integrierte Mapping in der `script.js` übersetzt gängige Begriffe automatisch:

* **Aktien:** Microsoft, Apple, Nvidia, Amazon, Google, Tesla, Mercedes, BMW, SAP, Allianz u.v.m.
* **ETFs & Krypto:** S&P 500, MSCI World, Nasdaq 100, DAX ETF, Bitcoin ETF, Gold ETF.