const API_BASE_URL = "https://sip-calculator-api.onrender.com";

let ppfGrowthChart = null;
let ppfCompositionChart = null;

// Smoothly reveal result box
function showResultBox(box) {
    box.style.display = "block";
    box.classList.remove("show");
    void box.offsetWidth; // force reflow
    box.classList.add("show");
}

// Build year-wise PPF series (yearly contributions, annual compounding)
function buildPpfYearlySeries(yearly, annualRate, years) {
    const r = annualRate / 100;

    const labels = [];
    const investedSeries = [];
    const balanceSeries = [];

    // Year 0 baseline
    labels.push("Year 0");
    investedSeries.push(0);
    balanceSeries.push(0);

    let balance = 0;

    for (let y = 1; y <= years; y++) {
        // Each year you add the yearly contribution, then earn interest
        balance = (balance + yearly) * (1 + r);

        labels.push(`Year ${y}`);
        investedSeries.push(yearly * y);
        balanceSeries.push(Math.round(balance));
    }

    return { labels, investedSeries, balanceSeries };
}

/* -------------------------------
   Line chart: PPF growth over time
---------------------------------*/
function renderPpfGrowthChart(labels, investedSeries, balanceSeries) {
    const box = document.getElementById("ppfGrowthBox");
    const canvas = document.getElementById("ppfGrowthChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    box.style.display = "block";

    if (ppfGrowthChart) {
        ppfGrowthChart.destroy();
    }

    ppfGrowthChart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Total Invested",
                    data: investedSeries,
                    borderWidth: 2,
                    tension: 0.25
                },
                {
                    label: "Estimated Balance",
                    data: balanceSeries,
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
   Doughnut chart: invested vs interest
---------------------------------*/
function renderPpfCompositionChart(totalInvestment, totalInterest) {
    const box = document.getElementById("ppfCompositionBox");
    const canvas = document.getElementById("ppfCompositionChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    box.style.display = "block";

    if (ppfCompositionChart) {
        ppfCompositionChart.destroy();
    }

    ppfCompositionChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Total Investment", "Interest Earned"],
            datasets: [
                {
                    data: [totalInvestment, totalInterest],
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
function calculatePpf() {
    const yearly = Number(document.getElementById("ppfYearly").value);
    const rate = Number(document.getElementById("ppfRate").value);
    const years = Number(document.getElementById("ppfYears").value);

    const errorDiv = document.getElementById("ppfError");
    const resultBox = document.getElementById("ppfResultBox");

    errorDiv.textContent = "";
    resultBox.style.display = "none";
    resultBox.classList.remove("show");
    resultBox.innerHTML = "";

    if (!yearly || !rate || !years) {
        errorDiv.textContent = "Please fill all the fields.";
        return;
    }
    if (yearly <= 0 || rate <= 0 || years <= 0) {
        errorDiv.textContent = "Values must be greater than zero.";
        return;
    }

    fetch(`${API_BASE_URL}/api/ppf?yearly=${yearly}&rate=${rate}&years=${years}`)
        .then(res => {
            if (!res.ok) throw new Error("API error: " + res.status);
            return res.json();
        })
        .then(data => {
            const yearlyInvestment = data.yearlyInvestment;
            const tenureYears = data.tenureYears;
            const totalInvestment = data.totalInvestment;
            const totalInterest = data.totalInterest;
            const maturityAmount = data.maturityAmount;

            // Text results from backend (source of truth)
            resultBox.innerHTML = `
                <h3>PPF Results</h3>
                <p><strong>Yearly Investment:</strong> ₹${yearlyInvestment.toLocaleString("en-IN")}</p>
                <p><strong>Time Period:</strong> ${tenureYears} years</p>
                <p><strong>Total Invested:</strong> ₹${totalInvestment.toLocaleString("en-IN")}</p>
                <p><strong>Total Interest Earned:</strong> ₹${totalInterest.toLocaleString("en-IN")}</p>
                <p><strong>Estimated Maturity Amount:</strong> ₹${maturityAmount.toLocaleString("en-IN")}</p>
            `;
            showResultBox(resultBox);

            // Build chart data from inputs (for year-wise breakdown)
            const { labels, investedSeries, balanceSeries } =
                buildPpfYearlySeries(yearly, rate, years);

            renderPpfGrowthChart(labels, investedSeries, balanceSeries);
            renderPpfCompositionChart(totalInvestment, totalInterest);
        })
        .catch(err => {
            console.error(err);
            errorDiv.textContent = "Something went wrong while calling the PPF API.";
        });
}
