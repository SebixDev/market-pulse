const TIMEFRAMES = {
    "1d":  { label: "1D", interval: "15m" },
    "5d":  { label: "1W", interval: "30m" },
    "3mo": { label: "3M", interval: "1d"  },
    "1y":  { label: "1J", interval: "1wk" }
};

const DEFAULT_TIMEFRAME   = "1d";
const STORAGE_KEY         = "marketPulseWatchlist";
const REFRESH_INTERVAL_MS = 30_000;
const TICKER_PATTERN      = /^[A-Z0-9.\-^]{1,12}$/;
const PROXY_URL           = "https://corsproxy.io/?";
const AURA_THRESHOLD      = 0.05;
const LEGACY_TIMEFRAMES   = { "3m": "3mo", "1w": "5d", "1j": "1y" };

const TREND_COLORS = {
    positive: { line: "#22c55e", rgb: "34, 197, 94" },
    negative: { line: "#ef4444", rgb: "239, 68, 68" }
};

const rates              = { EUR: 0.92, GBP: 0.79 };
const trackedTickers     = new Set();
const activeTimeframes   = {};
const currentPercentages = {};
const lastQuotes         = {};
const requestCounters    = {};

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

async function fetchExchangeRates() {
    try {
        const response = await fetch("https://open.er-api.com/v6/latest/USD");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        if (data?.rates?.EUR) rates.EUR = data.rates.EUR;
        if (data?.rates?.GBP) rates.GBP = data.rates.GBP;
    } catch (error) {
        console.error("Wechselkurse nicht verfügbar, nutze Fallback-Werte:", error);
    }
}

function toEur(price, currency) {
    switch (currency) {
        case "EUR": return price;
        case "USD": return price * rates.EUR;
        case "GBP": return price * (rates.EUR / rates.GBP);
        case "GBp": return (price / 100) * (rates.EUR / rates.GBP);
        default:    return price;
    }
}

