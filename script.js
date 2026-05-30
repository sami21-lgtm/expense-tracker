let financeData = JSON.parse(localStorage.getItem('financeData')) || {
    income: 12000.00,
    expenses: 850.00,
    categories: {
        Food: 350,
        Transportation: 150,
        Housing: 200,
        Entertainment: 100,
        Shopping: 50
    }
};

// গ্লোবাল চার্ট ইনস্ট্যান্স ভ্যারিয়েবল (আপডেট করার সুবিধার্থে)
let categoryChartInstance = null;
let overviewChartInstance = null;

// পেজ সম্পূর্ণ লোড হওয়ার পর এক্সিকিউট হবে
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    updateDashboardUI();
    setupModalEvents();
});

// ডাটা লোকাল স্টোরেজে স্থায়ীভাবে সেভ করার ফাংশন
function saveDataToLocalStorage() {
    localStorage.setItem('financeData', JSON.stringify(financeData));
}

// ==========================================
// ২. ড্যাশবোর্ড UI এবং KPI কার্ড ক্যালকুলেশন
// ==========================================

function updateDashboardUI() {
    // টোটাল ব্যালেন্স হিসাব (ইনকাম - খরচ)
    const totalBalance = financeData.income - financeData.expenses;
    
    // সেভিংস রেট পার্সেন্টেজ হিসাব
    const savingsRate = financeData.income > 0 ? ((totalBalance / financeData.income) * 100).toFixed(1) : 0;

    // DOM এলিমেন্টগুলোতে রিয়েল-টাইম ডাটা পুশ করা
    document.getElementById('total-balance').textContent = `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('total-income').textContent = `$${financeData.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('total-expenses').textContent = `$${financeData.expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('savings-rate').textContent = `${savingsRate}%`;

    // ব্যালেন্স নেগেটিভ বা জিরো হলে কালার ডাইনামিকালি চেঞ্জ করার লজিক (রিয়েল অ্যাপ ফিল)
    const balanceCard = document.getElementById('total-balance');
    if (totalBalance < 0) {
        balanceCard.style.color = '#ef4444'; // লাল রঙ
    } else {
        balanceCard.style.color = '#1f2937'; // ডার্ক রঙ
    }
}

// ==========================================
// ৩. Chart.js দিয়ে চার্ট জেনারেট ও কনফিগারেশন
// ==========================================

function initializeCharts() {
    // ক) ক্যাটাগরি অনুযায়ী ডোনাট চার্ট (Spending by Category)
    const ctxCat = document.getElementById('categoryChart').getContext('2d');
    categoryChartInstance = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
            labels: Object.keys(financeData.categories),
            datasets: [{
                data: Object.values(financeData.categories),
                backgroundColor: ['#f43f5e', '#06b6d4', '#3b82f6', '#a855f7', '#fbbf24'],
                borderWidth: 2,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        padding: 15,
                        font: { size: 12, weight: '500' }
                    }
                }
            },
            cutout: '70%'
        }
    });

    // খ) মান্থলি ওভারভিউ বার চার্ট (Monthly Overview)
    const ctxOver = document.getElementById('overviewChart').getContext('2d');
    overviewChartInstance = new Chart(ctxOver, {
        type: 'bar',
        data: {
            labels: ['Current Month'],
            datasets: [
                {
                    label: 'Income',
                    data: [financeData.income],
                    backgroundColor: '#06b6d4',
                    borderRadius: 6,
                    barThickness: 28
                },
                {
                    label: 'Expenses',
                    data: [financeData.expenses],
                    backgroundColor: '#f43f5e',
                    borderRadius: 6,
                    barThickness: 28
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f3f4f6' },
                    ticks: { font: { size: 11 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 12, weight: '600' } }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: { boxWidth: 10, usePointStyle: true }
                }
            }
        }
    });
}

// ==========================================
// ৪. ইনপুট ফর্ম এবং মোডাল পপ-আপ ইভেন্ট হ্যান্ডলার
// ==========================================

function setupModalEvents() {
    const modal = document.getElementById('transactionModal');
    const openBtn = document.getElementById('openModalBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const form = document.getElementById('transactionForm');

    // মোডাল ওপেন ও ক্লোজ ট্রিগার
    openBtn.addEventListener('click', () => modal.style.display = 'flex');
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    
    // মোডালের বাইরের ব্যাকগ্রাউন্ডে ক্লিক করলে মোডাল বন্ধ হয়ে যাবে
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // ফর্ম সাবমিট করার পর ডাটা প্রসেসিং লজিক
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // পেজ রিফ্রেশ হওয়া বন্ধ করবে

        // ফর্ম থেকে ভ্যালুগুলো কালেক্ট করা
        const amount = parseFloat(document.getElementById('tx-amount').value);
        const type = document.getElementById('tx-type').value;
        const category = document.getElementById('tx-category').value;

        // ইনপুট ভ্যালিডেশন চেক
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid amount!");
            return;
        }

        // ইনকাম নাকি এক্সপেন্স—সেই অনুযায়ী ডাটা স্টেটে যোগ করা
        if (type === 'income') {
            financeData.income += amount;
        } else {
            financeData.expenses += amount;
            // নির্দিষ্ট ক্যাটাগরিতে খরচ যোগ করা
            if (financeData.categories[category] !== undefined) {
                financeData.categories[category] += amount;
            } else {
                financeData.categories[category] = amount;
            }
        }

        // ১. ব্রাউজার মেমোরিতে নতুন ডাটা সেভ করা
        saveDataToLocalStorage();

        // ২. কার্ডের টেক্সট ও নাম্বারগুলো আপডেট করা
        updateDashboardUI();
        
        // ৩. ডোনাট চার্ট লাইভ অ্যানিমেশনের সাথে আপডেট করা
        categoryChartInstance.data.datasets[0].data = Object.values(financeData.categories);
        categoryChartInstance.data.labels = Object.keys(financeData.categories);
        categoryChartInstance.update();

        // ৪. বার চার্টের গ্রাফ পিলার লাইভ আপডেট করা
        overviewChartInstance.data.datasets[0].data = [financeData.income];
        overviewChartInstance.data.datasets[1].data = [financeData.expenses];
        overviewChartInstance.update();

        // ফর্ম ইনপুট ফিল্ডগুলো রিফ্রেশ করা এবং মোডাল বন্ধ করা
        form.reset();
        modal.style.display = 'none';
    });
}
