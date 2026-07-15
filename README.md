# Market-Pulse 📈
 
**Stand: 15. Juli 2026**
 
Ein elegantes, performantes Echtzeit-Dashboard für weltweite Aktien, Indizes und ETFs. Die Anwendung startet mit einer minimalistischen, leeren Oberfläche und passt sich dynamisch an das Nutzerverhalten an. Mehrere eingegebene Werte ordnen sich vollautomatisch in einem modernen, platzsparenden Kachel-Grid an.
 
## ✨ Features
 
- **Dynamische Markt-Aura:** Das Dashboard analysiert die Gesamtentwicklung aller geladenen Assets im gewählten Intervall. Steht deine Watchlist unterm Strich im Plus, hüllt sich der Hintergrund in ein dezent pulsierendes Smaragdgrün und der Live-Punkt leuchtet auf. Überwiegen die Verluste, wechselt die Aura in ein edles Karmesinrot. Bei leerem Dashboard bleibt das Licht neutral.
- **Persistente Watchlist (LocalStorage):** Alle gesuchten Aktien und Indizes werden automatisch lokal im Browser gesichert. Beim Schließen oder Neuladen des Tabs bleibt die Übersicht vollständig erhalten – inklusive des jeweils ausgewählten Zeitraums pro Karte.
- **Clean-Start-Prinzip:** Keine voreingestellten Dummy-Charts. Das Dashboard bleibt beim allerersten Besuch vollkommen leer, bis eine gezielte Suche gestartet wird.
- **Dynamische Löschfunktion:** Jede Karte besitzt oben rechts ein dezentes Schließen-Symbol (`✕`), über das Assets sofort aus der Ansicht entfernt, aus dem LocalStorage gelöscht und vom automatischen Live-Update getrennt werden.
- **Automatische Namensauflösung:** Zieht vollständige Firmennamen (z. B. Microsoft Corporation) live aus den Metadaten der API. Das offizielle Börsenkürzel bleibt als kompakter Ticker daneben stehen.
- **Echtzeit-Daten & Währungsumrechnung:** Direkte Abfrage von Live-Marktdaten inklusive automatischer Währungsumrechnung von USD und GBp in Euro.
- **Optimierte Zeiträume:** Unabhängige Steuerung (1D, 1W, 3M, 1J) für jede Karte. Alle Zeiträume liefern lückenlose Liniencharts und exakte Prozentwerte.
- **Lebendiger Hintergrund:** Ein feiner, animierter Sternenhimmel-Effekt sorgt für ein modernes FinTech-Ambiente.
## 🛠️ Technologie-Stack
 
- **Frontend:** Reines HTML5, CSS3 (Flexbox & Grid, CSS Transitions) und Vanilla JavaScript (ES6)
- **Daten-Quelle:** Yahoo Finance API (via CORS-Proxy) & Open Exchange Rates API
- **Charts:** HTML5 Canvas API – vollkommen ohne externe Chart-Bibliotheken
## 🔍 Nutzung & Namens-Mapping
 
Suche direkt nach Tickern (z. B. `AAPL`, `MSFT`, `TSLA`) oder nach den Namen großer Unternehmen und ETFs. Das integrierte Mapping in der `script.js` übersetzt gängige Begriffe automatisch:
 
- **Aktien:** Microsoft, Apple, Nvidia, Amazon, Google, Tesla, Mercedes, BMW, SAP, Allianz u. v. m.
- **ETFs & Krypto:** S&P 500, MSCI World, Nasdaq 100, DAX ETF, Bitcoin ETF, Gold ETF

---
 
Privates Lernprojekt. Die Kursdaten stammen aus einer inoffiziellen Schnittstelle, sind teils verzögert und nicht für Anlageentscheidungen geeignet.

