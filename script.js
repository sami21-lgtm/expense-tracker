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

let categoryChartInstance = null;
let overviewChartInstance = null;

// অ্যাপ লোড হ্যান্ডলার
document.addEventListener('DOMContentLoaded', () => {
    initTheme();          // ব্রাউজার মেমোরি থেকে থিম লোড
    initializeCharts();   // চার্ট জেনারেশন
    updateDashboardUI();  // নাম্বার ও স্ট্যাটাস লোড
    setupModalEvents();   // মোডাল পপ-আপ ইভেন্ট
    setupThemeEvent();    // ডে-নাইট বাটন অ্যাক্টিভেশন
});

function saveDataToLocalStorage() {
    localStorage.setItem('financeData', JSON.stringify(financeData));
}

// ==========================================
// ২. ড্যাশবোর্ড স্ট্যাটাস ও কারেন্সি ক্যালকুলেটর
// ==========================================

function updateDashboardUI() {
    const totalBalance = financeData.income - financeData.expenses;
    const savingsRate = financeData.income > 0 ? ((totalBalance / financeData.income) * 100).toFixed(1) : 0;

    // সংখ্যাগুলোকে কমা ও ডট ফরম্যাটে ডাইনামিক করা
    document.getElementById('total-balance').textContent = `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById('total-income').textContent = `$${financeData.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById('total-expenses').textContent = `$${financeData.expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById('savings-rate').textContent = `${savingsRate}%`;
}

// ==========================================
// ৩. Chart.js রেন্ডারিং কনফিগারেশন
// ==========================================

function initializeCharts() {
    const isDark = document.body.classList.contains('dark-theme');
    const gridColor = isDark ? '#334155' : '#f3f4f6';
    const textColor = isDark ? '#94a3b8' : '#6b7280';

    // ক) ডোনাট চার্ট
    const ctxCat = document.getElementById('categoryChart').getContext('2d');
    categoryChartInstance = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
            labels: Object.keys(financeData.categories),
            datasets: [{
                data: Object.values(financeData.categories),
                backgroundColor: ['#f43f5e', '#06b6d4', '#3b82f6', '#a855f7', '#fbbf24'],
                borderWidth: isDark ? 0 : 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: textColor, boxWidth: 12 }
                }
            },
            cutout: '70%'
        }
    });

    // খ) বার চার্ট
    const ctxOver = document.getElementById('overviewChart').getContext('2d');
    overviewChartInstance = new Chart(ctxOver, {
        type: 'bar',
        data: {
            labels: ['Current Month'],
            datasets: [
                { label: 'Income', data: [financeData.income], backgroundColor: '#06b6d4', borderRadius: 6, barThickness: 28 },
                { label: 'Expenses', data: [financeData.expenses], backgroundColor: '#f43f5e', borderRadius: 6, barThickness: 28 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } },
                x: { grid: { display: false }, ticks: { color: textColor } }
            },
            plugins: {
                legend: { position: 'top', align: 'end', labels: { color: textColor, usePointStyle: true } }
            }
        }
    });
}

// ==========================================
// ৪. নিউ এন্ট্রি মোডাল ও ফর্ম লজিক
// ==========================================

function setupModalEvents() {
    const modal = document.getElementById('transactionModal');
    const openBtn = document.getElementById('openModalBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const form = document.getElementById('transactionForm');

    openBtn.addEventListener('click', () => modal.style.display = 'flex');
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('tx-amount').value);
        const type = document.getElementById('tx-type').value;
        const category = document.getElementById('tx-category').value;

        if (type === 'income') { 
            financeData.income += amount; 
        } else { 
            financeData.expenses += amount; 
            financeData.categories[category] += amount; 
        }

        saveDataToLocalStorage();
        updateDashboardUI();
        
        // চার্ট অ্যানিমেটেড রি-রেন্ডার
        categoryChartInstance.data.datasets[0].data = Object.values(financeData.categories);
        categoryChartInstance.update();

        overviewChartInstance.data.datasets[0].data = [financeData.income];
        overviewChartInstance.data.datasets[1].data = [financeData.expenses];
        overviewChartInstance.update();

        form.reset();
        modal.style.display = 'none';
    });
}

// ==========================================
// ৫. Day/Night (Dark Mode) কোর ইঞ্জিন
// ==========================================

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeBtn = document.getElementById('themeToggleBtn');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-theme');
        themeBtn.innerHTML = '<i class="far fa-moon"></i>';
    }
}

function setupThemeEvent() {
    const themeBtn = document.getElementById('themeToggleBtn');
    
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="far fa-moon"></i>';
        
        // চার্টের ভেতরের টেক্সট ও গ্রিড লাইন লাইভ মোড চেঞ্জ করা
        const gridColor = isDark ? '#334155' : '#f3f4f6';
        const textColor = isDark ? '#94a3b8' : '#6b7280';
        
        categoryChartInstance.options.plugins.legend.labels.color = textColor;
        categoryChartInstance.data.datasets[0].borderWidth = isDark ? 0 : 2;
        categoryChartInstance.update();
        
        overviewChartInstance.options.scales.y.grid.color = gridColor;
        overviewChartInstance.options.scales.y.ticks.color = textColor;
        overviewChartInstance.options.scales.x.ticks.color = textColor;
        overviewChartInstance.options.plugins.legend.labels.color = textColor;
        overviewChartInstance.update();
    });
}
