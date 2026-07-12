let usdToEurRate = 0.92;
const trackedTickers = new Set();
const activeTimeframes = {};

const nameToTickerMap = {
    "MICROSOFT": "MSFT", "APPLE": "AAPL", "NVIDIA": "NVDA", "AMAZON": "AMZN",
    "ALPHABET": "GOOGL", "GOOGLE": "GOOGL", "META": "META", "FACEBOOK": "META",
    "BERKSHIRE HATHAWAY": "BRK-B", "ELI LILLY": "LLY", "TESLA": "TSLA",
    "BROADCOM": "AVGO", "JPMORGAN CHASE": "JPM", "JPMORGAN": "JPM",
    "WALMART": "WMT", "VISA": "V", "EXXONMOBIL": "XOM", "EXXON": "XOM",
    "MASTERCARD": "MA", "ASML": "ASML", "ORACLE": "ORCL", "NOVO NORDISK": "NVO",
    "HOME DEPOT": "HD", "PROCTER & GAMBLE": "PG", "PROCTER AND GAMBLE": "PG",
    "NETFLIX": "NFLX", "ADOBE": "ADBE", "COCA-COLA": "KO", "COCA COLA": "KO",
    "PEPSICO": "PEP", "PEPSI": "PEP", "SAP": "SAP", "SIEMENS": "SIE.DE",
    "ALLIANZ": "ALV.DE", "DEUTSCHE TELEKOM": "DTE.DE", "MERCEDES-BENZ": "MBG.DE",
    "MERCEDES BENZ": "MBG.DE", "MERCEDES": "MBG.DE", "BMW": "BMW.DE", "BASF": "BAS.DE",
    "S&P 500": "SPY", "SP500": "SPY", "CORE S&P 500": "IVV", "NASDAQ 100": "QQQ",
    "NASDAQ": "QQQ", "MSCI WORLD": "URTH", "VANGUARD FTSE ALL-WORLD": "VWRA.L",
    "FTSE ALL-WORLD": "VWRA.L", "BITCOIN ETF": "IBIT", "ISHARES BITCOIN": "IBIT",
    "GOLD ETF": "GLD", "ISHARES CORE DAX": "EXS1.DE", "DAX ETF": "EXS1.DE",
    "DIVIDENDEN ETF": "VYM", "VANGUARD HIGH DIVIDEND": "VYM"
};

async function fetchExchangeRate() {
    try {
        const response = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await response.json();
        if (data && data.rates && data.rates.EUR) {
            usdToEurRate = data.rates.EUR;
        }
    } catch (error) {
        console.error(error);
    }
}

function saveToLocalStorage() {
    const dataToSave = {
        tickers: Array.from(trackedTickers),
        timeframes: activeTimeframes
    };
    localStorage.setItem("marketPulseWatchlist", JSON.stringify(dataToSave));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem("marketPulseWatchlist");
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if (parsed.tickers && Array.isArray(parsed.tickers)) {
                parsed.tickers.forEach(ticker => {
                    trackedTickers.add(ticker);
                    const savedTf = (parsed.timeframes && parsed.timeframes[ticker]) ? parsed.timeframes[ticker] : "1d";
                    createCardHTML(ticker, savedTf);
                    fetchRealStockData(ticker);
                });
            }
        } catch (e) {
            console.error(e);
        }
    }
}

