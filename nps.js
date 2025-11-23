const API_BASE_URL = "https://sip-calculator-api.onrender.com";

let npsChartInstance = null;

function showResultBox(box) {
    box.style.display = "block";
    box.classList.remove("show");
    void box.offsetWidth;
    box.classList.add("show");
}

function renderNpsChart(monthly, rate, years) {
    const box = document.getElementById("npsChartBox");
    const canvas = document.getElementById("npsChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    box.style.display = "block";

    if (npsChartInstance) npsChartInstance.destroy();

    const r = rate / 100 / 12;
    const labels = [];
    const investedData = [];
    const valueData = [];

    for (let y = 1; y <= years; y++) {
        const months = y * 12;
        const invested = monthly * months;
        let fv;
        if (r === 0) fv = invested;
        else fv = monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);

        labels.push(`Year ${y}`);
        investedData.push(Math.round(invested));
        valueData.push(Math.round(fv));
    }

    npsChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                { label: "Total Investment", data: investedData, borderWidth: 2, tension: 0.25 },
                { label: "Estimated Corpus", data: valueData, borderWidth: 2, tension: 0.25 }
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

function calculateNps() {
    const monthly = Number(document.getElementById("npsMonthly").value);
    const rate = Number(document.getElementById("npsRate").value);
    const years = Number(document.getElementById("npsYears").value);
    const errorDiv = document.getElementById("npsError");
    const resultBox = document.getElementById("npsResultBox");

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

    fetch(`${API_BASE_URL}/api/nps?monthly=${monthly}&rate=${rate}&years=${years}`)
        .then(res => {
            if (!res.ok) throw new Error("API error: " + res.status);
            return res.json();
        })
        .then(data => {
            resultBox.innerHTML = `
                <h3>NPS Results</h3>
                <p><strong>Monthly Contribution:</strong> ₹${data.monthlyContribution.toLocaleString("en-IN")}</p>
                <p><strong>Years to Retirement:</strong> ${data.years} years</p>
                <p><strong>Expected Return:</strong> ${data.rate.toFixed(2)}% per year</p>
                <p><strong>Total Amount Invested:</strong> ₹${data.totalInvestment.toLocaleString("en-IN")}</p>
                <p><strong>Estimated Maturity Amount:</strong> ₹${data.maturityAmount.toLocaleString("en-IN")}</p>
                <p><strong>Total Gain:</strong> ₹${data.totalGain.toLocaleString("en-IN")}</p>
            `;
            showResultBox(resultBox);
            renderNpsChart(monthly, rate, years);
        })
        .catch(err => {
            console.error(err);
            errorDiv.textContent = "Something went wrong while calling the NPS API.";
        });
}
