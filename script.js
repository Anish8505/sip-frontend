// Backend API (for SIP) – still points to Render
const API_BASE_URL = "https://sip-calculator-api.onrender.com";

let sipChartInstance = null;
let lumpsumChartInstance = null;

document.addEventListener("DOMContentLoaded", () => {
    setupTabs();
});

/* ---------------- TABS ---------------- */

function setupTabs() {
    const tabs = document.querySelectorAll(".nav-tab");
    const sections = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = tab.getAttribute("data-target");

            // Activate tab button
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            // Activate corresponding section
            sections.forEach(sec => {
                if (sec.id === targetId) {
                    sec.classList.add("active");
                } else {
                    sec.classList.remove("active");
                }
            });

            // Scroll a bit below header for better UX
            window.scrollTo({
                top: document.querySelector(".hero").offsetHeight + 8,
                behavior: "smooth"
            });
        });
    });
}

/* --------------- SIP CALCULATOR (+ chart) --------------- */

function calculate() {
    const monthly = parseFloat(document.getElementById("monthly").value);
    const rate = parseFloat(document.getElementById("rate").value);
    const years = parseInt(document.getElementById("years").value, 10);

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

    // Call backend API for final numbers (as before)
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

            // Build year-wise data for graph (simulate monthly compounding)
            const labels = [];
            const investedArr = [];
            const valueArr = [];

            let invested = 0;
            let currentValue = 0;
            const monthlyRate = rate / 12 / 100;

            for (let y = 1; y <= years; y++) {
                for (let m = 1; m <= 12; m++) {
                    invested += monthly;
                    currentValue = (currentValue + monthly) * (1 + monthlyRate);
                }
                labels.push(`Year ${y}`);
                investedArr.push(Math.round(invested));
                valueArr.push(Math.round(currentValue));
            }

            renderSipChart(labels, investedArr, valueArr);
        })
        .catch(err => {
            console.error(err);
            errorDiv.textContent = "Something went wrong while calling the API.";
        });
}

function renderSipChart(labels, investedArr, valueArr) {
    const canvas = document.getElementById("sipChart");
    if (!canvas || typeof Chart === "undefined") return;

    const ctx = canvas.getContext("2d");

    if (sipChartInstance) {
        sipChartInstance.destroy();
    }

    sipChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Total Invested",
                    data: investedArr,
                    borderWidth: 2,
                    tension: 0.25
                },
                {
                    label: "Estimated Value",
                    data: valueArr,
                    borderWidth: 2,
                    tension: 0.25
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom"
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: (value) => "₹" + value.toLocaleString("en-IN")
                    }
                }
            }
        }
    });
}

/* --------------- LUMPSUM CALCULATOR (+ chart) --------------- */

function calculateLumpsum() {
    const principal = parseFloat(document.getElementById("lsPrincipal").value);
    const rate = parseFloat(document.getElementById("lsRate").value);
    const years = parseInt(document.getElementById("lsYears").value, 10);

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

    const r = rate / 100;
    const maturity = principal * Math.pow(1 + r, years);
    const profit = maturity - principal;

    resultBox.style.display = "block";
    resultBox.innerHTML = `
        <h3>Results</h3>
        <p><strong>Invested Amount:</strong> ₹${principal.toLocaleString("en-IN")}</p>
        <p><strong>Maturity Amount:</strong> ₹${maturity.toFixed(2).toLocaleString("en-IN")}</p>
        <p><strong>Total Profit:</strong> ₹${profit.toFixed(2).toLocaleString("en-IN")}</p>
    `;

    // Graph: same principal each year, value growing
    const labels = [];
    const investedArr = [];
    const valueArr = [];
    let value = principal;

    for (let y = 1; y <= years; y++) {
        value = value * (1 + r);
        labels.push(`Year ${y}`);
        investedArr.push(principal);
        valueArr.push(Math.round(value));
    }

    renderLumpsumChart(labels, investedArr, valueArr);
}