function drawSparkline(ticker, sparklineData, isPositive) {
    const canvas = document.getElementById(`chart-${ticker}`);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (sparklineData.length < 2) return;

    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min === 0 ? 1 : max - min;

    ctx.beginPath();
    for (let i = 0; i < sparklineData.length; i++) {
        const x = (i / (sparklineData.length - 1)) * canvas.width;
        const y = canvas.height - ((sparklineData[i] - min) / range) * canvas.height * 0.8 - canvas.height * 0.1;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.strokeStyle = isPositive ? "#22c55e" : "#ef4444";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = 4;
    ctx.shadowColor = isPositive ? "#22c55e" : "#ef4444";
    ctx.stroke();
    ctx.shadowBlur = 0; 
}

function createCardHTML(ticker, initialTf = "1d") {
    const grid = document.getElementById("market-grid");
    if (document.getElementById(`card-${ticker}`)) return;

    const card = document.createElement("div");
    card.className = "asset-card";
    card.id = `card-${ticker}`;
    card.innerHTML = `
        <div class="card-header">
            <span class="asset-name" id="name-${ticker}">${ticker}</span>
            <div class="header-right">
                <span class="asset-ticker">${ticker}</span>
                <button class="remove-btn" onclick="removeCard('${ticker}')">✕</button>
            </div>
        </div>
        <div class="timeframe-selector">
            <button class="tf-btn ${initialTf === '1d' ? 'active' : ''}" onclick="changeTimeframe('${ticker}', '1d', this)">1D</button>
            <button class="tf-btn ${initialTf === '5d' ? 'active' : ''}" onclick="changeTimeframe('${ticker}', '5d', this)">1W</button>
            <button class="tf-btn ${initialTf === '3m' ? 'active' : ''}" onclick="changeTimeframe('${ticker}', '3m', this)">3M</button>
            <button class="tf-btn ${initialTf === '1y' ? 'active' : ''}" onclick="changeTimeframe('${ticker}', '1y', this)">1J</button>
        </div>
        <div class="asset-price" id="price-${ticker}">Lade...</div>
        <div class="asset-change" id="change-${ticker}">--%</div>
        <div class="chart-container">
            <canvas id="chart-${ticker}" width="220" height="55"></canvas>
        </div>
    `;
    grid.appendChild(card);
    activeTimeframes[ticker] = initialTf;
}

function removeCard(ticker) {
    const card = document.getElementById(`card-${ticker}`);
    if (card) {
        card.remove();
    }
    trackedTickers.delete(ticker);
    delete activeTimeframes[ticker];
    saveToLocalStorage();
}

function changeTimeframe(ticker, range, buttonElement) {
    const container = buttonElement.parentElement;
    container.querySelectorAll('.tf-btn').forEach(btn => btn.classList.remove('active'));
    buttonElement.classList.add('active');
    
    activeTimeframes[ticker] = range;
    saveToLocalStorage();
    fetchRealStockData(ticker);
}

async function fetchRealStockData(ticker) {
    try {
        const proxyUrl = "https://corsproxy.io/?";
        const range = activeTimeframes[ticker] || "1d";
        
        let interval = "15m";
        if (range === "5d") interval = "30m";
        if (range === "3m") interval = "1d";
        if (range === "1y") interval = "1wk";

        const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=${range}&interval=${interval}`;
        
        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
        const data = await response.json();
        
        if (data && data.chart && data.chart.result && data.chart.result[0]) {
            const result = data.chart.result[0];
            const meta = result.meta;
            
            let rawPrice = meta.regularMarketPrice;
            const currency = meta.currency;
            const longName = meta.longName || ticker;

            if (currency === "USD") {
                rawPrice = rawPrice * usdToEurRate;
            } else if (currency === "GBp") {
                rawPrice = (rawPrice / 100) * usdToEurRate;
            }

            const nameEl = document.getElementById(`name-${ticker}`);
            if (nameEl) nameEl.innerText = longName;
            
            const priceEl = document.getElementById(`price-${ticker}`);
            if (priceEl) priceEl.innerText = `${rawPrice.toFixed(2)} €`;
            
            let rawChartData = result.indicators.quote[0].close || [];
            let chartData = rawChartData.filter(val => val !== null && val !== undefined && !isNaN(val));
            
            if (chartData.length >= 2) {
                let firstPrice = chartData[0];
                
                if (range === "1d" && result.meta.previousClose !== undefined) {
                    firstPrice = result.meta.previousClose;
                }

                const lastPrice = chartData[chartData.length - 1];
                const changePercent = ((lastPrice - firstPrice) / firstPrice) * 100;

                const changeElement = document.getElementById(`change-${ticker}`);
                const cardElement = document.getElementById(`card-${ticker}`);
                const isPositive = changePercent >= 0;

                if (changeElement && cardElement) {
                    if (isPositive) {
                        changeElement.innerText = `+${changePercent.toFixed(2)}%`;
                        cardElement.className = "asset-card green-trend";
                    } else {
                        changeElement.innerText = `${changePercent.toFixed(2)}%`;
                        cardElement.className = "asset-card red-trend";
                    }
                }

                drawSparkline(ticker, chartData, isPositive);
            } else {
                const changeElement = document.getElementById(`change-${ticker}`);
                if (changeElement) changeElement.innerText = "0.00%";
            }

        } else {
            const priceElement = document.getElementById(`price-${ticker}`);
            if (priceElement) priceElement.innerText = "Nicht gefunden";
        }
    } catch (error) {
        console.error(error);
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
        createCardHTML(ticker, "1d");
        fetchRealStockData(ticker);
        saveToLocalStorage();
        document.getElementById("search-input").value = "";
    }
});

document.getElementById("search-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        document.getElementById("search-button").click();
    }
});

function initStarfield() {
    const canvas = document.getElementById("starfield");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars = [];
    const numStars = 60;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5 + 0.5,
            alpha: Math.random(),
            speed: Math.random() * 0.015 + 0.005
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        stars.forEach(star => {
            star.alpha += star.speed;
            
            if (star.alpha > 1 || star.alpha < 0) {
                star.speed = -star.speed;
            }

            const safeAlpha = Math.max(0, Math.min(1, star.alpha));

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${safeAlpha})`;
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    animate();
}

async function init() {
    await fetchExchangeRate();
    initStarfield();
    loadFromLocalStorage();
    setInterval(updateAllTracks, 30000);
}

init();