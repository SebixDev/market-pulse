const apiKey = "sandbox_c8m90iaad3i9blo6b680";

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

async function fetchStockData(ticker) {
    try {
        const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker.toUpperCase()}&token=${apiKey}`);
        const data = await response.json();

        if (data && data.c !== 0) {
            const price = data.c;
            const changePercent = data.dp;

            document.getElementById(`price-${ticker}`).innerText = `$${price.toFixed(2)}`;
            
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
            if (priceElement) priceElement.innerText = "Kürzel unbekannt";
        }
    } catch (error) {
        console.error("Fehler:", error);
        const priceElement = document.getElementById(`price-${ticker}`);
        if (priceElement) priceElement.innerText = "Fehler";
    }
}

document.getElementById("search-button").addEventListener("click", () => {
    const input = document.getElementById("search-input").value.trim().toUpperCase();
    if (input) {
        createCardHTML(input);
        fetchStockData(input);
        document.getElementById("search-input").value = "";
    }
});

document.getElementById("search-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        document.getElementById("search-button").click();
    }
});

fetchStockData("AAPL");