function buildChartUrl(ticker, range) {
    const interval = TIMEFRAMES[range].interval;
    const targetUrl =
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}` +
        `?range=${range}&interval=${interval}`;
    return PROXY_URL + encodeURIComponent(targetUrl);
}

async function fetchQuote(ticker, range) {
    const response = await fetch(buildChartUrl(ticker, range));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const result = data?.chart?.result?.[0];
    if (!result) throw new Error("Keine Daten für diesen Ticker");

    const meta = result.meta;
    const price = toEur(meta.regularMarketPrice, meta.currency);

    const chartData = (result.indicators?.quote?.[0]?.close ?? [])
        .filter(value => typeof value === "number" && !Number.isNaN(value));

    let changePercent = 0;
    if (chartData.length >= 2) {
        const firstPrice = (range === "1d" && typeof meta.previousClose === "number")
            ? meta.previousClose
            : chartData[0];
        const lastPrice = chartData[chartData.length - 1];
        if (firstPrice) {
            changePercent = ((lastPrice - firstPrice) / firstPrice) * 100;
        }
    }

    return {
        name: meta.longName || ticker,
        price,
        changePercent,
        chartData
    };
}

async function updateAsset(ticker) {
    const requestId = requestCounters[ticker] = (requestCounters[ticker] ?? 0) + 1;
    const range = activeTimeframes[ticker] ?? DEFAULT_TIMEFRAME;

    try {
        const quote = await fetchQuote(ticker, range);
        if (requestId !== requestCounters[ticker] || !trackedTickers.has(ticker)) return;
        renderCard(ticker, quote);
    } catch (error) {
        if (requestId !== requestCounters[ticker] || !trackedTickers.has(ticker)) return;
        console.error(`Fehler bei ${ticker}:`, error);
        renderError(ticker);
    }

    updateGlobalAura();
}

function updateAllTracks() {
    trackedTickers.forEach(updateAsset);
}

function renderCard(ticker, quote) {
    const card = document.getElementById(`card-${ticker}`);
    if (!card) return;

    const isPositive = quote.changePercent >= 0;
    currentPercentages[ticker] = quote.changePercent;
    lastQuotes[ticker] = quote;

    card.querySelector(".asset-name").textContent  = quote.name;
    card.querySelector(".asset-price").textContent = `${quote.price.toFixed(2)} €`;

    const sign = isPositive ? "+" : "";
    card.querySelector(".asset-change").textContent = `${sign}${quote.changePercent.toFixed(2)}%`;

    card.classList.toggle("green-trend", isPositive);
    card.classList.toggle("red-trend", !isPositive);

    drawSparkline(ticker, quote.chartData, isPositive);
}

function renderError(ticker) {
    const card = document.getElementById(`card-${ticker}`);
    if (!card) return;

    card.querySelector(".asset-price").textContent  = "Nicht verfügbar";
    card.querySelector(".asset-change").textContent = "--%";
    card.classList.remove("green-trend", "red-trend");
    delete currentPercentages[ticker];
    delete lastQuotes[ticker];
}

function redrawAllSparklines() {
    Object.entries(lastQuotes).forEach(([ticker, quote]) => {
        drawSparkline(ticker, quote.chartData, quote.changePercent >= 0);
    });
}

function calculatePoints(sparklineData, width, height) {
    const min   = Math.min(...sparklineData);
    const max   = Math.max(...sparklineData);
    const range = (max - min) || 1;

    const padding      = height * 0.1;
    const usableHeight = height - padding * 2;

    return sparklineData.map((value, i) => ({
        x: (i / (sparklineData.length - 1)) * width,
        y: height - padding - ((value - min) / range) * usableHeight
    }));
}

function fillUnderLine(ctx, points, height, rgb) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, `rgba(${rgb}, 0.28)`);
    gradient.addColorStop(1, `rgba(${rgb}, 0)`);

    ctx.beginPath();
    ctx.moveTo(points[0].x, height);
    points.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.lineTo(points[points.length - 1].x, height);
    ctx.closePath();

    ctx.fillStyle = gradient;
    ctx.fill();
}

function strokeLine(ctx, points, color) {
    ctx.beginPath();
    points.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
    });

    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.shadowBlur  = 4;
    ctx.shadowColor = color;
    ctx.stroke();
    ctx.shadowBlur  = 0;
}

function drawSparkline(ticker, sparklineData, isPositive) {
    const canvas = document.getElementById(`chart-${ticker}`);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr  = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    canvas.width  = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (sparklineData.length < 2) return;

    const points = calculatePoints(sparklineData, rect.width, rect.height);
    const colors = isPositive ? TREND_COLORS.positive : TREND_COLORS.negative;

    fillUnderLine(ctx, points, rect.height, colors.rgb);
    strokeLine(ctx, points, colors.line);
}

function setAura(state) {
    document.body.classList.remove("aura-positive", "aura-negative", "aura-neutral");
    document.body.classList.add(state);
}

function updateGlobalAura() {
    const values = Object.values(currentPercentages);
    if (values.length === 0) {
        setAura("aura-neutral");
        return;
    }

    const average = values.reduce((a, b) => a + b, 0) / values.length;

    if (average > AURA_THRESHOLD)       setAura("aura-positive");
    else if (average < -AURA_THRESHOLD) setAura("aura-negative");
    else                                setAura("aura-neutral");
}

function createCard(ticker, initialTf = DEFAULT_TIMEFRAME) {
    const grid = document.getElementById("market-grid");
    if (document.getElementById(`card-${ticker}`)) return;

    const timeframe = TIMEFRAMES[initialTf] ? initialTf : DEFAULT_TIMEFRAME;

    const card = document.createElement("div");
    card.className = "asset-card";
    card.id = `card-${ticker}`;

    const buttons = Object.entries(TIMEFRAMES).map(([range, config]) => `
        <button class="tf-btn ${range === timeframe ? "active" : ""}" data-range="${range}">
            ${config.label}
        </button>
    `).join("");

    card.innerHTML = `
        <div class="card-header">
            <span class="asset-name"></span>
            <div class="header-right">
                <span class="asset-ticker"></span>
                <button class="remove-btn" aria-label="Entfernen">✕</button>
            </div>
        </div>
        <div class="timeframe-selector">${buttons}</div>
        <div class="asset-price">Lade...</div>
        <div class="asset-change">--%</div>
        <div class="chart-container">
            <canvas id="chart-${ticker}"></canvas>
        </div>
    `;

    card.querySelector(".asset-name").textContent   = ticker;
    card.querySelector(".asset-ticker").textContent = ticker;

    card.querySelector(".remove-btn")
        .addEventListener("click", () => removeCard(ticker));

    card.querySelectorAll(".tf-btn").forEach(btn => {
        btn.addEventListener("click", () => changeTimeframe(ticker, btn.dataset.range, btn));
    });

    grid.appendChild(card);
    activeTimeframes[ticker] = timeframe;
}

function removeCard(ticker) {
    document.getElementById(`card-${ticker}`)?.remove();

    trackedTickers.delete(ticker);
    delete activeTimeframes[ticker];
    delete currentPercentages[ticker];
    delete lastQuotes[ticker];
    delete requestCounters[ticker];

    saveToLocalStorage();
    updateGlobalAura();
}

function changeTimeframe(ticker, range, buttonElement) {
    if (!TIMEFRAMES[range]) return;

    buttonElement.parentElement
        .querySelectorAll(".tf-btn")
        .forEach(btn => btn.classList.remove("active"));
    buttonElement.classList.add("active");

    activeTimeframes[ticker] = range;
    saveToLocalStorage();
    updateAsset(ticker);
}

function addTicker(input) {
    const cleanInput = input.trim().toUpperCase();
    if (!cleanInput) return false;

    const ticker = nameToTickerMap[cleanInput] ?? cleanInput;
    if (!TICKER_PATTERN.test(ticker)) return false;
    if (trackedTickers.has(ticker)) return false;

    trackedTickers.add(ticker);
    createCard(ticker, DEFAULT_TIMEFRAME);
    updateAsset(ticker);
    saveToLocalStorage();
    return true;
}

function saveToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            tickers: Array.from(trackedTickers),
            timeframes: activeTimeframes
        }));
    } catch (error) {
        console.error("Speichern fehlgeschlagen:", error);
    }
}

function normalizeTimeframe(value) {
    const migrated = LEGACY_TIMEFRAMES[value] ?? value;
    return TIMEFRAMES[migrated] ? migrated : DEFAULT_TIMEFRAME;
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return;

    try {
        const parsed = JSON.parse(savedData);
        if (!Array.isArray(parsed?.tickers)) return;

        parsed.tickers
            .filter(ticker => typeof ticker === "string" && TICKER_PATTERN.test(ticker))
            .forEach(ticker => {
                trackedTickers.add(ticker);
                createCard(ticker, normalizeTimeframe(parsed.timeframes?.[ticker]));
                updateAsset(ticker);
            });
    } catch (error) {
        console.error("Gespeicherte Watchlist konnte nicht gelesen werden:", error);
    }
}

function initStarfield() {
    const canvas = document.getElementById("starfield");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const NUM_STARS = 60;
    let stars = [];
    let animationId = null;

    function resizeCanvas() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createStars() {
        stars = Array.from({ length: NUM_STARS }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5 + 0.5,
            alpha: Math.random(),
            speed: Math.random() * 0.015 + 0.005
        }));
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        stars.forEach(star => {
            star.alpha += star.speed;
            if (star.alpha > 1 || star.alpha < 0) star.speed = -star.speed;

            const safeAlpha = Math.min(1, Math.max(0, star.alpha));
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${safeAlpha})`;
            ctx.fill();
        });

        animationId = requestAnimationFrame(animate);
    }

    function start() {
        if (animationId === null) animate();
    }

    function stop() {
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    resizeCanvas();
    createStars();
    start();

    window.addEventListener("resize", () => {
        resizeCanvas();
        createStars();
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) stop();
        else start();
    });
}

function initSearch() {
    const input  = document.getElementById("search-input");
    const button = document.getElementById("search-button");

    function submit() {
        if (addTicker(input.value)) input.value = "";
    }

    button.addEventListener("click", submit);
    input.addEventListener("keydown", event => {
        if (event.key === "Enter") submit();
    });
}

async function init() {
    initStarfield();
    initSearch();

    await fetchExchangeRates();
    loadFromLocalStorage();

    setInterval(updateAllTracks, REFRESH_INTERVAL_MS);

    let resizeTimer = null;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(redrawAllSparklines, 150);
    });
}

init();