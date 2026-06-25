let usdToEurRate = 0.92;
const trackedTickers = new Set();

const nameToTickerMap = {
    "MICROSOFT": "MSFT",
    "APPLE": "AAPL",
    "NVIDIA": "NVDA",
    "AMAZON": "AMZN",
    "ALPHABET": "GOOGL",
    "GOOGLE": "GOOGL",
    "META": "META",
    "FACEBOOK": "META",
    "BERKSHIRE HATHAWAY": "BRK-B",
    "ELI LILLY": "LLY",
    "TESLA": "TSLA",
    "BROADCOM": "AVGO",
    "JPMORGAN CHASE": "JPM",
    "JPMORGAN": "JPM",
    "WALMART": "WMT",
    "VISA": "V",
    "EXXONMOBIL": "XOM",
    "EXXON": "XOM",
    "MASTERCARD": "MA",
    "ASML": "ASML",
    "ORACLE": "ORCL",
    "NOVO NORDISK": "NVO",
    "HOME DEPOT": "HD",
    "PROCTER & GAMBLE": "PG",
    "PROCTER AND GAMBLE": "PG",
    "NETFLIX": "NFLX",
    "ADOBE": "ADBE",
    "COCA-COLA": "KO",
    "COCA COLA": "KO",
    "PEPSICO": "PEP",
    "PEPSI": "PEP",
    "SAP": "SAP",
    "SIEMENS": "SIE.DE",
    "ALLIANZ": "ALV.DE",
    "DEUTSCHE TELEKOM": "DTE.DE",
    "MERCEDES-BENZ": "MBG.DE",
    "MERCEDES BENZ": "MBG.DE",
    "MERCEDES": "MBG.DE",
    "BMW": "BMW.DE",
    "BASF": "BAS.DE",
    "S&P 500": "SPY",
    "SP500": "SPY",
    "CORE S&P 500": "IVV",
    "NASDAQ 100": "QQQ",
    "NASDAQ": "QQQ",
    "MSCI WORLD": "URTH",
    "VANGUARD FTSE ALL-WORLD": "VWRA.L",
    "FTSE ALL-WORLD": "VWRA.L",
    "BITCOIN ETF": "IBIT",
    "ISHARES BITCOIN": "IBIT",
    "GOLD ETF": "GLD",
    "ISHARES CORE DAX": "EXS1.DE",
    "DAX ETF": "EXS1.DE",
    "DIVIDENDEN ETF": "VYM",
    "VANGUARD HIGH DIVIDEND": "VYM"
};

async function fetchExchangeRate() {
    try {
        const response = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await response.json();
        if (data && data.rates && data.rates.EUR) {
            usdToEurRate = data.rates.EUR;
        }
    } catch (error) {
        console.error("Fehler beim Laden des Wechselkurses:", error);
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
    const rawInput = document.getElementById("search-input").value.trim();
    const cleanInput = rawInput.toUpperCase();
    
    if (cleanInput) {
        let ticker = cleanInput;

        if (nameToTickerMap[cleanInput]) {
            ticker = nameToTickerMap[cleanInput];
        }

        trackedTickers.add(ticker);
        createCardHTML(ticker);
        fetchRealStockData(ticker);
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
    createCardHTML("AAPL");
    fetchRealStockData("AAPL");
    
    setInterval(updateAllTracks, 30000);
}

init();