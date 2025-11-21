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

// ---------------- RD CALCULATOR ----------------
function calculateRd() {
    const monthly = document.getElementById("rdMonthly").value;
    const rate = document.getElementById("rdRate").value;
    const years = document.getElementById("rdYears").value;
    const errorDiv = document.getElementById("rdError");
    const resultBox = document.getElementById("rdResultBox");

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

    fetch(`${API_BASE_URL}/api/rd?monthly=${monthly}&rate=${rate}&years=${years}`)
        .then(res => {
            if (!res.ok) {
                throw new Error("API error: " + res.status);
            }
            return res.json();
        })
        .then(data => {
            resultBox.style.display = "block";
            resultBox.innerHTML = `
                <h3>RD Results</h3>
                <p><strong>Total Deposited:</strong> ₹${data.investedAmount.toLocaleString("en-IN")}</p>
                <p><strong>Maturity Amount:</strong> ₹${data.maturityAmount.toLocaleString("en-IN")}</p>
                <p><strong>Total Interest Earned:</strong> ₹${data.profit.toLocaleString("en-IN")}</p>
            `;
        })
        .catch(err => {
            console.error(err);
            errorDiv.textContent = "Something went wrong while calling the RD API.";
        });
}

// ---------------- EMI CALCULATOR ----------------
function calculateEmi() {
    const principal = document.getElementById("emiPrincipal").value;
    const rate = document.getElementById("emiRate").value;
    const years = document.getElementById("emiYears").value;
    const errorDiv = document.getElementById("emiError");
    const resultBox = document.getElementById("emiResultBox");

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

    const yearsNum = Number(years);
    const months = yearsNum * 12;

    fetch(`${API_BASE_URL}/api/emi?principal=${principal}&rate=${rate}&years=${years}`)
        .then(res => {
            if (!res.ok) {
                throw new Error("API error: " + res.status);
            }
            return res.json();
        })
        .then(data => {
            const principalVal = data.investedAmount;
            const totalPaid = data.maturityAmount;
            const interest = data.profit;

            const emi = totalPaid / months;
            const emiFormatted = emi.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            resultBox.style.display = "block";
            resultBox.innerHTML = `
                <h3>EMI Results</h3>
                <p><strong>Monthly EMI:</strong> ₹${emiFormatted}</p>
                <p><strong>Total Amount Paid:</strong> ₹${totalPaid.toLocaleString("en-IN")}</p>
                <p><strong>Total Interest Paid:</strong> ₹${interest.toLocaleString("en-IN")}</p>
                <p><strong>Loan Amount (Principal):</strong> ₹${principalVal.toLocaleString("en-IN")}</p>
            `;
        })
        .catch(err => {
            console.error(err);
            errorDiv.textContent = "Something went wrong while calling the EMI API.";
        });
}

// ---------------- INCOME TAX CALCULATOR (INDIA) ----------------
function calculateTax() {
    const income = document.getElementById("taxIncome").value;
    const regime = document.getElementById("taxRegime").value;
    const errorDiv = document.getElementById("taxError");
    const resultBox = document.getElementById("taxResultBox");

    errorDiv.textContent = "";
    resultBox.style.display = "none";
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
            resultBox.style.display = "block";
            resultBox.innerHTML = `
                <h3>Income Tax Results (${data.regime === "new" ? "New Regime" : "Old Regime"})</h3>
                <p><strong>Annual Income:</strong> ₹${data.income.toLocaleString("en-IN")}</p>
                <p><strong>Estimated Tax Payable (incl. cess):</strong> ₹${data.tax.toLocaleString("en-IN")}</p>
                <p><strong>Net Income After Tax:</strong> ₹${data.netIncome.toLocaleString("en-IN")}</p>
                <p><strong>Effective Tax Rate:</strong> ${data.effectiveRate.toFixed(2)}%</p>
                <p style="margin-top:6px;font-size:0.8rem;color:#6b7280;">
                    This is an approximate calculation using simple slabs and 4% cess, for learning and planning only.
                </p>
            `;
        })
        .catch(err => {
            console.error(err);
            errorDiv.textContent = "Something went wrong while calling the Tax API.";
        });
}

// ---------------- CAGR CALCULATOR ----------------
function calculateCagr() {
    const initial = document.getElementById("cagrInitial").value;
    const finalVal = document.getElementById("cagrFinal").value;
    const years = document.getElementById("cagrYears").value;
    const errorDiv = document.getElementById("cagrError");
    const resultBox = document.getElementById("cagrResultBox");

    errorDiv.textContent = "";
    resultBox.style.display = "none";
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
            resultBox.style.display = "block";
            resultBox.innerHTML = `
                <h3>CAGR Results</h3>
                <p><strong>Initial Value:</strong> ₹${data.initialAmount.toLocaleString("en-IN")}</p>
                <p><strong>Final Value:</strong> ₹${data.finalAmount.toLocaleString("en-IN")}</p>
                <p><strong>Time Period:</strong> ${data.years} years</p>
                <p><strong>Total Gain:</strong> ₹${data.totalGain.toLocaleString("en-IN")}</p>
                <p><strong>Total Return:</strong> ${data.totalReturnPercent.toFixed(2)}%</p>
                <p><strong>CAGR (per year):</strong> ${data.cagrPercent.toFixed(2)}%</p>
            `;
        })
        .catch(err => {
            console.error(err);
            errorDiv.textContent = "Something went wrong while calling the CAGR API.";
        });
}
