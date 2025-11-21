// Use your live backend URL on Render
const API_BASE_URL = "https://sip-calculator-api.onrender.com";

// ---------------- SIP CALCULATOR ----------------
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
                <h3>SIP Results</h3>
                <p><strong>Invested Amount:</strong> ₹${data.investedAmount.toLocaleString("en-IN")}</p>
                <p><strong>Maturity Amount:</strong> ₹${data.maturityAmount.toLocaleString("en-IN")}</p>
                <p><strong>Total Profit:</strong> ₹${data.profit.toLocaleString("en-IN")}</p>
            `;
        })
        .catch(err => {
            console.error(err);
            errorDiv.textContent = "Something went wrong while calling the SIP API.";
        });
}

// ---------------- LUMPSUM CALCULATOR ----------------
function calculateLumpsum() {
    const principal = document.getElementById("lsPrincipal").value;
    const rate = document.getElementById("lsRate").value;
    const years = document.getElementById("lsYears").value;
    const errorDiv = document.getElementById("lsError");
    const resultBox = document.getElementById("lsResultBox");

    errorDiv.textContent = "";
    resultBox.style.display = "none";
    resultBox.innerHTML = "";

    if (!principal || !rate || !years) {
        errorDiv.textContent = "Please fill all the fields.";
        return;
    }

    if (principal <= 0 || rate <= 0 || years <= 0) {
        errorDiv.textContent = "Values must be greater than zero.";
        return;
    }

    fetch(`${API_BASE_URL}/api/lumpsum?principal=${principal}&rate=${rate}&years=${years}`)
        .then(res => {
            if (!res.ok) {
                throw new Error("API error: " + res.status);
            }
            return res.json();
        })
        .then(data => {
            resultBox.style.display = "block";
            resultBox.innerHTML = `
                <h3>Lumpsum Results</h3>
                <p><strong>Invested Amount:</strong> ₹${data.investedAmount.toLocaleString("en-IN")}</p>
                <p><strong>Maturity Amount:</strong> ₹${data.maturityAmount.toLocaleString("en-IN")}</p>
                <p><strong>Total Profit:</strong> ₹${data.profit.toLocaleString("en-IN")}</p>
            `;
        })
        .catch(err => {
            console.error(err);
            errorDiv.textContent = "Something went wrong while calling the Lumpsum API.";
        });
}

// ---------------- FD CALCULATOR ----------------
function calculateFd() {
    const principal = document.getElementById("fdPrincipal").value;
    const rate = document.getElementById("fdRate").value;
    const years = document.getElementById("fdYears").value;
    const errorDiv = document.getElementById("fdError");
    const resultBox = document.getElementById("fdResultBox");

    errorDiv.textContent = "";
    resultBox.style.display = "none";
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
            if (!res.ok) {
                throw new Error("API error: " + res.status);
            }
            return res.json();
        })
        .then(data => {
            resultBox.style.display = "block";
            resultBox.innerHTML = `
                <h3>FD Results</h3>
                <p><strong>Invested Amount:</strong> ₹${data.investedAmount.toLocaleString("en-IN")}</p>
                <p><strong>Maturity Amount:</strong> ₹${data.maturityAmount.toLocaleString("en-IN")}</p>
                <p><strong>Total Interest Earned:</strong> ₹${data.profit.toLocaleString("en-IN")}</p>
            `;
        })
        .catch(err => {
            console.error(err);
            errorDiv.textContent = "Something went wrong while calling the FD API.";
        });
}
