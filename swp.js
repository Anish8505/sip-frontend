const API_BASE_URL = "https://sip-calculator-api.onrender.com";

let swpChartInstance = null;

function showResultBox(box) {
    box.style.display = "block";
    box.classList.remove("show");
    void box.offsetWidth;
    box.classList.add("show");
}

function renderSwpChart(startCorpus, rate, monthly, monthsLasted) {
    const box = document.getElementById("swpChartBox");
    const canvas = document.getElementById("swpChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    box.style.display = "block";

    if (swpChartInstance) swpChartInstance.destroy();

    const r = rate / 100 / 12;
    const labels = [];
    const values = [];

    let balance = startCorpus;
    const step = Math.max(1, Math.floor(monthsLasted / 30)); // sample up to ~30 points

    for (let m = 0; m <= monthsLasted; m += step) {
        if (m > 0) {
            balance = balance * (1 + r) - monthly * step;
            if (balance < 0) balance = 0;
        }
        labels.push(`Month ${m}`);
        values.push(Math.round(balance));
    }

    swpChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Corpus Balance",
                    data: values,
                    borderWidth: 2,
                    tension: 0.25
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "bottom" } },
            scales: {
                y: { ticks: { callback: v => "₹" + v.toLocaleString("en-IN") } }
            },
            animation: { duration: 700, easing: "easeOutQuart" }
        }
    });
}

function calculateSwp() {
    const corpus = Number(document.getElementById("swpCorpus").value);
    const rate = Number(document.getElementById("swpRate").value);
    const monthly = Number(document.getElementById("swpMonthly").value);
    const errorDiv = document.getElementById("swpError");
    const resultBox = document.getElementById("swpResultBox");

    errorDiv.textContent = "";
    resultBox.style.display = "none";
    resultBox.classList.remove("show");
    resultBox.innerHTML = "";

    if (!corpus || !rate && rate !== 0 || !monthly) {
        errorDiv.textContent = "Please fill all the fields.";
        return;
    }
    if (corpus <= 0 || rate < 0 || monthly <= 0) {
        errorDiv.textContent = "Values must be valid and greater than zero.";
        return;
    }

    fetch(`${API_BASE_URL}/api/swp?corpus=${corpus}&rate=${rate}&monthly=${monthly}`)
        .then(res => {
            if (!res.ok) throw new Error("API error: " + res.status);
            return res.json();
        })
        .then(data => {
            const years = data.yearsLasted;
            const months = data.monthsLasted;

            resultBox.innerHTML = `
                <h3>SWP Results</h3>
                <p><strong>Starting Corpus:</strong> ₹${data.startingCorpus.toLocaleString("en-IN")}</p>
                <p><strong>Monthly Withdrawal:</strong> ₹${data.monthlyWithdrawal.toLocaleString("en-IN")}</p>
                <p><strong>Expected Return:</strong> ${data.rate.toFixed(2)}% per year</p>
                <p><strong>Total Amount Withdrawn:</strong> ₹${data.totalWithdrawn.toLocaleString("en-IN")}</p>
                <p><strong>Total Interest Earned:</strong> ₹${data.totalInterestEarned.toLocaleString("en-IN")}</p>
                <p><strong>Corpus lasts for approx:</strong> ${months} months (~${years.toFixed(2)} years)</p>
                <p style="margin-top:6px;font-size:0.8rem;color:#6b7280;">
                    This is a simplified SWP estimate assuming fixed returns and withdrawals.
                    Real-life results will vary with market performance and actual withdrawal pattern.
                </p>
            `;
            showResultBox(resultBox);
            renderSwpChart(data.startingCorpus, data.rate, data.monthlyWithdrawal, data.monthsLasted);
        })
        .catch(err => {
            console.error(err);
            errorDiv.textContent = "Something went wrong while calling the SWP API.";
        });
}
