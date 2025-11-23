const API_BASE_URL = "https://sip-calculator-api.onrender.com";

let fdGrowthChart = null;
let fdCompositionChart = null;

// Smooth reveal animation for result box
function showResultBox(box) {
    box.style.display = "block";
    box.classList.remove("show");
    void box.offsetWidth; // force reflow
    box.classList.add("show");
}

// Build year-wise series for FD growth
function buildFdYearlySeries(principal, annualRate, years) {
    const labels = [];
    const investedSeries = [];
    const maturitySeries = [];

    for (let y = 0; y <= years; y++) {
        labels.push(y === 0 ? "Year 0" : `Year ${y}`);

        if (y === 0) {
            investedSeries.push(0);
            maturitySeries.push(0);
        } else {
            const invested = principal; // one-time deposit
            const fv = principal * Math.pow(1 + annualRate / 100, y);

            investedSeries.push(Math.round(invested));
            maturitySeries.push(Math.round(fv));
        }
    }

    return { labels, investedSeries, maturitySeries };
}

/* -------------------------------
   Line chart: FD value over time
---------------------------------*/
function renderFdGrowthChart(labels, investedSeries, maturitySeries) {
    const box = document.getElementById("fdGrowthBox");
    const canvas = document.getElementById("fdGrowthChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    box.style.display = "block";

    if (fdGrowthChart) {
        fdGrowthChart.destroy();
    }

    fdGrowthChart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Principal",
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
   Doughnut chart: principal vs interest
---------------------------------*/
function renderFdCompositionChart(investedAmount, interest) {
    const box = document.getElementById("fdCompositionBox");
    const canvas = document.getElementById("fdCompositionChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    box.style.display = "block";

    if (fdCompositionChart) {
        fdCompositionChart.destroy();
    }

    fdCompositionChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Principal", "Interest Earned"],
            datasets: [
                {
                    data: [investedAmount, interest],
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
function calculateFd() {
    const principal = Number(document.getElementById("fdPrincipal").value);
    const rate = Number(document.getElementById("fdRate").value);
    const years = Number(document.getElementById("fdYears").value);

    const errorDiv = document.getElementById("fdError");
    const resultBox = document.getElementById("fdResultBox");

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

    fetch(`${API_BASE_URL}/api/fd?principal=${principal}&rate=${rate}&years=${years}`)
        .then(res => {
            if (!res.ok) throw new Error("API error: " + res.status);
            return res.json();
        })
        .then(data => {
            const invested = data.investedAmount;
            const maturity = data.maturityAmount;
            const interest = data.profit;

            // Text results from backend
            resultBox.innerHTML = `
                <h3>FD Results</h3>
                <p><strong>Invested Amount (Principal):</strong> ₹${invested.toLocaleString("en-IN")}</p>
                <p><strong>Maturity Amount:</strong> ₹${maturity.toLocaleString("en-IN")}</p>
                <p><strong>Total Interest Earned:</strong> ₹${interest.toLocaleString("en-IN")}</p>
            `;
            showResultBox(resultBox);

            // Chart data from inputs + backend
            const { labels, investedSeries, maturitySeries } =
                buildFdYearlySeries(principal, rate, years);

            renderFdGrowthChart(labels, investedSeries, maturitySeries);
            renderFdCompositionChart(invested, interest);
        })
        .catch(err => {
            console.error(err);
            errorDiv.textContent = "Something went wrong while calling the FD API.";
        });
}
