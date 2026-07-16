/* ════════════════════════════════════════════════════
   BUDGT — Transactions View
   ════════════════════════════════════════════════════ */

import { State } from '../js/state.js';
import { formatCurrency, formatDate, groupByDate } from '../js/utils.js';
import { renderHeader, renderFab, showTransactionForm, emptyState } from '../js/components.js';
import { t } from '../js/i18n.js';

export function transactionsView(container) {
  renderHeader(t('Activity'));
  renderFab(() => showTransactionForm());

  let activeFilter = 'all';

  const render = () => {
    let transactions = State.getTransactions();
    const categories = State.getCategories();

    // Apply filter
    if (activeFilter !== 'all') {
      transactions = transactions.filter(t => t.type === activeFilter);
    }

    const grouped = groupByDate(transactions);

    // Monthly totals
    const now = new Date();
    const monthTx = State.getTransactions().filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthIn = monthTx.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
    const monthOut = monthTx.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0);

    container.innerHTML = `
      <div style="padding: var(--space-3) var(--space-4) 0;">
        <div class="dashboard-summary" style="padding:0; margin-bottom: var(--space-2);">
          <div class="summary-card">
            <div class="summary-card-label" style="font-size:var(--text-xs);">
              <i class="ph ph-arrow-down" style="color:var(--income);font-size:14px;"></i> ${t('Income')}
            </div>
            <div class="summary-card-amount amount-income" style="font-size:var(--text-md);">${formatCurrency(monthIn)}</div>
          </div>
          <div class="summary-card">
            <div class="summary-card-label" style="font-size:var(--text-xs);">
              <i class="ph ph-arrow-up" style="color:var(--expense);font-size:14px;"></i> ${t('Spent')}
            </div>
            <div class="summary-card-amount amount-expense" style="font-size:var(--text-md);">${formatCurrency(monthOut)}</div>
          </div>
        </div>
      </div>

      <div class="chip-row">
        <button class="chip ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">${t('All')}</button>
        <button class="chip ${activeFilter === 'withdrawal' ? 'active' : ''}" data-filter="withdrawal">${t('Expenses')}</button>
        <button class="chip ${activeFilter === 'deposit' ? 'active' : ''}" data-filter="deposit">${t('Income')}</button>
        <button class="chip ${activeFilter === 'transfer' ? 'active' : ''}" data-filter="transfer">${t('Transfers')}</button>
      </div>

      <div class="transactions-list" id="tx-list">
        ${transactions.length === 0 ? `
          <div class="empty-state">
            <i class="ph ph-receipt empty-state-icon"></i>
            <div class="empty-state-title">${t('No transactions')}</div>
            <div class="empty-state-desc">${activeFilter !== 'all' ? t('No matching transactions found') : t('Tap + to add your first transaction')}</div>
          </div>
        ` : grouped.map(group => `
          <div class="date-header">${formatDate(group.date, 'relative') !== 'Today' && formatDate(group.date, 'relative') !== 'Yesterday' ? formatDate(group.date, 'medium') : formatDate(group.date, 'relative')}</div>
          ${group.items.map(tx => {
            const cat = categories.find(c => c.id === tx.categoryId);
            const isExpense = tx.type === 'withdrawal';
            const isTransfer = tx.type === 'transfer';
            return `
              <div class="transaction-item" data-id="${tx.id}">
                <div class="transaction-icon" style="background: ${isTransfer ? 'var(--transfer-muted)' : isExpense ? 'var(--expense-muted)' : 'var(--income-muted)'}; color: ${isTransfer ? 'var(--transfer)' : isExpense ? 'var(--expense)' : 'var(--income)'}">
                  <i class="ph ${isTransfer ? 'ph-arrows-left-right' : cat?.icon || (isExpense ? 'ph-receipt' : 'ph-money')}"></i>
                </div>
                <div class="transaction-info">
                  <div class="transaction-desc">${tx.description}</div>
                  <div class="transaction-category">${isTransfer ? t('Transfer') : (cat ? t(cat.name) : t('Uncategorized'))}</div>
                </div>
                <div class="list-item-trailing">
                  <div class="transaction-amount ${isExpense ? 'amount-expense' : isTransfer ? 'amount-transfer' : 'amount-income'}">
                    ${isExpense ? '-' : isTransfer ? '' : '+'}${formatCurrency(tx.amount)}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        `).join('')}
      </div>
    `;

    // Filter chips
    container.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        activeFilter = chip.dataset.filter;
        render();
      });
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

  const unsubs = [
    State.subscribe('transactions', render),
    State.subscribe('accounts', render),
  ];

  return () => unsubs.forEach(u => u());
}
