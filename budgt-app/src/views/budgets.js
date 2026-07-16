/* ════════════════════════════════════════════════════
   BUDGT — Budgets View
   ════════════════════════════════════════════════════ */

import { State } from '../js/state.js';
import { formatCurrency, percentage, getMonthProgress, generateId } from '../js/utils.js';
import { renderHeader, renderFab, showSheet, closeSheet, showToast } from '../js/components.js';
import { renderDonutChart } from '../js/charts.js';
import { t } from '../js/i18n.js';

export function budgetsView(container) {
  renderHeader(t('Budgets'), [
    { id: 'add-budget-btn', icon: 'ph ph-plus', label: t('Add budget'), onClick: () => showBudgetForm() }
  ]);

  const render = () => {
    const budgets = State.getBudgets();
    const categories = State.getCategories();
    const now = new Date();
    const monthProgress = getMonthProgress();

    // Calculate totals
    let totalBudget = 0;
    let totalSpent = 0;

    const budgetData = budgets.map(b => {
      const cat = categories.find(c => c.id === b.categoryId);
      const spent = State.getBudgetSpending(b.id);
      const pct = percentage(spent, b.amount);
      totalBudget += b.amount;
      totalSpent += spent;
      return { ...b, cat, spent, pct };
    }).sort((a, b) => b.pct - a.pct);

    container.innerHTML = `
      <div style="padding: var(--space-4);">
        <div class="chart-card" style="margin-bottom: var(--space-4);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-3);">
            <span class="section-title">${t('Overview')}</span>
            <span style="font-size:var(--text-sm);color:var(--text-tertiary);">${Math.round(monthProgress * 100)}% ${t('of month')}</span>
          </div>
          <canvas id="budget-overview-chart" style="width:100%;height:160px;"></canvas>
        </div>
      </div>

      <div class="budgets-list">
        ${budgets.length === 0 ? `
          <div class="empty-state">
            <i class="ph ph-chart-pie empty-state-icon"></i>
            <div class="empty-state-title">${t('No budgets set')}</div>
            <div class="empty-state-desc">${t('Create budgets to track spending limits by category')}</div>
            <button class="btn btn-primary btn-sm" id="empty-add-budget">${t('Create Budget')}</button>
          </div>
        ` : budgetData.map(b => {
          const isOver = b.pct > 100;
          const isNear = b.pct > 80 && !isOver;
          return `
            <div class="budget-card" data-id="${b.id}">
              <div class="budget-header">
                <div class="budget-name">
                  <i class="ph ${b.cat?.icon || 'ph-chart-pie'}" style="color:${b.cat?.color || 'var(--accent)'}"></i>
                  <span>${b.cat ? t(b.cat.name) : t('Unknown')}</span>
                </div>
                <div class="budget-amounts">
                  <span class="budget-spent ${isOver ? 'amount-expense' : ''}">${formatCurrency(b.spent)}</span>
                  <span class="budget-total">/ ${formatCurrency(b.amount)}</span>
                </div>
              </div>
              <div class="progress-bar">
                <div class="progress-fill ${isOver ? 'over-budget' : isNear ? 'near-limit' : ''}"
                     style="width: ${Math.min(b.pct, 100)}%; ${!isOver && !isNear ? 'background:' + (b.cat?.color || 'var(--accent)') : ''}">
                </div>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--text-tertiary);">
                <span>${isOver ? t('Over by') + ' ' + formatCurrency(b.spent - b.amount) : formatCurrency(b.amount - b.spent) + ' ' + t('remaining')}</span>
                <span>${b.pct}%</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Render overview chart
    const chartCanvas = document.getElementById('budget-overview-chart');
    if (chartCanvas && budgetData.length > 0) {
      renderDonutChart(chartCanvas, [
        { value: totalSpent, color: totalSpent > totalBudget ? 'oklch(0.62 0.18 25)' : 'oklch(0.72 0.15 185)' },
        { value: Math.max(totalBudget - totalSpent, 0), color: 'oklch(0.21 0.008 260)' }
      ], {
        centerText: formatCurrency(totalBudget - totalSpent, { compact: true }),
        centerSubtext: totalSpent > totalBudget ? t('Over budget') : t('Remaining'),
        lineWidth: 18
      });
    }

    // Budget card click → edit
    container.querySelectorAll('.budget-card').forEach(card => {
      card.addEventListener('click', () => {
        const budget = State.getBudgets().find(b => b.id === card.dataset.id);
        if (budget) showBudgetForm(budget);
      });
    });

    // Empty state add button
    document.getElementById('empty-add-budget')?.addEventListener('click', () => showBudgetForm());
  };

  render();

  const unsubs = [
    State.subscribe('budgets', render),
    State.subscribe('transactions', render),
  ];

  return () => unsubs.forEach(u => u());
}

function showBudgetForm(existing = null) {
  const isEdit = !!existing;
  const categories = State.getCategories().filter(c => c.type === 'expense');
  const existingBudgets = State.getBudgets();

  // Filter out categories that already have budgets (unless editing)
  const availableCategories = isEdit
    ? categories
    : categories.filter(c => !existingBudgets.some(b => b.categoryId === c.id));

  showSheet({
    title: isEdit ? t('Edit Budget') : t('New Budget'),
    content: (container) => {
      container.innerHTML = `
        <div class="input-group">
          <label class="input-label" for="bud-category">${t('Category')}</label>
          <div class="select-wrapper">
            <select class="input" id="bud-category" ${isEdit ? 'disabled' : ''}>
              ${availableCategories.map(c => `
                <option value="${c.id}" ${existing?.categoryId === c.id ? 'selected' : ''}>${t(c.name)}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="input-group">
          <label class="input-label" for="bud-amount">${t('Monthly Limit')}</label>
          <input class="input" type="number" id="bud-amount" placeholder="0.00" step="0.01" min="0"
                 value="${existing?.amount || ''}" inputmode="decimal" />
        </div>

        <button class="btn btn-primary btn-full" id="bud-save">${isEdit ? t('Update') : t('Create Budget')}</button>
        ${isEdit ? `<button class="btn btn-danger btn-full" id="bud-delete">${t('Delete Budget')}</button>` : ''}
      `;

      container.querySelector('#bud-save').addEventListener('click', () => {
        const categoryId = container.querySelector('#bud-category').value;
        const amount = parseFloat(container.querySelector('#bud-amount').value);

        if (!amount || amount <= 0) {
          showToast(t('Please enter a valid amount'), 'error');
          return;
        }

        if (isEdit) {
          State.updateBudget(existing.id, { amount });
          showToast(t('Budget updated'), 'success');
        } else {
          State.addBudget({
            id: generateId(),
            categoryId,
            amount,
            period: 'monthly',
            startDate: new Date().toISOString()
          });
          showToast(t('Budget created'), 'success');
        }
        closeSheet();
      });

      if (isEdit) {
        container.querySelector('#bud-delete').addEventListener('click', () => {
          State.deleteBudget(existing.id);
          closeSheet();
          showToast(t('Budget deleted'), 'success');
        });
      }
    }
  });
}
