// Use your backend
const API_BASE_URL = "https://sip-calculator-api.onrender.com";

let sipGrowthChart = null;
let sipCompositionChart = null;

// Smoothly reveal result box
function showResultBox(box) {
    box.style.display = "block";
    box.classList.remove("show");
    void box.offsetWidth; // force reflow
    box.classList.add("show");
}

// Helper: compute year-wise SIP growth from inputs
function buildSipYearlySeries(monthly, annualRate, years) {
    const r = annualRate / 12 / 100; // monthly rate
    const labels = [];
    const investedSeries = [];
    const maturitySeries = [];

    // year 0 (before investing)
    labels.push("Year 0");
    investedSeries.push(0);
    maturitySeries.push(0);

    for (let y = 1; y <= years; y++) {
        const n = y * 12; // months
        const invested = monthly * n;

        // SIP future value formula
        const fv = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);

        labels.push(`Year ${y}`);
        investedSeries.push(Math.round(invested));
        maturitySeries.push(Math.round(fv));
    }

    return { labels, investedSeries, maturitySeries };
}

// Graph 1: line chart (growth over time)
function renderSipGrowthChart(labels, investedSeries, maturitySeries) {
    const box = document.getElementById("sipChartBox");
    const canvas = document.getElementById("sipChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    box.style.display = "block";

    if (sipGrowthChart) {
        sipGrowthChart.destroy();
    }

    sipGrowthChart = new Chart(ctx, {
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
                tooltip: { mode: "index", intersect: false }
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

// Graph 2: doughnut (invested vs profit)
function renderSipCompositionChart(investedAmount, profit) {
    const box = document.getElementById("sipCompositionBox");
    const canvas = document.getElementById("sipCompositionChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    box.style.display = "block";

    if (sipCompositionChart) {
        sipCompositionChart.destroy();
    }

    sipCompositionChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Invested Amount", "Profit"],
            datasets: [
                {
                    data: [investedAmount, profit],
                    borderWidth: 1,
                    // Explicit colours so no random green appears
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
            animation: {
                duration: 700,
                easing: "easeOutBack"
            },
            cutout: "60%"
        }
    });
}

// Main calculate function (uses backend + builds charts)
function calculateSip() {
    const monthly = Number(document.getElementById("monthly").value);
    const rate = Number(document.getElementById("rate").value);
    const years = Number(document.getElementById("years").value);

    const errorDiv = document.getElementById("error");
    const resultBox = document.getElementById("resultBox");

    errorDiv.textContent = "";
    resultBox.style.display = "none";
    resultBox.classList.remove("show");
    resultBox.innerHTML = "";

    // Hide charts until we have fresh data
    const sipChartBox = document.getElementById("sipChartBox");
    const sipCompositionBox = document.getElementById("sipCompositionBox");
    if (sipChartBox) sipChartBox.style.display = "none";
    if (sipCompositionBox) sipCompositionBox.style.display = "none";

    if (!monthly || !rate || !years) {
        errorDiv.textContent = "Please fill all the fields.";
        return;
    }

    if (monthly <= 0 || rate <= 0 || years <= 0) {
        errorDiv.textContent = "Values must be greater than zero.";
        return;
    }

    fetch(`${API_BASE_URL}/api/sip?monthly=${monthly}&rate=${rate}&years=${years}`)
        .then(res => {
            if (!res.ok) {
                throw new Error("API error: " + res.status);
            }
            return res.json();
        })
        .then(data => {
            // TEXT RESULTS (backend is source of truth)
            const invested = data.investedAmount;
            const maturity = data.maturityAmount;
            const profit = data.profit;

            resultBox.innerHTML = `
                <h3>SIP Results</h3>
                <p><strong>Invested Amount:</strong> ₹${invested.toLocaleString("en-IN")}</p>
                <p><strong>Maturity Amount:</strong> ₹${maturity.toLocaleString("en-IN")}</p>
                <p><strong>Total Profit:</strong> ₹${profit.toLocaleString("en-IN")}</p>
            `;
            showResultBox(resultBox);

            // GRAPH DATA (from inputs so we get year-wise breakdown)
            const { labels, investedSeries, maturitySeries } =
                buildSipYearlySeries(monthly, rate, years);

            renderSipGrowthChart(labels, investedSeries, maturitySeries);
            renderSipCompositionChart(invested, profit);
        })
        .catch(err => {
            console.error(err);
            errorDiv.textContent = "Something went wrong while calling the SIP API.";
        });
}
