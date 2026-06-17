const ticker = "AAPL";

async function fetchStockData() {
    try {
        const response = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}`);
        const data = await response.json();
        const result = data.quoteResponse.result[0];

        if (result) {
            const price = result.regularMarketPrice;
            const change = result.regularMarketChangePercent;

            document.getElementById(`price-${ticker}`).innerText = `$${price.toFixed(2)}`;
            
            const changeElement = document.getElementById(`change-${ticker}`);
            const cardElement = document.getElementById(`card-${ticker}`);

            if (change >= 0) {
                changeElement.innerText = `+${change.toFixed(2)}%`;
                cardElement.className = "asset-card green-trend";
            } else {
                changeElement.innerText = `${change.toFixed(2)}%`;
                cardElement.className = "asset-card red-trend";
            }
        }
    } catch (error) {
        console.error("Fehler beim Laden der Kursdaten:", error);
        document.getElementById(`price-${ticker}`).innerText = "Fehler";
    }
}

fetchStockData();
setInterval(fetchStockData, 30000);