// Backend base URL
const API_BASE_URL = "https://sip-calculator-api.onrender.com";

let cagrChartInstance = null;

// Smooth reveal for result box
function showResultBox(box) {
    box.style.display = "block";
    box.classList.remove("show");
    void box.offsetWidth; // force reflow for CSS animation
    box.classList.add("show");
}

// Draw CAGR growth line chart
function renderCagrChart(initial, cagrPercent, years) {
    const box = document.getElementById("cagrChartBox");
    const canvas = document.getElementById("cagrChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    box.style.display = "block";

    if (cagrChartInstance) {
        cagrChartInstance.destroy();
    }

    const r = cagrPercent / 100;
    const labels = [];
    const values = [];

    for (let y = 0; y <= years; y++) {
        labels.push(`Year ${y}`);
        const val = initial * Math.pow(1 + r, y);
        values.push(Math.round(val));
    }

    cagrChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Estimated Value",
                    data: values,
                    borderWidth: 2,
                    tension: 0.25
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "bottom" }
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

// Main CAGR calculate function
function calculateCagr() {
    const initial = Number(document.getElementById("cagrInitial").value);
    const finalVal = Number(document.getElementById("cagrFinal").value);
    const years = Number(document.getElementById("cagrYears").value);
    const errorDiv = document.getElementById("cagrError");
    const resultBox = document.getElementById("cagrResultBox");

    errorDiv.textContent = "";
    resultBox.style.display = "none";
    resultBox.classList.remove("show");
    resultBox.innerHTML = "";

    if (!initial || !finalVal || !years) {
        errorDiv.textContent = "Please fill all the fields.";
        return;
    }
    if (initial <= 0 || finalVal <= 0 || years <= 0) {
        errorDiv.textContent = "Values must be greater than zero.";
        return;
    }

    fetch(`${API_BASE_URL}/api/cagr?initial=${initial}&final=${finalVal}&years=${years}`)
        .then(res => {
            if (!res.ok) {
                throw new Error("API error: " + res.status);
            }
            return res.json();
        })
        .then(data => {
            resultBox.innerHTML = `
                <h3>CAGR Results</h3>
                <p><strong>Initial Value:</strong> ₹${data.initialAmount.toLocaleString("en-IN")}</p>
                <p><strong>Final Value:</strong> ₹${data.finalAmount.toLocaleString("en-IN")}</p>
                <p><strong>Time Period:</strong> ${data.years} years</p>
                <p><strong>Total Gain:</strong> ₹${data.totalGain.toLocaleString("en-IN")}</p>
                <p><strong>Total Return:</strong> ${data.totalReturnPercent.toFixed(2)}%</p>
                <p><strong>CAGR (per year):</strong> ${data.cagrPercent.toFixed(2)}%</p>
            `;
            showResultBox(resultBox);
            renderCagrChart(data.initialAmount, data.cagrPercent, data.years);
        })
        .catch(err => {
            console.error(err);
            errorDiv.textContent = "Something went wrong while calling the CAGR API.";
        });
}
