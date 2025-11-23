// Backend base URL
const API_BASE_URL = "https://sip-calculator-api.onrender.com";

let taxChartInstance = null;

function showResultBox(box) {
    box.style.display = "block";
    box.classList.remove("show");
    void box.offsetWidth;
    box.classList.add("show");
}

function renderTaxChart(income, tax, net) {
    const box = document.getElementById("taxChartBox");
    const canvas = document.getElementById("taxChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    box.style.display = "block";

    if (taxChartInstance) {
        taxChartInstance.destroy();
    }

    taxChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Income", "Tax", "Net Income"],
            datasets: [
                {
                    label: "Amount (₹)",
                    data: [income, tax, net],
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    ticks: {
                        callback: (v) => "₹" + v.toLocaleString("en-IN")
                    }
                }
            },
            animation: {
                duration: 700,
                easing: "easeOutQuart"
            }
        }
    });
}

function calculateTax() {
    const income = Number(document.getElementById("taxIncome").value);
    const regime = document.getElementById("taxRegime").value;
    const errorDiv = document.getElementById("taxError");
    const resultBox = document.getElementById("taxResultBox");

    errorDiv.textContent = "";
    resultBox.style.display = "none";
    resultBox.classList.remove("show");
    resultBox.innerHTML = "";

    if (!income) {
        errorDiv.textContent = "Please enter your annual taxable income.";
        return;
    }
    if (income <= 0) {
        errorDiv.textContent = "Income must be greater than zero.";
        return;
    }

    fetch(`${API_BASE_URL}/api/tax?income=${income}&regime=${regime}`)
        .then(res => {
            if (!res.ok) {
                throw new Error("API error: " + res.status);
            }
            return res.json();
        })
        .then(data => {
            const inc = data.income;
            const tax = data.tax;
            const net = data.netIncome;

            resultBox.innerHTML = `
                <h3>Income Tax Results (${data.regime === "new" ? "New Regime" : "Old Regime"})</h3>
                <p><strong>Annual Income:</strong> ₹${inc.toLocaleString("en-IN")}</p>
                <p><strong>Estimated Tax Payable (incl. cess):</strong> ₹${tax.toLocaleString("en-IN")}</p>
                <p><strong>Net Income After Tax:</strong> ₹${net.toLocaleString("en-IN")}</p>
                <p><strong>Effective Tax Rate:</strong> ${data.effectiveRate.toFixed(2)}%</p>
                <p style="margin-top:6px;font-size:0.8rem;color:#6b7280;">
                    This is an approximate calculation using simple slabs and 4% cess.
                    Always verify with official income tax rules before filing.
                </p>
            `;
            showResultBox(resultBox);
            renderTaxChart(inc, tax, net);
        })
        .catch(err => {
            console.error(err);
            errorDiv.textContent = "Something went wrong while calling the Tax API.";
        });
}
