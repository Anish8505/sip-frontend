const API_BASE_URL = "https://sip-calculator-api.onrender.com";

let rdGrowthChart = null;
let rdCompositionChart = null;

// Smooth reveal animation for result box
function showResultBox(box) {
    box.style.display = "block";
    box.classList.remove("show");
    void box.offsetWidth; // force reflow
    box.classList.add("show");
}

// Build year-wise RD series (monthly deposits with monthly compounding)
function buildRdYearlySeries(monthly, annualRate, years) {
    const r = annualRate / 12 / 100; // monthly rate

    const labels = [];
    const investedSeries = [];
    const maturitySeries = [];

    // Year 0 baseline
    labels.push("Year 0");
    investedSeries.push(0);
    maturitySeries.push(0);

    for (let y = 1; y <= years; y++) {
        const months = y * 12;
        const invested = monthly * months;

        let fv;
        if (r === 0) {
            fv = invested;
        } else {
            fv = monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
        }

        labels.push(`Year ${y}`);
        investedSeries.push(Math.round(invested));
        maturitySeries.push(Math.round(fv));
    }

    return { labels, investedSeries, maturitySeries };
}

/* -------------------------------
   Line chart: RD growth over time
---------------------------------*/
function renderRdGrowthChart(labels, investedSeries, maturitySeries) {
    const box = document.getElementById("rdGrowthBox");
    const canvas = document.getElementById("rdGrowthChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    box.style.display = "block";

    if (rdGrowthChart) {
        rdGrowthChart.destroy();
    }

    rdGrowthChart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Total Deposited",
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
   Doughnut chart: deposits vs interest
---------------------------------*/
function renderRdCompositionChart(totalDeposited, interest) {
    const box = document.getElementById("rdCompositionBox");
    const canvas = document.getElementById("rdCompositionChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    box.style.display = "block";

    if (rdCompositionChart) {
        rdCompositionChart.destroy();
    }

    rdCompositionChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Total Deposited", "Interest Earned"],
            datasets: [
                {
                    data: [totalDeposited, interest],
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
function calculateRd() {
    const monthly = Number(document.getElementById("rdMonthly").value);
    const rate = Number(document.getElementById("rdRate").value);
    const years = Number(document.getElementById("rdYears").value);

    const errorDiv = document.getElementById("rdError");
    const resultBox = document.getElementById("rdResultBox");

    errorDiv.textContent = "";
    resultBox.style.display = "none";
    resultBox.classList.remove("show");
    resultBox.innerHTML = "";

    if (!monthly || !rate || !years) {
        errorDiv.textContent = "Please fill all the fields.";
        return;
    }
    if (monthly <= 0 || rate <= 0 || years <= 0) {
        errorDiv.textContent = "Values must be greater than zero.";
        return;
    }

    fetch(`${API_BASE_URL}/api/rd?monthly=${monthly}&rate=${rate}&years=${years}`)
        .then(res => {
            if (!res.ok) throw new Error("API error: " + res.status);
            return res.json();
        })
        .then(data => {
            const totalDeposited = data.investedAmount;
            const maturityAmount = data.maturityAmount;
            const interest = data.profit;

            // Show text results
            resultBox.innerHTML = `
                <h3>RD Results</h3>
                <p><strong>Total Deposited:</strong> ₹${totalDeposited.toLocaleString("en-IN")}</p>
                <p><strong>Maturity Amount:</strong> ₹${maturityAmount.toLocaleString("en-IN")}</p>
                <p><strong>Total Interest Earned:</strong> ₹${interest.toLocaleString("en-IN")}</p>
            `;
            showResultBox(resultBox);

            // Build chart data and render
            const { labels, investedSeries, maturitySeries } =
                buildRdYearlySeries(monthly, rate, years);

            renderRdGrowthChart(labels, investedSeries, maturitySeries);
            renderRdCompositionChart(totalDeposited, interest);
        })
        .catch(err => {
            console.error(err);
            errorDiv.textContent = "Something went wrong while calling the RD API.";
        });
}
