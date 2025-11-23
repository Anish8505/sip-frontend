const API_BASE_URL = "https://sip-calculator-api.onrender.com";

let lumpsumGrowthChart = null;
let lumpsumCompositionChart = null;

// Smooth reveal animation for result box
function showResultBox(box) {
    box.style.display = "block";
    box.classList.remove("show");
    // force reflow so animation retriggers
    void box.offsetWidth;
    box.classList.add("show");
}

// Build year-wise series for the line chart
function buildLumpsumYearlySeries(principal, annualRate, years) {
    const labels = [];
    const investedSeries = [];
    const maturitySeries = [];

    for (let y = 0; y <= years; y++) {
        labels.push(y === 0 ? "Year 0" : `Year ${y}`);

        if (y === 0) {
            investedSeries.push(0);
            maturitySeries.push(0);
        } else {
            const invested = principal; // one-time investment
            const fv = principal * Math.pow(1 + annualRate / 100, y);

            investedSeries.push(Math.round(invested));
            maturitySeries.push(Math.round(fv));
        }
    }

    return { labels, investedSeries, maturitySeries };
}

/* -------------------------------
   Line chart: growth over time
---------------------------------*/
function renderLumpsumGrowthChart(labels, investedSeries, maturitySeries) {
    const box = document.getElementById("lumpsumGrowthBox");
    const canvas = document.getElementById("lumpsumGrowthChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    box.style.display = "block";

    if (lumpsumGrowthChart) {
        lumpsumGrowthChart.destroy();
    }

    lumpsumGrowthChart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Invested Amount",
                    data: investedSeries,
                    borderWidth: 2,
                    tension: 0.25
                },
                {
                    label: "Estimated Value",
                    data: maturitySeries,
                    borderWidth: 2,
                    tension: 0.25
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "bottom" },
                tooltip: {
                    mode: "index",
                    intersect: false,
                    callbacks: {
                        label: (context) =>
                            `${context.dataset.label}: ₹${context.parsed.y.toLocaleString("en-IN")}`
                    }
                }
            },
            interaction: {
                mode: "index",
                intersect: false
            },
            scales: {
                y: {
                    ticks: {
                        callback: (v) => "₹" + v.toLocaleString("en-IN")
                    }
                }
            },
            animation: {
                duration: 800,
                easing: "easeOutQuart"
            }
        }
    });
}

/* -------------------------------
   Doughnut chart: invested vs profit
---------------------------------*/
function renderLumpsumCompositionChart(investedAmount, profit) {
    const box = document.getElementById("lumpsumCompositionBox");
    const canvas = document.getElementById("lumpsumCompositionChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    box.style.display = "block";

    if (lumpsumCompositionChart) {
        lumpsumCompositionChart.destroy();
    }

    lumpsumCompositionChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Invested Amount", "Profit"],
            datasets: [
                {
                    data: [investedAmount, profit],
                    borderWidth: 1,
                    backgroundColor: [
                        "rgba(59, 130, 246, 0.9)",   // blue
                        "rgba(249, 115, 129, 0.9)"   // pink/red
                    ],
                    hoverBackgroundColor: [
                        "rgba(37, 99, 235, 0.95)",
                        "rgba(239, 68, 68, 0.95)"
                    ]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "bottom" },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const value = context.parsed;
                            return `${context.label}: ₹${value.toLocaleString("en-IN")}`;
                        }
                    }
                }
            },
            cutout: "60%",
            animation: {
                duration: 700,
                easing: "easeOutBack"
            }
        }
    });
}

/* -------------------------------
   Main calculate function
---------------------------------*/
function calculateLumpsum() {
    const principal = Number(document.getElementById("lsPrincipal").value);
    const rate = Number(document.getElementById("lsRate").value);
    const years = Number(document.getElementById("lsYears").value);

    const errorDiv = document.getElementById("lsError");
    const resultBox = document.getElementById("lsResultBox");

    errorDiv.textContent = "";
    resultBox.style.display = "none";
    resultBox.classList.remove("show");
    resultBox.innerHTML = "";

    if (!principal || !rate || !years) {
        errorDiv.textContent = "Please fill all the fields.";
        return;
    }
    if (principal <= 0 || rate <= 0 || years <= 0) {
        errorDiv.textContent = "Values must be greater than zero.";
        return;
    }

    fetch(`${API_BASE_URL}/api/lumpsum?principal=${principal}&rate=${rate}&years=${years}`)
        .then(res => {
            if (!res.ok) {
                throw new Error("API error: " + res.status);
            }
            return res.json();
        })
        .then(data => {
            const invested = data.investedAmount;
            const maturity = data.maturityAmount;
            const profit = data.profit;

            // Text results (backend is source of truth)
            resultBox.innerHTML = `
                <h3>Lumpsum Results</h3>
                <p><strong>Invested Amount:</strong> ₹${invested.toLocaleString("en-IN")}</p>
                <p><strong>Maturity Amount:</strong> ₹${maturity.toLocaleString("en-IN")}</p>
                <p><strong>Total Profit:</strong> ₹${profit.toLocaleString("en-IN")}</p>
            `;
            showResultBox(resultBox);

            // Graph data (year-wise series from inputs)
            const { labels, investedSeries, maturitySeries } =
                buildLumpsumYearlySeries(principal, rate, years);

            renderLumpsumGrowthChart(labels, investedSeries, maturitySeries);
            renderLumpsumCompositionChart(invested, profit);
        })
        .catch(err => {
            console.error(err);
            errorDiv.textContent = "Something went wrong while calling the Lumpsum API.";
        });
}
