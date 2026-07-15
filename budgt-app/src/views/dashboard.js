/* ════════════════════════════════════════════════════
   BUDGT — Dashboard View
   ════════════════════════════════════════════════════ */

import { State } from '../js/state.js';
import { formatCurrency, formatDate, groupByDate, percentage, getMonthProgress } from '../js/utils.js';
import { renderHeader, renderFab, showTransactionForm } from '../js/components.js';
import { renderDonutChart, renderSparkline } from '../js/charts.js';

export function dashboardView(container) {
  renderHeader('Budgt');
  renderFab(() => showTransactionForm());

  const render = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const totalBalance = State.getTotalBalance();
    const monthlySpending = State.getMonthlySpending(year, month);
    const monthlyIncome = State.getMonthlyIncome(year, month);
    const spendingByCategory = State.getSpendingByCategory(year, month);
    const recentTransactions = State.getTransactions().slice(0, 5);
    const categories = State.getCategories();

    // Calculate last 7 days spending for sparkline
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const daySpending = State.getTransactions()
        .filter(t => {
          const td = new Date(t.date);
          return t.type === 'withdrawal' &&
                 td.getFullYear() === d.getFullYear() &&
                 td.getMonth() === d.getMonth() &&
                 td.getDate() === d.getDate();
        })
        .reduce((sum, t) => sum + t.amount, 0);
      last7Days.push(daySpending);
    }

    container.innerHTML = `
      <div class="dashboard-balance">
        <div class="balance-label">Total Balance</div>
        <div class="balance-amount">${formatCurrency(totalBalance)}</div>
        <div class="balance-change ${monthlyIncome - monthlySpending >= 0 ? 'amount-income' : 'amount-expense'}">
          ${monthlyIncome - monthlySpending >= 0 ? '+' : ''}${formatCurrency(monthlyIncome - monthlySpending)} this month
        </div>
      </div>

      <div class="dashboard-summary">
        <div class="summary-card">
          <div class="summary-card-label">
            <i class="ph ph-arrow-down" style="color: var(--income)"></i>
            Income
          </div>
          <div class="summary-card-amount amount-income">${formatCurrency(monthlyIncome)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-card-label">
            <i class="ph ph-arrow-up" style="color: var(--expense)"></i>
            Spending
          </div>
          <div class="summary-card-amount amount-expense">${formatCurrency(monthlySpending)}</div>
        </div>
      </div>

      <div class="chart-container">
        <div class="chart-card">
          <div class="section-header">
            <span class="section-title">Spending by Category</span>
          </div>
          <canvas id="category-chart" style="width:100%;height:200px;"></canvas>
          <div class="report-legend" id="category-legend"></div>
        </div>
      </div>

      <div class="chart-container" style="padding-top:0;">
        <div class="chart-card">
          <div class="section-header">
            <span class="section-title">Last 7 Days</span>
          </div>
          <canvas id="sparkline-chart" style="width:100%;height:80px;"></canvas>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <span class="section-title">Recent Activity</span>
          <button class="section-action" id="view-all-tx">View All</button>
        </div>
        <div class="list" id="recent-list">
          ${recentTransactions.length === 0 ? `
            <div class="empty-state" style="padding: var(--space-6);">
              <i class="ph ph-receipt empty-state-icon" style="font-size:32px;"></i>
              <div class="empty-state-desc">No transactions yet</div>
            </div>
          ` : recentTransactions.map(tx => {
            const cat = categories.find(c => c.id === tx.categoryId);
            const isExpense = tx.type === 'withdrawal';
            const isTransfer = tx.type === 'transfer';
            return `
              <div class="transaction-item" data-id="${tx.id}">
                <div class="transaction-icon" style="background: ${isTransfer ? 'var(--transfer-muted)' : isExpense ? 'var(--expense-muted)' : 'var(--income-muted)'}; color: ${isTransfer ? 'var(--transfer)' : isExpense ? 'var(--expense)' : 'var(--income)'}">
                  <i class="ph ${isTransfer ? 'ph-arrows-left-right' : cat?.icon || 'ph-receipt'}"></i>
                </div>
                <div class="transaction-info">
                  <div class="transaction-desc">${tx.description}</div>
                  <div class="transaction-category">${isTransfer ? 'Transfer' : cat?.name || 'Uncategorized'}</div>
                </div>
                <div class="list-item-trailing">
                  <div class="transaction-amount ${isExpense ? 'amount-expense' : isTransfer ? 'amount-transfer' : 'amount-income'}">
                    ${isExpense ? '-' : isTransfer ? '' : '+'}${formatCurrency(tx.amount)}
                  </div>
                  <div class="transaction-time">${formatDate(tx.date, 'dayMonth')}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Render donut chart
    const chartCanvas = document.getElementById('category-chart');
    if (chartCanvas) {
      const chartData = spendingByCategory.map(s => ({
        value: s.amount,
        color: s.color,
        label: s.name
      }));
      renderDonutChart(chartCanvas, chartData, {
        centerText: formatCurrency(monthlySpending, { compact: true }),
        centerSubtext: 'This Month',
        lineWidth: 20
      });

      // Legend
      const legend = document.getElementById('category-legend');
      if (legend) {
        legend.innerHTML = spendingByCategory.slice(0, 5).map(s => `
          <div class="legend-item">
            <div class="legend-dot" style="background: ${s.color}"></div>
            <span>${s.name}</span>
            <span style="color: var(--text-tertiary); margin-left: auto;">${formatCurrency(s.amount)}</span>
          </div>
        `).join('');
      }
    }

    // Render sparkline
    const sparkCanvas = document.getElementById('sparkline-chart');
    if (sparkCanvas) {
      renderSparkline(sparkCanvas, last7Days);
    }

    // View all transactions
    document.getElementById('view-all-tx')?.addEventListener('click', () => {
      window.location.hash = '#/transactions';
    });

    // Transaction click → edit
    container.querySelectorAll('.transaction-item').forEach(item => {
      item.addEventListener('click', () => {
        const tx = State.getTransactions().find(t => t.id === item.dataset.id);
        if (tx) showTransactionForm(tx);
      });
    });
  };

  render();

  // Subscribe to changes
  const unsubs = [
    State.subscribe('transactions', render),
    State.subscribe('accounts', render),
  ];

  return () => unsubs.forEach(u => u());
}
