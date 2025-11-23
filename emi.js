const API_BASE_URL = "https://sip-calculator-api.onrender.com";

let emiCompositionChart = null;
let emiBalanceChart = null;

function showResultBox(box) {
    box.style.display = "block";
    box.classList.remove("show");
    void box.offsetWidth;
    box.classList.add("show");
}

function renderEmiCompositionChart(principal, interest) {
    const box = document.getElementById("emiCompositionBox");
    const canvas = document.getElementById("emiCompositionChart");
    const ctx = canvas.getContext("2d");

    box.style.display = "block";

    if (emiCompositionChart) emiCompositionChart.destroy();

    emiCompositionChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Principal", "Total Interest"],
            datasets: [
                {
                    data: [principal, interest],
                    borderWidth: 1,
                    backgroundColor: [
                        "rgba(59, 130, 246, 0.9)",
                        "rgba(248, 113, 113, 0.9)"
                    ]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "bottom" } },
            cutout: "60%"
        }
    });
}

function renderEmiBalanceChart(principal, rate, years) {
    const box = document.getElementById("emiBalanceBox");
    const canvas = document.getElementById("emiBalanceChart");
    const ctx = canvas.getContext("2d");

    box.style.display = "block";

    if (emiBalanceChart) emiBalanceChart.destroy();

    const monthlyRate = rate / 12 / 100;
    const months = years * 12;
    const pow = Math.pow(1 + monthlyRate, months);
    const emi = principal * monthlyRate * pow / (pow - 1);

    const labels = [];
    const balances = [];

    labels.push("Year 0");
    balances.push(principal);

    for (let y = 1; y <= years; y++) {
        const m = y * 12;
        const powM = Math.pow(1 + monthlyRate, m);
        const balance = principal * (pow - powM) / (pow - 1);
        balances.push(Math.max(0, Math.round(balance)));
        labels.push(`Year ${y}`);
    }

    emiBalanceChart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Balance Remaining",
                data: balances,
                borderWidth: 2,
                tension: 0.25
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "bottom" } },
            scales: {
                y: {
                    ticks: { callback: v => "₹" + v.toLocaleString("en-IN") }
                }
            }
        }
    });
}

function calculateEmi() {
    const principal = Number(document.getElementById("emiPrincipal").value);
    const rate = Number(document.getElementById("emiRate").value);
    const years = Number(document.getElementById("emiYears").value);

    const errorDiv = document.getElementById("emiError");
    const resultBox = document.getElementById("emiResultBox");

    errorDiv.textContent = "";
    resultBox.style.display = "none";
    resultBox.classList.remove("show");
    resultBox.innerHTML = "";

    if (!principal || !rate || !years) {
        errorDiv.textContent = "Please fill all the fields.";
        return;
    }

    fetch(`${API_BASE_URL}/api/emi?principal=${principal}&rate=${rate}&years=${years}`)
        .then(res => res.json())
        .then(data => {
            const principalVal = data.investedAmount;
            const totalPaid = data.maturityAmount;
            const interest = data.profit;
            const emi = totalPaid / (years * 12);

            resultBox.innerHTML = `
                <h3>EMI Results</h3>
                <p><strong>Monthly EMI:</strong> ₹${emi.toLocaleString("en-IN", {minimumFractionDigits: 2})}</p>
                <p><strong>Total Amount Paid:</strong> ₹${totalPaid.toLocaleString("en-IN")}</p>
                <p><strong>Total Interest Paid:</strong> ₹${interest.toLocaleString("en-IN")}</p>
                <p><strong>Loan Amount (Principal):</strong> ₹${principalVal.toLocaleString("en-IN")}</p>
            `;
            showResultBox(resultBox);

            renderEmiCompositionChart(principalVal, interest);
            renderEmiBalanceChart(principalVal, rate, years);
        })
        .catch(() => {
            errorDiv.textContent = "Error fetching EMI data.";
        });
}