function renderLumpsumChart(labels, investedArr, valueArr) {
    const canvas = document.getElementById("lumpsumChart");
    if (!canvas || typeof Chart === "undefined") return;

    const ctx = canvas.getContext("2d");

    if (lumpsumChartInstance) {
        lumpsumChartInstance.destroy();
    }

    lumpsumChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Invested",
                    data: investedArr,
                    borderWidth: 2,
                    tension: 0.25
                },
                {
                    label: "Estimated Value",
                    data: valueArr,
                    borderWidth: 2,
                    tension: 0.25
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom" }
            },
            scales: {
                y: {
                    ticks: {
                        callback: (value) => "₹" + value.toLocaleString("en-IN")
                    }
                }
            }
        }
    });
}

/* --------------- FD CALCULATOR --------------- */

function calculateFd() {
    const principal = parseFloat(document.getElementById("fdPrincipal").value);
    const rate = parseFloat(document.getElementById("fdRate").value);
    const years = parseInt(document.getElementById("fdYears").value, 10);

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

    const n = 4; // quarterly compounding
    const r = rate / 100;
    const maturity = principal * Math.pow(1 + r / n, n * years);
    const profit = maturity - principal;

    resultBox.style.display = "block";
    resultBox.innerHTML = `
        <h3>Results</h3>
        <p><strong>Principal:</strong> ₹${principal.toLocaleString("en-IN")}</p>
        <p><strong>Maturity Amount:</strong> ₹${maturity.toFixed(2).toLocaleString("en-IN")}</p>
        <p><strong>Interest Earned:</strong> ₹${profit.toFixed(2).toLocaleString("en-IN")}</p>
    `;
}

/* --------------- RD CALCULATOR --------------- */

function calculateRd() {
    const monthly = parseFloat(document.getElementById("rdMonthly").value);
    const rate = parseFloat(document.getElementById("rdRate").value);
    const years = parseInt(document.getElementById("rdYears").value, 10);

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

    const months = years * 12;
    const monthlyRate = rate / (12 * 100);

    const maturity = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const invested = monthly * months;
    const profit = maturity - invested;

    resultBox.style.display = "block";
    resultBox.innerHTML = `
        <h3>Results</h3>
        <p><strong>Total Deposited:</strong> ₹${invested.toLocaleString("en-IN")}</p>
        <p><strong>Maturity Amount:</strong> ₹${maturity.toFixed(2).toLocaleString("en-IN")}</p>
        <p><strong>Interest Earned:</strong> ₹${profit.toFixed(2).toLocaleString("en-IN")}</p>
    `;
}

/* --------------- PPF (yearly contribution) --------------- */

function calculatePpf() {
    const yearly = parseFloat(document.getElementById("ppfYearly").value);
    const rate = parseFloat(document.getElementById("ppfRate").value);
    const years = parseInt(document.getElementById("ppfYears").value, 10);

    const errorDiv = document.getElementById("ppfError");
    const resultBox = document.getElementById("ppfResultBox");

    errorDiv.textContent = "";
    resultBox.style.display = "none";
    resultBox.innerHTML = "";

    if (!yearly || !rate || !years) {
        errorDiv.textContent = "Please fill all the fields.";
        return;
    }
    if (yearly <= 0 || rate <= 0 || years <= 0) {
        errorDiv.textContent = "Values must be greater than zero.";
        return;
    }

    const r = rate / 100;
    let maturity = 0;

    // yearly contribution at end of each year (approx)
    for (let i = 1; i <= years; i++) {
        maturity = (maturity + yearly) * (1 + r);
    }

    const invested = yearly * years;
    const profit = maturity - invested;

    resultBox.style.display = "block";
    resultBox.innerHTML = `
        <h3>Results</h3>
        <p><strong>Total Invested:</strong> ₹${invested.toLocaleString("en-IN")}</p>
        <p><strong>Estimated Maturity:</strong> ₹${maturity.toFixed(2).toLocaleString("en-IN")}</p>
        <p><strong>Total Interest:</strong> ₹${profit.toFixed(2).toLocaleString("en-IN")}</p>
    `;
}

/* --------------- EMI CALCULATOR --------------- */

