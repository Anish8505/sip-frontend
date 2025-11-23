const API_BASE_URL = "https://sip-calculator-api.onrender.com";

let retChartInstance = null;

function showResultBox(box) {
    box.style.display = "block";
    box.classList.remove("show");
    void box.offsetWidth;
    box.classList.add("show");
}

function renderRetChart(yearlyExpense, corpus) {
    const box = document.getElementById("retChartBox");
    const canvas = document.getElementById("retChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    box.style.display = "block";

    if (retChartInstance) {
        retChartInstance.destroy();
    }

    retChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Yearly Expense at Retirement", "Approx. Corpus Needed"],
            datasets: [
                {
                    label: "Amount (₹)",
                    data: [yearlyExpense, corpus],
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

function calculateRetirement() {
    const expense = Number(document.getElementById("retExpense").value);
    const inflation = Number(document.getElementById("retInflation").value);
    const years = Number(document.getElementById("retYears").value);

    const errorDiv = document.getElementById("retError");
    const resultBox = document.getElementById("retResultBox");

    errorDiv.textContent = "";
    resultBox.style.display = "none";
    resultBox.classList.remove("show");
    resultBox.innerHTML = "";

    if (!expense || !inflation || !years) {
        errorDiv.textContent = "Please fill all the fields.";
        return;
    }
    if (expense <= 0 || inflation < 0 || years <= 0) {
        errorDiv.textContent = "Values must be valid and greater than zero.";
        return;
    }

    fetch(`${API_BASE_URL}/api/retirement?expense=${expense}&inflation=${inflation}&years=${years}`)
        .then(res => {
            if (!res.ok) {
                throw new Error("API error: " + res.status);
            }
            return res.json();
        })
        .then(data => {
            resultBox.innerHTML = `
                <h3>Retirement Corpus Estimate</h3>
                <p><strong>Monthly Expense Today:</strong> ₹${data.monthlyExpenseToday.toLocaleString("en-IN")}</p>
                <p><strong>Years Until Retirement:</strong> ${data.years} years</p>
                <p><strong>Expected Inflation:</strong> ${data.inflationRate.toFixed(2)}% per year</p>
                <p><strong>Estimated Monthly Expense at Retirement:</strong> ₹${data.expenseAtRetirement.toLocaleString("en-IN")}</p>
                <p><strong>Estimated Yearly Expense at Retirement:</strong> ₹${data.yearlyExpenseAtRetirement.toLocaleString("en-IN")}</p>
                <p><strong>Approx. Retirement Corpus Needed:</strong> ₹${data.requiredCorpus.toLocaleString("en-IN")}</p>
                <p style="margin-top:6px;font-size:0.8rem;color:#6b7280;">
                    This is a simple estimate. Actual needs depend on lifestyle, returns, other income
                    and lifespan. Treat this as a starting point, not a final plan.
                </p>
            `;
            showResultBox(resultBox);

            // One clear comparison chart
            renderRetChart(data.yearlyExpenseAtRetirement, data.requiredCorpus);
        })
        .catch(err => {
            console.error(err);
            errorDiv.textContent = "Something went wrong while calling the Retirement API.";
        });
}
