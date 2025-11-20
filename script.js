const API_BASE_URL = "https://sip-calculator-api.onrender.com";

function calculate() {
    const monthly = document.getElementById("monthly").value;
    const rate = document.getElementById("rate").value;
    const years = document.getElementById("years").value;
    const errorDiv = document.getElementById("error");
    const resultBox = document.getElementById("resultBox");

    errorDiv.textContent = "";
    resultBox.style.display = "none";
    resultBox.innerHTML = "";

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
            resultBox.style.display = "block";
            resultBox.innerHTML = `
                <h3>Results</h3>
                <p><strong>Invested Amount:</strong> ₹${data.investedAmount.toLocaleString("en-IN")}</p>
                <p><strong>Maturity Amount:</strong> ₹${data.maturityAmount.toLocaleString("en-IN")}</p>
                <p><strong>Total Profit:</strong> ₹${data.profit.toLocaleString("en-IN")}</p>
            `;
        })
        .catch(err => {
            console.error(err);
            errorDiv.textContent = "Something went wrong while calling the API.";
        });
}