function calculateEmi() {
    const principal = parseFloat(document.getElementById("emiPrincipal").value);
    const rate = parseFloat(document.getElementById("emiRate").value);
    const years = parseInt(document.getElementById("emiYears").value, 10);

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

    const monthlyRate = rate / (12 * 100);
    const months = years * 12;

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
                (Math.pow(1 + monthlyRate, months) - 1);

    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;

    resultBox.style.display = "block";
    resultBox.innerHTML = `
        <h3>Results</h3>
        <p><strong>Monthly EMI:</strong> ₹${emi.toFixed(2).toLocaleString("en-IN")}</p>
        <p><strong>Total Interest:</strong> ₹${totalInterest.toFixed(2).toLocaleString("en-IN")}</p>
        <p><strong>Total Payment:</strong> ₹${totalPayment.toFixed(2).toLocaleString("en-IN")}</p>
    `;
}

/* --------------- INCOME TAX CALCULATOR (approx India) --------------- */

function calculateTax() {
    const income = parseFloat(document.getElementById("taxIncome").value);
    const regime = document.getElementById("taxRegime").value;

    const errorDiv = document.getElementById("taxError");
    const resultBox = document.getElementById("taxResultBox");

    errorDiv.textContent = "";
    resultBox.style.display = "none";
    resultBox.innerHTML = "";

    if (!income || income <= 0) {
        errorDiv.textContent = "Please enter a valid taxable income.";
        return;
    }

    let tax = 0;

    if (regime === "new") {
        // Simplified FY 2023-24 new regime slabs (approx)
        const slabs = [
            { upTo: 300000, rate: 0 },
            { upTo: 600000, rate: 0.05 },
            { upTo: 900000, rate: 0.10 },
            { upTo: 1200000, rate: 0.15 },
            { upTo: 1500000, rate: 0.20 },
            { upTo: Infinity, rate: 0.30 }
        ];
        let prev = 0;
        for (const slab of slabs) {
            if (income > prev) {
                const taxable = Math.min(income, slab.upTo) - prev;
                tax += taxable * slab.rate;
                prev = slab.upTo;
            }
        }
    } else {
        // Very simplified old regime (no deductions considered)
        const slabs = [
            { upTo: 250000, rate: 0 },
            { upTo: 500000, rate: 0.05 },
            { upTo: 1000000, rate: 0.20 },
            { upTo: Infinity, rate: 0.30 }
        ];
        let prev = 0;
        for (const slab of slabs) {
            if (income > prev) {
                const taxable = Math.min(income, slab.upTo) - prev;
                tax += taxable * slab.rate;
                prev = slab.upTo;
            }
        }
    }

    const cess = tax * 0.04;
    const totalTax = tax + cess;
    const netIncome = income - totalTax;
    const effectiveRate = (totalTax / income) * 100;

    resultBox.style.display = "block";
    resultBox.innerHTML = `
        <h3>Approximate Tax</h3>
        <p><strong>Total Tax (incl. 4% cess):</strong> ₹${totalTax.toFixed(0).toLocaleString("en-IN")}</p>
        <p><strong>Net Income After Tax:</strong> ₹${netIncome.toFixed(0).toLocaleString("en-IN")}</p>
        <p><strong>Effective Tax Rate:</strong> ${effectiveRate.toFixed(2)}%</p>
        <p style="font-size:0.78rem;margin-top:4px;color:#6b7280;">
            Note: This is a simplified estimate without deductions / exemptions. Please consult a CA or official income tax tools before filing.
        </p>
    `;
}

/* --------------- CAGR CALCULATOR --------------- */

function calculateCagr() {
    const initial = parseFloat(document.getElementById("cagrInitial").value);
    const finalVal = parseFloat(document.getElementById("cagrFinal").value);
    const years = parseInt(document.getElementById("cagrYears").value, 10);

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

    const cagr = Math.pow(finalVal / initial, 1 / years) - 1;

    resultBox.style.display = "block";
    resultBox.innerHTML = `
        <h3>Results</h3>
        <p><strong>CAGR:</strong> ${(cagr * 100).toFixed(2)}% per year</p>
    `;
}

/* --------------- RETIREMENT CORPUS --------------- */

