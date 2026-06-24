let usdToEurRate = 0.92;
const trackedTickers = new Set();

async function fetchExchangeRate() {
    try {
        const response = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await response.json();
        if (data && data.rates && data.rates.EUR) {
            usdToEurRate = data.rates.EUR;
        }
    } catch (error) {
        console.error("Fehler beim Wechselkurs laden:", error);
    }
}

function createCardHTML(ticker) {
    const grid = document.getElementById("market-grid");
    if (document.getElementById(`card-${ticker}`)) return;

    const card = document.createElement("div");
    card.className = "asset-card";
    card.id = `card-${ticker}`;
    card.innerHTML = `
        <div class="card-header">
            <span class="asset-name" id="name-${ticker}">${ticker}</span>
            <span class="asset-ticker">${ticker}</span>
        </div>
        <div class="asset-price" id="price-${ticker}">Lade...</div>
        <div class="asset-change" id="change-${ticker}">--%</div>
    `;
    grid.appendChild(card);
}

async function fetchRealStockData(ticker) {
    try {
        const proxyUrl = "https://corsproxy.io/?";
        const targetUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}`;
        
        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
        const data = await response.json();
        
        if (data && data.quoteResponse && data.quoteResponse.result && data.quoteResponse.result[0]) {
            const stock = data.quoteResponse.result[0];
            
            let rawPrice = stock.regularMarketPrice;
            const changePercent = stock.regularMarketChangePercent;
            const companyName = stock.longName || stock.shortName || ticker;
            const currency = stock.currency;

            if (currency === "USD") {
                rawPrice = rawPrice * usdToEurRate;
            } else if (currency === "GBp") {
                rawPrice = (rawPrice / 100) * usdToEurRate;
            }

            document.getElementById(`name-${ticker}`).innerText = companyName;
            document.getElementById(`price-${ticker}`).innerText = `${rawPrice.toFixed(2)} €`;
            
            const changeElement = document.getElementById(`change-${ticker}`);
            const cardElement = document.getElementById(`card-${ticker}`);

            if (changePercent >= 0) {
                changeElement.innerText = `+${changePercent.toFixed(2)}%`;
                cardElement.className = "asset-card green-trend";
            } else {
                changeElement.innerText = `${changePercent.toFixed(2)}%`;
                cardElement.className = "asset-card red-trend";
            }
        } else {
            const priceElement = document.getElementById(`price-${ticker}`);
            if (priceElement) priceElement.innerText = "Nicht gefunden";
        }
    } catch (error) {
        console.error("Fehler:", error);
        const priceElement = document.getElementById(`price-${ticker}`);
        if (priceElement) priceElement.innerText = "Fehler";
    }
}

function updateAllTracks() {
    trackedTickers.forEach(ticker => {
        fetchRealStockData(ticker);
    });
}

document.getElementById("search-button").addEventListener("click", () => {
    const input = document.getElementById("search-input").value.trim().toUpperCase();
    if (input) {
        trackedTickers.add(input);
        createCardHTML(input);
        fetchRealStockData(input);
        document.getElementById("search-input").value = "";
    }
});

document.getElementById("search-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        document.getElementById("search-button").click();
    }
});

async function init() {
    await fetchExchangeRate();
    trackedTickers.add("AAPL");
    fetchRealStockData("AAPL");
    
    setInterval(updateAllTracks, 30000);
}

init();