function calculateRetirement() {
    const expense = parseFloat(document.getElementById("retExpense").value);
    const inflation = parseFloat(document.getElementById("retInflation").value);
    const years = parseInt(document.getElementById("retYears").value, 10);

    const errorDiv = document.getElementById("retError");
    const resultBox = document.getElementById("retResultBox");

    errorDiv.textContent = "";
    resultBox.style.display = "none";
    resultBox.innerHTML = "";

    if (!expense || !inflation || !years) {
        errorDiv.textContent = "Please fill all the fields.";
        return;
    }
    if (expense <= 0 || inflation < 0 || years <= 0) {
        errorDiv.textContent = "Values must be greater than zero.";
        return;
    }

    const inflRate = inflation / 100;
    const expenseAtRetirement = expense * Math.pow(1 + inflRate, years);

    // assume need 25x final monthly expense as rough corpus
    const corpusNeeded = expenseAtRetirement * 12 * 25;

    resultBox.style.display = "block";
    resultBox.innerHTML = `
        <h3>Results (rough estimate)</h3>
        <p><strong>Monthly Expense at Retirement (today's ₹${expense.toLocaleString("en-IN")}):</strong>
           ₹${expenseAtRetirement.toFixed(0).toLocaleString("en-IN")}</p>
        <p><strong>Approx. Retirement Corpus Needed:</strong>
           ₹${corpusNeeded.toFixed(0).toLocaleString("en-IN")}</p>
        <p style="font-size:0.78rem;margin-top:4px;color:#6b7280;">
            Assumes 25x annual expenses rule. Adjust based on your risk profile, expected returns and desired lifestyle.
        </p>
    `;
}

/* --------------- NPS CALCULATOR --------------- */

function calculateNps() {
    const monthly = parseFloat(document.getElementById("npsMonthly").value);
    const rate = parseFloat(document.getElementById("npsRate").value);
    const years = parseInt(document.getElementById("npsYears").value, 10);

    const errorDiv = document.getElementById("npsError");
    const resultBox = document.getElementById("npsResultBox");

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

    const months = years * 12;
    const monthlyRate = rate / (12 * 100);

    const maturity = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const invested = monthly * months;
    const profit = maturity - invested;

    resultBox.style.display = "block";
    resultBox.innerHTML = `
        <h3>Results</h3>
        <p><strong>Total Contribution:</strong> ₹${invested.toLocaleString("en-IN")}</p>
        <p><strong>Estimated Corpus:</strong> ₹${maturity.toFixed(2).toLocaleString("en-IN")}</p>
        <p><strong>Estimated Growth:</strong> ₹${profit.toFixed(2).toLocaleString("en-IN")}</p>
    `;
}

/* --------------- SWP CALCULATOR --------------- */

function calculateSwp() {
    const corpus = parseFloat(document.getElementById("swpCorpus").value);
    const rate = parseFloat(document.getElementById("swpRate").value);
    const monthlyWithdrawal = parseFloat(document.getElementById("swpMonthly").value);

    const errorDiv = document.getElementById("swpError");
    const resultBox = document.getElementById("swpResultBox");

    errorDiv.textContent = "";
    resultBox.style.display = "none";
    resultBox.innerHTML = "";

    if (!corpus || !rate || !monthlyWithdrawal) {
        errorDiv.textContent = "Please fill all the fields.";
        return;
    }
    if (corpus <= 0 || rate < 0 || monthlyWithdrawal <= 0) {
        errorDiv.textContent = "Values must be greater than zero.";
        return;
    }

    const monthlyRate = rate / (12 * 100);
    let balance = corpus;
    let months = 0;

    while (balance > 0 && months < 2000) { // safety cap
        balance = balance * (1 + monthlyRate) - monthlyWithdrawal;
        months++;
        if (balance <= 0) break;
    }

    const yearsLasted = Math.floor(months / 12);
    const extraMonths = months % 12;

    resultBox.style.display = "block";
    resultBox.innerHTML = `
        <h3>Results (approximate)</h3>
        <p><strong>Corpus lasts for:</strong> ${yearsLasted} years ${extraMonths} months (approx.)</p>
        <p><strong>Total Withdrawals Taken:</strong> ₹${(months * monthlyWithdrawal).toFixed(0).toLocaleString("en-IN")}</p>
    `;
}
