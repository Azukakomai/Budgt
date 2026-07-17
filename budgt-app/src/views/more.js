/* ════════════════════════════════════════════════════
   BUDGT — More View (Piggy Banks, Bills, Reports, 
   Categories, Settings)
   ════════════════════════════════════════════════════ */

import { State } from '../js/state.js';
import { Store } from '../js/store.js';
import { formatCurrency, formatDate, percentage, generateId, CATEGORY_COLORS } from '../js/utils.js';
import { renderHeader, hideFab, showSheet, closeSheet, showToast, renderNav } from '../js/components.js';
import { renderBarChart, renderDonutChart } from '../js/charts.js';
import { resetToZero } from '../js/seed.js';
import { t, getLanguageName } from '../js/i18n.js';

export function moreView(container) {
  renderHeader(t('More'));
  hideFab();

  container.innerHTML = `
    <div class="list" style="padding-top: var(--space-2);">
      <div class="list-item" data-page="piggybanks">
        <div class="list-item-icon" style="background: var(--accent-muted); color: var(--accent);">
          <i class="ph ph-piggy-bank"></i>
        </div>
        <div class="list-item-content">
          <div class="list-item-title">${t('Piggy Banks')}</div>
          <div class="list-item-subtitle">${t('Savings goals')}</div>
        </div>
        <i class="ph ph-caret-right" style="color:var(--text-tertiary);"></i>
      </div>

      <div class="list-item" data-page="bills">
        <div class="list-item-icon" style="background: var(--warning-muted); color: var(--warning);">
          <i class="ph ph-receipt"></i>
        </div>
        <div class="list-item-content">
          <div class="list-item-title">${t('Bills')}</div>
          <div class="list-item-subtitle">${t('Recurring payments')}</div>
        </div>
        <i class="ph ph-caret-right" style="color:var(--text-tertiary);"></i>
      </div>

      <div class="list-item" data-page="reports">
        <div class="list-item-icon" style="background: var(--income-muted); color: var(--income);">
          <i class="ph ph-chart-bar"></i>
        </div>
        <div class="list-item-content">
          <div class="list-item-title">${t('Reports')}</div>
          <div class="list-item-subtitle">${t('Spending analytics')}</div>
        </div>
        <i class="ph ph-caret-right" style="color:var(--text-tertiary);"></i>
      </div>

      <div class="list-item" data-page="categories">
        <div class="list-item-icon" style="background: var(--transfer-muted); color: var(--transfer);">
          <i class="ph ph-tag"></i>
        </div>
        <div class="list-item-content">
          <div class="list-item-title">${t('Categories')}</div>
          <div class="list-item-subtitle">${t('Manage transaction categories')}</div>
        </div>
        <i class="ph ph-caret-right" style="color:var(--text-tertiary);"></i>
      </div>

      <div class="divider" style="margin: var(--space-2) var(--space-4);"></div>

      <div class="list-item" data-page="settings">
        <div class="list-item-icon" style="background: var(--bg-elevated); color: var(--text-secondary);">
          <i class="ph ph-gear"></i>
        </div>
        <div class="list-item-content">
          <div class="list-item-title">${t('Settings')}</div>
          <div class="list-item-subtitle">${t('Currency, data management')}</div>
        </div>
        <i class="ph ph-caret-right" style="color:var(--text-tertiary);"></i>
      </div>
    </div>
  `;

  container.querySelectorAll('.list-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      window.location.hash = `#/${page}`;
    });
  });
}

// ─────────── Piggy Banks ───────────
export function piggybanksView(container) {
  renderHeader(t('Piggy Banks'), [
    { id: 'add-piggy-btn', icon: 'ph ph-plus', label: t('Add piggy bank'), onClick: () => showPiggyForm() }
  ]);
  hideFab();

  const render = () => {
    const piggies = State.getPiggyBanks();

    container.innerHTML = `
      <div class="piggybanks-list">
        ${piggies.length === 0 ? `
          <div class="empty-state">
            <i class="ph ph-piggy-bank empty-state-icon"></i>
            <div class="empty-state-title">${t('No savings goals')}</div>
            <div class="empty-state-desc">${t('Create a piggy bank to start saving toward a goal')}</div>
            <button class="btn btn-primary btn-sm" id="empty-add-piggy">${t('Create Goal')}</button>
          </div>
        ` : piggies.map(p => {
          const pct = percentage(p.currentAmount, p.targetAmount);
          return `
            <div class="piggy-card" data-id="${p.id}">
              <div class="piggy-header">
                <div class="piggy-icon" style="background: var(--accent-muted); color: var(--accent);">
                  <i class="ph ${p.icon || 'ph-piggy-bank'}"></i>
                </div>
                <div class="piggy-info">
                  <div class="piggy-name">${p.name}</div>
                  <div class="piggy-target">${t('Goal: ')}${formatCurrency(p.targetAmount)}</div>
                </div>
              </div>
              <div class="piggy-amount">
                <span class="piggy-current">${formatCurrency(p.currentAmount)}</span>
                <span class="piggy-percentage">${pct}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min(pct, 100)}%;"></div>
              </div>
              ${p.targetDate ? `<div style="font-size:var(--text-xs);color:var(--text-tertiary);">${t('Target: ')}${formatDate(p.targetDate, 'medium')}</div>` : ''}
              <div class="piggy-actions">
                <button class="btn btn-sm btn-secondary piggy-add-funds" data-id="${p.id}">
                  <i class="ph ph-plus"></i> ${t('Add Funds')}
                </button>
                <button class="btn btn-sm btn-ghost piggy-edit" data-id="${p.id}">
                  <i class="ph ph-pencil"></i> ${t('Edit')}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Add funds
    container.querySelectorAll('.piggy-add-funds').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const piggy = State.getPiggyBanks().find(p => p.id === btn.dataset.id);
        if (piggy) showAddFundsSheet(piggy);
      });
    });

    // Edit
    container.querySelectorAll('.piggy-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const piggy = State.getPiggyBanks().find(p => p.id === btn.dataset.id);
        if (piggy) showPiggyForm(piggy);
      });
    });

    document.getElementById('empty-add-piggy')?.addEventListener('click', () => showPiggyForm());
  };

  render();
  const unsubs = [State.subscribe('piggybanks', render)];
  return () => unsubs.forEach(u => u());
}

function showAddFundsSheet(piggy) {
  showSheet({
    title: `${t('Add Funds')} "${piggy.name}"`,
    content: (container) => {
      const remaining = piggy.targetAmount - piggy.currentAmount;
      container.innerHTML = `
        <div style="text-align:center;margin-bottom:var(--space-2);">
          <div style="font-size:var(--text-sm);color:var(--text-tertiary);">${t('Remaining')}</div>
          <div style="font-size:var(--text-xl);font-weight:700;">${formatCurrency(remaining)}</div>
        </div>
        <div class="input-group">
          <label class="input-label" for="fund-amount">${t('Amount to Add')}</label>
          <input class="input" type="number" id="fund-amount" placeholder="0.00" step="0.01" min="0" inputmode="decimal" />
        </div>
        <button class="btn btn-primary btn-full" id="fund-save">${t('Add Funds')}</button>
      `;

      container.querySelector('#fund-save').addEventListener('click', () => {
        const amount = parseFloat(container.querySelector('#fund-amount').value);
        if (!amount || amount <= 0) {
          showToast(t('Enter a valid amount'), 'error');
          return;
        }
        State.updatePiggyBank(piggy.id, { currentAmount: piggy.currentAmount + amount });
        closeSheet();
        showToast(`${formatCurrency(amount)}${t(' added to ')}${piggy.name}`, 'success');
      });
    }
  });
}

function showPiggyForm(existing = null) {
  const isEdit = !!existing;
  showSheet({
    title: isEdit ? t('Edit Savings Goal') : t('New Savings Goal'),
    content: (container) => {
      container.innerHTML = `
        <div class="input-group">
          <label class="input-label" for="pig-name">${t('Name')}</label>
          <input class="input" type="text" id="pig-name" placeholder="e.g. Vacation Fund" value="${existing?.name || ''}" />
        </div>
        <div class="input-group">
          <label class="input-label" for="pig-target">${t('Target Amount')}</label>
          <input class="input" type="number" id="pig-target" placeholder="0.00" step="0.01" min="0"
                 value="${existing?.targetAmount || ''}" inputmode="decimal" />
        </div>
        <div class="input-group">
          <label class="input-label" for="pig-current">${isEdit ? t('Current Amount') : t('Starting Amount')}</label>
          <input class="input" type="number" id="pig-current" placeholder="0.00" step="0.01" min="0"
                 value="${existing?.currentAmount ?? '0'}" inputmode="decimal" />
        </div>
        <div class="input-group">
          <label class="input-label" for="pig-date">${t('Target Date (optional)')}</label>
          <input class="input" type="date" id="pig-date" value="${existing?.targetDate ? existing.targetDate.split('T')[0] : ''}" />
        </div>
        <button class="btn btn-primary btn-full" id="pig-save">${isEdit ? t('Update') : t('Create')}</button>
        ${isEdit ? `<button class="btn btn-danger btn-full" id="pig-delete">${t('Delete')}</button>` : ''}
      `;

      container.querySelector('#pig-save').addEventListener('click', () => {
        const name = container.querySelector('#pig-name').value.trim();
        const targetAmount = parseFloat(container.querySelector('#pig-target').value);
        const currentAmount = parseFloat(container.querySelector('#pig-current').value) || 0;
        const targetDate = container.querySelector('#pig-date').value;

        if (!name) { showToast(t('Enter a name'), 'error'); return; }
        if (!targetAmount || targetAmount <= 0) { showToast(t('Enter a target amount'), 'error'); return; }

        if (isEdit) {
          State.updatePiggyBank(existing.id, { name, targetAmount, currentAmount, targetDate: targetDate ? new Date(targetDate).toISOString() : null });
          showToast(t('Goal updated'), 'success');
        } else {
          State.addPiggyBank({ id: generateId(), name, targetAmount, currentAmount, icon: 'ph-piggy-bank', targetDate: targetDate ? new Date(targetDate).toISOString() : null, accountId: null });
          showToast(t('Goal created'), 'success');
        }
        closeSheet();
      });

      if (isEdit) {
        container.querySelector('#pig-delete').addEventListener('click', () => {
          State.deletePiggyBank(existing.id);
          closeSheet();
          showToast(t('Goal deleted'), 'success');
        });
      }
    }
  });
}

// ─────────── Bills ───────────
export function billsView(container) {
  renderHeader(t('Bills'), [
    { id: 'add-bill-btn', icon: 'ph ph-plus', label: t('Add bill'), onClick: () => showBillForm() }
  ]);
  hideFab();

  const render = () => {
    const bills = State.getBills();
    const categories = State.getCategories();
    const now = new Date();

    // Monthly bills total
    const monthlyTotal = bills.reduce((sum, b) => {
      if (b.frequency === 'monthly') return sum + b.amount;
      if (b.frequency === 'weekly') return sum + b.amount * 4;
      if (b.frequency === 'yearly') return sum + b.amount / 12;
      return sum;
    }, 0);

    container.innerHTML = `
      <div style="padding: var(--space-4); text-align: center;">
        <div style="font-size:var(--text-sm);color:var(--text-tertiary);">${t('Monthly Bills')}</div>
        <div style="font-size:var(--text-2xl);font-weight:700;font-variant-numeric:tabular-nums;">${formatCurrency(monthlyTotal)}</div>
      </div>

      <div class="bills-list">
        ${bills.length === 0 ? `
          <div class="empty-state">
            <i class="ph ph-receipt empty-state-icon"></i>
            <div class="empty-state-title">${t('No bills tracked')}</div>
            <div class="empty-state-desc">${t('Add recurring bills to keep track of upcoming payments')}</div>
            <button class="btn btn-primary btn-sm" id="empty-add-bill">${t('Add Bill')}</button>
          </div>
        ` : bills.map(b => {
          const cat = categories.find(c => c.id === b.categoryId);
          const dueDate = new Date(b.nextDueDate);
          const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
          const isPaid = b.lastPaidDate && new Date(b.lastPaidDate).getMonth() === now.getMonth();
          const isOverdue = daysUntilDue < 0 && !isPaid;
          const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0 && !isPaid;

          return `
            <div class="bill-card" data-id="${b.id}">
              <div class="bill-icon" style="background: ${cat?.color || 'var(--accent)'}20; color: ${cat?.color || 'var(--accent)'}">
                <i class="ph ${cat?.icon || 'ph-receipt'}"></i>
              </div>
              <div class="bill-info">
                <div class="bill-name">${b.name}</div>
                <div class="bill-meta">${t(b.frequency.charAt(0).toUpperCase() + b.frequency.slice(1))} · ${b.autoPay ? t('Auto-pay') : t('Manual')}</div>
              </div>
              <div class="bill-trailing">
                <div class="bill-amount">${formatCurrency(b.amount)}</div>
                <div class="bill-status ${isPaid ? 'paid' : isOverdue ? 'overdue' : isDueSoon ? 'due' : ''}">
                  ${isPaid ? t('Paid') : isOverdue ? t('Overdue') : isDueSoon ? `${t('Due in ')}${daysUntilDue}d` : `${t('Due ')}${formatDate(b.nextDueDate, 'dayMonth')}`}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('.bill-card').forEach(card => {
      card.addEventListener('click', () => {
        const bill = State.getBills().find(b => b.id === card.dataset.id);
        if (bill) showBillForm(bill);
      });
    });

    document.getElementById('empty-add-bill')?.addEventListener('click', () => showBillForm());
  };

  render();
  const unsubs = [State.subscribe('bills', render)];
  return () => unsubs.forEach(u => u());
}

function showBillForm(existing = null) {
  const isEdit = !!existing;
  const categories = State.getCategories().filter(c => c.type === 'expense');

  showSheet({
    title: isEdit ? t('Edit Bill') : t('New Bill'),
    content: (container) => {
      container.innerHTML = `
        <div class="input-group">
          <label class="input-label" for="bill-name">${t('Name')}</label>
          <input class="input" type="text" id="bill-name" placeholder="e.g. Netflix" value="${existing?.name || ''}" />
        </div>
        <div class="input-group">
          <label class="input-label" for="bill-amount">${t('Amount')}</label>
          <input class="input" type="number" id="bill-amount" placeholder="0.00" step="0.01" min="0"
                 value="${existing?.amount || ''}" inputmode="decimal" />
        </div>
        <div class="input-group">
          <label class="input-label" for="bill-cat">${t('Category')}</label>
          <div class="select-wrapper">
            <select class="input" id="bill-cat">
              <option value="">${t('None')}</option>
              ${categories.map(c => `<option value="${c.id}" ${existing?.categoryId === c.id ? 'selected' : ''}>${t(c.name)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="input-group">
          <label class="input-label" for="bill-freq">${t('Frequency')}</label>
          <div class="select-wrapper">
            <select class="input" id="bill-freq">
              <option value="monthly" ${existing?.frequency === 'monthly' ? 'selected' : ''}>${t('Monthly')}</option>
              <option value="weekly" ${existing?.frequency === 'weekly' ? 'selected' : ''}>${t('Weekly')}</option>
              <option value="yearly" ${existing?.frequency === 'yearly' ? 'selected' : ''}>${t('Yearly')}</option>
            </select>
          </div>
        </div>
        <div class="input-group">
          <label class="input-label" for="bill-due">${t('Next Due Date')}</label>
          <input class="input" type="date" id="bill-due" value="${existing?.nextDueDate ? existing.nextDueDate.split('T')[0] : ''}" />
        </div>
        <button class="btn btn-primary btn-full" id="bill-save">${isEdit ? t('Update') : t('Add')} ${t('Bills')}</button>
        ${isEdit ? `
          <button class="btn btn-secondary btn-full" id="bill-mark-paid">${t('Mark as Paid')}</button>
          <button class="btn btn-danger btn-full" id="bill-delete">${t('Delete Bill')}</button>
        ` : ''}
      `;

      container.querySelector('#bill-save').addEventListener('click', () => {
        const name = container.querySelector('#bill-name').value.trim();
        const amount = parseFloat(container.querySelector('#bill-amount').value);
        if (!name) { showToast(t('Enter a name'), 'error'); return; }
        if (!amount || amount <= 0) { showToast(t('Enter an amount'), 'error'); return; }

        const data = {
          name,
          amount,
          categoryId: container.querySelector('#bill-cat').value || null,
          frequency: container.querySelector('#bill-freq').value,
          nextDueDate: container.querySelector('#bill-due').value ? new Date(container.querySelector('#bill-due').value).toISOString() : new Date().toISOString(),
          autoPay: false,
        };

        if (isEdit) {
          State.updateBill(existing.id, data);
          showToast(t('Bill updated'), 'success');
        } else {
          State.addBill({ id: generateId(), ...data, lastPaidDate: null });
          showToast(t('Bill added'), 'success');
        }
        closeSheet();
      });

      if (isEdit) {
        container.querySelector('#bill-mark-paid')?.addEventListener('click', () => {
          State.updateBill(existing.id, { lastPaidDate: new Date().toISOString() });
          closeSheet();
          showToast(`${existing.name}${t(' marked as paid')}`, 'success');
        });
        container.querySelector('#bill-delete')?.addEventListener('click', () => {
          State.deleteBill(existing.id);
          closeSheet();
          showToast(t('Bill deleted'), 'success');
        });
      }
    }
  });
}

// ─────────── Reports ───────────
export function reportsView(container) {
  renderHeader(t('Reports'));
  hideFab();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const spending = State.getSpendingByCategory(year, month);
  const totalSpending = spending.reduce((s, c) => s + c.amount, 0);
  const totalIncome = State.getMonthlyIncome(year, month);

  // Last 6 months data for bar chart
  const monthlyData = [];
  const settings = State.getSettings();
  const locale = settings.locale || 'en-US';
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - i, 1);
    const mSpending = State.getMonthlySpending(d.getFullYear(), d.getMonth());
    monthlyData.push({
      label: d.toLocaleDateString(locale, { month: 'short' }),
      value: mSpending,
      color: i === 0 ? 'oklch(0.72 0.15 185)' : 'oklch(0.35 0.008 260)'
    });
  }

  container.innerHTML = `
    <div class="report-section">
      <div class="report-chart">
        <div class="report-chart-title">${t('Monthly Spending Trend')}</div>
        <canvas id="monthly-bar-chart" style="width:100%;height:200px;"></canvas>
      </div>

      <div class="report-chart">
        <div class="report-chart-title">${t('Category Breakdown')}</div>
        <canvas id="report-donut" style="width:100%;height:200px;"></canvas>
        <div class="report-legend" id="report-legend"></div>
      </div>

      <div class="report-chart">
        <div class="report-chart-title">${t('Summary')}</div>
        <div style="display:flex;flex-direction:column;gap:var(--space-3);padding-top:var(--space-2);">
          <div style="display:flex;justify-content:space-between;">
            <span style="color:var(--text-secondary);">${t('Total Income')}</span>
            <span class="amount-income" style="font-weight:600;">${formatCurrency(totalIncome)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="color:var(--text-secondary);">${t('Total Spending')}</span>
            <span class="amount-expense" style="font-weight:600;">${formatCurrency(totalSpending)}</span>
          </div>
          <div class="divider"></div>
          <div style="display:flex;justify-content:space-between;">
            <span style="font-weight:600;">${t('Net')}</span>
            <span style="font-weight:700;color:${totalIncome - totalSpending >= 0 ? 'var(--income)' : 'var(--expense)'};">
              ${totalIncome - totalSpending >= 0 ? '+' : ''}${formatCurrency(totalIncome - totalSpending)}
            </span>
          </div>
        </div>
      </div>

      <div class="report-chart">
        <div class="report-chart-title">${t('Top Spending Categories')}</div>
        <div style="display:flex;flex-direction:column;gap:var(--space-3);padding-top:var(--space-2);">
          ${spending.slice(0, 6).map(s => {
            const pct = totalSpending > 0 ? percentage(s.amount, totalSpending) : 0;
            return `
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-1);">
                  <span style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-base);">
                    <i class="ph ${s.icon}" style="color:${s.color};"></i>
                    ${t(s.name)}
                  </span>
                  <span style="font-weight:600;font-variant-numeric:tabular-nums;">${formatCurrency(s.amount)}</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width:${pct}%;background:${s.color};"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  // Bar chart
  const barCanvas = document.getElementById('monthly-bar-chart');
  if (barCanvas) renderBarChart(barCanvas, monthlyData);

  // Donut chart
  const donutCanvas = document.getElementById('report-donut');
  if (donutCanvas) {
    renderDonutChart(donutCanvas, spending.map(s => ({ value: s.amount, color: s.color })), {
      centerText: formatCurrency(totalSpending, { compact: true }),
      centerSubtext: t('Total'),
      lineWidth: 18
    });

    const legend = document.getElementById('report-legend');
    if (legend) {
      legend.innerHTML = spending.slice(0, 5).map(s => `
        <div class="legend-item">
          <div class="legend-dot" style="background:${s.color}"></div>
          <span>${t(s.name)}</span>
        </div>
      `).join('');
    }
  }
}

// ─────────── Categories ───────────
export function categoriesView(container) {
  renderHeader(t('Categories'), [
    { id: 'add-cat-btn', icon: 'ph ph-plus', label: t('Add category'), onClick: () => showCategoryForm() }
  ]);
  hideFab();

  const render = () => {
    const categories = State.getCategories();
    const expenseCats = categories.filter(c => c.type === 'expense');
    const incomeCats = categories.filter(c => c.type === 'income');

    container.innerHTML = `
      <div class="section">
        <div class="section-header">
          <span class="section-title">${t('Expense Categories')}</span>
        </div>
        <div class="categories-grid">
          ${expenseCats.map(c => `
            <div class="category-card" data-id="${c.id}">
              <div class="category-icon" style="background: ${c.color}20; color: ${c.color};">
                <i class="ph ${c.icon}"></i>
              </div>
              <div class="category-name">${t(c.name)}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <span class="section-title">${t('Income Categories')}</span>
        </div>
        <div class="categories-grid">
          ${incomeCats.map(c => `
            <div class="category-card" data-id="${c.id}">
              <div class="category-icon" style="background: ${c.color}20; color: ${c.color};">
                <i class="ph ${c.icon}"></i>
              </div>
              <div class="category-name">${t(c.name)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        const cat = State.getCategories().find(c => c.id === card.dataset.id);
        if (cat) showCategoryForm(cat);
      });
    });
  };

  render();
  const unsubs = [State.subscribe('categories', render)];
  return () => unsubs.forEach(u => u());
}

function showCategoryForm(existing = null) {
  const isEdit = !!existing;
  const icons = ['ph-fork-knife','ph-car','ph-house','ph-film-strip','ph-shopping-bag','ph-heart','ph-lightning','ph-basket','ph-repeat','ph-graduation-cap','ph-airplane','ph-t-shirt','ph-gift','ph-coffee','ph-money','ph-briefcase','ph-chart-line-up','ph-game-controller','ph-paw-print','ph-book','ph-music-notes','ph-phone','ph-desktop','ph-first-aid-kit'];

  showSheet({
    title: isEdit ? t('Edit Category') : t('New Category'),
    content: (container) => {
      container.innerHTML = `
        <div class="input-group">
          <label class="input-label" for="cat-name">${t('Category name')}</label>
          <input class="input" type="text" id="cat-name" value="${existing?.name || ''}" placeholder="${t('Category name')}" />
        </div>
        <div class="input-group">
          <label class="input-label">${t('Type')}</label>
          <div class="tabs" id="cat-type-tabs">
            <button class="tab ${(!existing || existing.type === 'expense') ? 'active' : ''}" data-type="expense">${t('Expense')}</button>
            <button class="tab ${existing?.type === 'income' ? 'active' : ''}" data-type="income">${t('Income')}</button>
          </div>
        </div>
        <div class="input-group">
          <label class="input-label">${t('Icon')}</label>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;max-height:160px;overflow-y:auto;">
            ${icons.map(icon => `
              <button class="btn btn-sm ${existing?.icon === icon ? 'btn-primary' : 'btn-secondary'} cat-icon-btn" data-icon="${icon}" style="width:40px;height:40px;padding:0;">
                <i class="ph ${icon}" style="font-size:18px;"></i>
              </button>
            `).join('')}
          </div>
        </div>
        <div class="input-group">
          <label class="input-label">${t('Color')}</label>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
            ${CATEGORY_COLORS.map(color => `
              <button class="cat-color-btn" data-color="${color}" style="width:32px;height:32px;border-radius:var(--radius-full);background:${color};border:2px solid ${existing?.color === color ? 'var(--text-primary)' : 'transparent'};cursor:pointer;transition:border var(--duration-fast) var(--ease-out);"></button>
            `).join('')}
          </div>
        </div>
        <button class="btn btn-primary btn-full" id="cat-save">${isEdit ? t('Update') : t('Create')}</button>
        ${isEdit ? `<button class="btn btn-danger btn-full" id="cat-delete">${t('Delete')}</button>` : ''}
      `;

      let selectedType = existing?.type || 'expense';
      let selectedIcon = existing?.icon || 'ph-fork-knife';
      let selectedColor = existing?.color || CATEGORY_COLORS[0];

      container.querySelectorAll('#cat-type-tabs .tab').forEach(tab => {
        tab.addEventListener('click', () => {
          container.querySelectorAll('#cat-type-tabs .tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          selectedType = tab.dataset.type;
        });
      });

      container.querySelectorAll('.cat-icon-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.cat-icon-btn').forEach(b => { b.classList.remove('btn-primary'); b.classList.add('btn-secondary'); });
          btn.classList.remove('btn-secondary'); btn.classList.add('btn-primary');
          selectedIcon = btn.dataset.icon;
        });
      });

      container.querySelectorAll('.cat-color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.cat-color-btn').forEach(b => b.style.borderColor = 'transparent');
          btn.style.borderColor = 'var(--text-primary)';
          selectedColor = btn.dataset.color;
        });
      });

      container.querySelector('#cat-save').addEventListener('click', () => {
        const name = container.querySelector('#cat-name').value.trim();
        if (!name) { showToast(t('Enter a name'), 'error'); return; }

        if (isEdit) {
          State.updateCategory(existing.id, { name, type: selectedType, icon: selectedIcon, color: selectedColor });
          showToast(t('Category updated'), 'success');
        } else {
          State.addCategory({ id: generateId(), name, type: selectedType, icon: selectedIcon, color: selectedColor });
          showToast(t('Category created'), 'success');
        }
        closeSheet();
      });

      if (isEdit) {
        container.querySelector('#cat-delete')?.addEventListener('click', () => {
          State.deleteCategory(existing.id);
          closeSheet();
          showToast(t('Category deleted'), 'success');
        });
      }
    }
  });
}

// ─────────── Settings ───────────
export function settingsView(container) {
  renderHeader(t('Settings'));
  hideFab();

  const settings = State.getSettings();

  container.innerHTML = `
    <div class="settings-group">
      <div class="settings-group-title">${t('Preferences')}</div>
      <div class="settings-item" id="set-currency">
        <span class="settings-item-label">${t('Currency')}</span>
        <span class="settings-item-value">${settings.currency} <i class="ph ph-caret-right"></i></span>
      </div>
      <div class="settings-item" id="set-language">
        <span class="settings-item-label">${t('Language')}</span>
        <span class="settings-item-value">${getLanguageName(settings.language)} <i class="ph ph-caret-right"></i></span>
      </div>
    </div>

    <div class="settings-group">
      <div class="settings-group-title">${t('Data')}</div>
      <div class="settings-item" id="set-report">
        <span class="settings-item-label">${t('Download Report')}</span>
        <span class="settings-item-value"><i class="ph ph-file-csv"></i></span>
      </div>
      <div class="settings-item" id="set-export">
        <span class="settings-item-label">${t('Export Data')}</span>
        <span class="settings-item-value"><i class="ph ph-download"></i></span>
      </div>
      <div class="settings-item" id="set-import">
        <span class="settings-item-label">${t('Import Data')}</span>
        <span class="settings-item-value"><i class="ph ph-upload"></i></span>
      </div>
      <div class="settings-item" id="set-reset" style="color: var(--danger);">
        <span class="settings-item-label">${t('Reset All Data')}</span>
        <span class="settings-item-value"><i class="ph ph-trash" style="color:var(--danger);"></i></span>
      </div>
    </div>

    <div class="settings-group">
      <div class="settings-group-title">${t('About')}</div>
      <div class="settings-item">
        <span class="settings-item-label">${t('Version')}</span>
        <span class="settings-item-value">1.0.0</span>
      </div>
      <div class="settings-item">
        <span class="settings-item-label">${t('Built with')}</span>
        <span class="settings-item-value">Vite + Vanilla JS</span>
      </div>
    </div>
  `;

  // Currency setting
  document.getElementById('set-currency')?.addEventListener('click', () => {
    showSheet({
      title: t('Select Currency'),
      content: (ctr) => {
        const currencies = [
          { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
          { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
          { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
          { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
          { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
          { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
          { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
          { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
          { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
          { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', locale: 'ms-MY' },
          { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
          { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', locale: 'id-ID' },
          { code: 'PHP', symbol: '₱', name: 'Philippine Peso', locale: 'en-PH' },
        ];
        ctr.innerHTML = `<div class="list">${currencies.map(c => `
          <div class="list-item currency-pick" data-code="${c.code}" data-symbol="${c.symbol}" data-locale="${c.locale || 'en-US'}">
            <div class="list-item-content">
              <div class="list-item-title">${c.name}</div>
              <div class="list-item-subtitle">${c.code}</div>
            </div>
            ${settings.currency === c.code ? '<i class="ph ph-check" style="color:var(--accent);"></i>' : ''}
          </div>
        `).join('')}</div>`;

        ctr.querySelectorAll('.currency-pick').forEach(item => {
          item.addEventListener('click', () => {
            State.updateSettings({
              currency: item.dataset.code,
              currencySymbol: item.dataset.symbol,
              locale: item.dataset.locale || 'en-US'
            });
            closeSheet();
            showToast(`${t('Currency set to ')}${item.dataset.code}`, 'success');
            // Re-render
            settingsView(container);
          });
        });
      }
    });
  });

  // Language setting
  document.getElementById('set-language')?.addEventListener('click', () => {
    showSheet({
      title: t('Select Language'),
      content: (ctr) => {
        const languages = [
          { code: 'en', name: 'English', subtitle: 'English (US)' },
          { code: 'id', name: 'Bahasa Indonesia', subtitle: 'Bahasa Indonesia (ID)' },
          { code: 'ms', name: 'Bahasa Melayu', subtitle: 'Bahasa Melayu (MY)' },
        ];
        ctr.innerHTML = `<div class="list">${languages.map(l => `
          <div class="list-item language-pick" data-code="${l.code}" data-name="${l.name}">
            <div class="list-item-content">
              <div class="list-item-title">${l.name}</div>
              <div class="list-item-subtitle">${l.subtitle}</div>
            </div>
            ${settings.language === l.code ? '<i class="ph ph-check" style="color:var(--accent);"></i>' : ''}
          </div>
        `).join('')}</div>`;

        ctr.querySelectorAll('.language-pick').forEach(item => {
          item.addEventListener('click', () => {
            const newLang = item.dataset.code;
            State.updateSettings({
              language: newLang
            });
            closeSheet();
            showToast(`${t('Language set to ')}${item.dataset.name}`, 'success');
            renderNav();
            settingsView(container);
            setTimeout(() => window.location.reload(), 600);
          });
        });
      }
    });
  });

  // Download Report (format picker → PDF or XLSX)
  document.getElementById('set-report')?.addEventListener('click', () => {
    showSheet({
      title: t('Download Report'),
      content: (ctr) => {
        ctr.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-2) 0;">
            <div style="font-size:var(--text-sm);color:var(--text-tertiary);text-align:center;margin-bottom:var(--space-1);">
              ${t('Choose a format for your financial report')}
            </div>
            <button class="btn btn-full" id="dl-pdf" style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-4);background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-lg);text-align:left;">
              <div style="width:44px;height:44px;border-radius:var(--radius-md);background:oklch(0.55 0.15 15 / 0.12);color:oklch(0.55 0.15 15);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">
                <i class="ph ph-file-pdf"></i>
              </div>
              <div>
                <div style="font-weight:600;font-size:var(--text-base);color:var(--text-primary);">${t('PDF Report')}</div>
                <div style="font-size:var(--text-xs);color:var(--text-tertiary);margin-top:2px;">${t('Formal financial statement, ready to print')}</div>
              </div>
            </button>
            <button class="btn btn-full" id="dl-xlsx" style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-4);background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-lg);text-align:left;">
              <div style="width:44px;height:44px;border-radius:var(--radius-md);background:oklch(0.55 0.16 155 / 0.12);color:oklch(0.55 0.16 155);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">
                <i class="ph ph-file-xls"></i>
              </div>
              <div>
                <div style="font-weight:600;font-size:var(--text-base);color:var(--text-primary);">${t('Excel Spreadsheet')}</div>
                <div style="font-size:var(--text-xs);color:var(--text-tertiary);margin-top:2px;">${t('Editable workbook with P&L and transactions')}</div>
              </div>
            </button>
          </div>
        `;

        // ── Shared data gathering ──
        function gatherReportData() {
          const transactions = State.getTransactions();
          const categories = State.getCategories();
          const accounts = State.getAccounts();
          const settings = State.getSettings();

          const monthlyMap = {};
          transactions.forEach(tx => {
            const d = new Date(tx.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expenses: 0 };
            if (tx.type === 'deposit') monthlyMap[key].income += tx.amount;
            else if (tx.type === 'withdrawal') monthlyMap[key].expenses += tx.amount;
          });

          const sortedMonths = Object.keys(monthlyMap).sort();
          let totalIncome = 0, totalExpenses = 0;
          const plRows = sortedMonths.map(month => {
            const { income, expenses } = monthlyMap[month];
            totalIncome += income;
            totalExpenses += expenses;
            return { month, income, expenses, net: income - expenses };
          });

          const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
          const txRows = sorted.map(tx => {
            const cat = categories.find(c => c.id === tx.categoryId);
            const acc = accounts.find(a => a.id === (tx.sourceAccountId || tx.destAccountId));
            const dateStr = new Date(tx.date).toLocaleDateString(settings.locale || 'en-US');
            const type = tx.type === 'withdrawal' ? 'Expense' : tx.type === 'deposit' ? 'Income' : 'Transfer';
            const signedAmount = tx.type === 'withdrawal' ? -tx.amount : tx.amount;
            return { date: dateStr, description: tx.description, category: cat?.name || 'Uncategorized', type, amount: signedAmount, account: acc?.name || '' };
          });

          return { plRows, txRows, totalIncome, totalExpenses, net: totalIncome - totalExpenses, currency: settings.currency || 'USD', settings };
        }

        // ── Format helpers ──
        function fmtMoney(val) {
          return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        // ── PDF Generation ──
        ctr.querySelector('#dl-pdf').addEventListener('click', () => {
          closeSheet();
          const data = gatherReportData();
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
          const pageW = doc.internal.pageSize.getWidth();
          const margin = 18;
          const contentW = pageW - margin * 2;
          let y = margin;
          const today = new Date().toLocaleDateString(data.settings.locale || 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });

          // ── Header ──
          doc.setFillColor(22, 24, 32);
          doc.rect(0, 0, pageW, 38, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(22);
          doc.text('BUDGT', margin, 16);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text('Financial Report', margin, 23);
          doc.setFontSize(9);
          doc.setTextColor(180, 180, 190);
          doc.text(`Generated: ${today}`, margin, 30);
          doc.text(`Currency: ${data.currency}`, pageW - margin, 30, { align: 'right' });
          y = 48;

          // ── Divider line helper ──
          function drawLine(yPos) {
            doc.setDrawColor(200, 200, 210);
            doc.setLineWidth(0.3);
            doc.line(margin, yPos, pageW - margin, yPos);
          }

          // ── P&L Section Title ──
          doc.setTextColor(22, 24, 32);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(13);
          doc.text('Profit & Loss Statement', margin, y);
          y += 2;
          drawLine(y + 1);
          y += 6;

          // ── P&L Table ──
          const plHead = [['Period', 'Income', 'Expenses', 'Net Income']];
          const plBody = data.plRows.map(r => [
            r.month,
            fmtMoney(r.income),
            fmtMoney(r.expenses),
            fmtMoney(r.net)
          ]);

          doc.autoTable({
            startY: y,
            head: plHead,
            body: plBody,
            foot: [['TOTAL', fmtMoney(data.totalIncome), fmtMoney(data.totalExpenses), fmtMoney(data.net)]],
            margin: { left: margin, right: margin },
            theme: 'plain',
            styles: {
              fontSize: 9,
              cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
              lineColor: [210, 210, 220],
              lineWidth: 0.25,
              textColor: [40, 40, 50],
              font: 'helvetica',
            },
            headStyles: {
              fillColor: [245, 245, 248],
              textColor: [80, 80, 95],
              fontStyle: 'bold',
              fontSize: 8,
              halign: 'left',
            },
            footStyles: {
              fillColor: [22, 24, 32],
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              fontSize: 9.5,
            },
            columnStyles: {
              0: { halign: 'left', cellWidth: contentW * 0.32 },
              1: { halign: 'right', cellWidth: contentW * 0.22 },
              2: { halign: 'right', cellWidth: contentW * 0.22 },
              3: { halign: 'right', cellWidth: contentW * 0.24 },
            },
            didParseCell: (hookData) => {
              // Color net negative values red in body rows
              if (hookData.section === 'body' && hookData.column.index === 3) {
                const row = data.plRows[hookData.row.index];
                if (row && row.net < 0) {
                  hookData.cell.styles.textColor = [200, 50, 50];
                }
              }
              // Color total net
              if (hookData.section === 'foot' && hookData.column.index === 3) {
                if (data.net < 0) {
                  hookData.cell.styles.textColor = [255, 120, 120];
                } else {
                  hookData.cell.styles.textColor = [120, 230, 170];
                }
              }
            }
          });

          y = doc.lastAutoTable.finalY + 14;

          // ── Summary boxes ──
          const boxW = contentW / 3 - 3;
          const boxH = 20;
          const summaryItems = [
            { label: 'Total Income', value: fmtMoney(data.totalIncome), color: [45, 180, 120] },
            { label: 'Total Expenses', value: fmtMoney(data.totalExpenses), color: [200, 70, 70] },
            { label: 'Net Income', value: fmtMoney(data.net), color: data.net >= 0 ? [45, 180, 120] : [200, 70, 70] },
          ];

          // Check if we need a new page
          if (y + boxH + 20 > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
          }

          summaryItems.forEach((item, i) => {
            const x = margin + i * (boxW + 4.5);
            doc.setFillColor(248, 248, 252);
            doc.roundedRect(x, y, boxW, boxH, 2, 2, 'F');
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(120, 120, 135);
            doc.text(item.label, x + boxW / 2, y + 7, { align: 'center' });
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...item.color);
            doc.text(item.value, x + boxW / 2, y + 15, { align: 'center' });
          });

          y += boxH + 14;

          // ── Transaction Ledger Title ──
          if (y + 10 > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
          }
          doc.setTextColor(22, 24, 32);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(13);
          doc.text('Transaction Ledger', margin, y);
          y += 2;
          drawLine(y + 1);
          y += 6;

          // ── Transactions Table ──
          const txHead = [['Date', 'Description', 'Category', 'Type', 'Amount']];
          const txBody = data.txRows.map(r => [
            r.date,
            r.description,
            r.category,
            r.type,
            fmtMoney(r.amount)
          ]);

          doc.autoTable({
            startY: y,
            head: txHead,
            body: txBody,
            margin: { left: margin, right: margin },
            theme: 'striped',
            styles: {
              fontSize: 8,
              cellPadding: { top: 2.5, right: 3, bottom: 2.5, left: 3 },
              textColor: [40, 40, 50],
              lineColor: [230, 230, 235],
              lineWidth: 0.15,
              font: 'helvetica',
            },
            headStyles: {
              fillColor: [245, 245, 248],
              textColor: [80, 80, 95],
              fontStyle: 'bold',
              fontSize: 7.5,
            },
            alternateRowStyles: {
              fillColor: [252, 252, 254],
            },
            columnStyles: {
              0: { halign: 'left', cellWidth: contentW * 0.15 },
              1: { halign: 'left', cellWidth: contentW * 0.32 },
              2: { halign: 'left', cellWidth: contentW * 0.20 },
              3: { halign: 'center', cellWidth: contentW * 0.13 },
              4: { halign: 'right', cellWidth: contentW * 0.20 },
            },
            didParseCell: (hookData) => {
              if (hookData.section === 'body' && hookData.column.index === 4) {
                const row = data.txRows[hookData.row.index];
                if (row && row.amount < 0) {
                  hookData.cell.styles.textColor = [200, 50, 50];
                } else if (row && row.amount > 0) {
                  hookData.cell.styles.textColor = [45, 150, 100];
                }
              }
            }
          });

          // ── Footer on every page ──
          const pageCount = doc.internal.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            const pageH = doc.internal.pageSize.getHeight();
            doc.setDrawColor(210, 210, 220);
            doc.setLineWidth(0.3);
            doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(150, 150, 165);
            doc.text('Budgt Financial Report — Confidential', margin, pageH - 8);
            doc.text(`Page ${i} of ${pageCount}`, pageW - margin, pageH - 8, { align: 'right' });
          }

          doc.save(`budgt-report-${new Date().toISOString().split('T')[0]}.pdf`);
          showToast(t('PDF report downloaded'), 'success');
        });

        // ── XLSX Generation ──
        ctr.querySelector('#dl-xlsx').addEventListener('click', () => {
          closeSheet();
          const data = gatherReportData();
          const wb = XLSX.utils.book_new();

          // Sheet 1: P&L
          const plHeader = ['Period', 'Income', 'Expenses', 'Net Income'];
          const plData = [
            ['Profit & Loss Statement'],
            ['Generated: ' + new Date().toLocaleDateString(data.settings.locale || 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
            [],
            plHeader,
            ...data.plRows.map(r => [r.month, r.income, r.expenses, r.net]),
            [],
            ['TOTAL', data.totalIncome, data.totalExpenses, data.net]
          ];
          const plSheet = XLSX.utils.aoa_to_sheet(plData);
          // Column widths
          plSheet['!cols'] = [{ wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 16 }];
          XLSX.utils.book_append_sheet(wb, plSheet, 'Profit & Loss');

          // Sheet 2: Transactions
          const txHeader = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Account'];
          const txData = [
            ['Transaction Ledger'],
            [],
            txHeader,
            ...data.txRows.map(r => [r.date, r.description, r.category, r.type, r.amount, r.account])
          ];
          const txSheet = XLSX.utils.aoa_to_sheet(txData);
          txSheet['!cols'] = [{ wch: 14 }, { wch: 30 }, { wch: 18 }, { wch: 10 }, { wch: 14 }, { wch: 20 }];
          XLSX.utils.book_append_sheet(wb, txSheet, 'Transactions');

          XLSX.writeFile(wb, `budgt-report-${new Date().toISOString().split('T')[0]}.xlsx`);
          showToast(t('Excel report downloaded'), 'success');
        });
      }
    });
  });

  // Export
  document.getElementById('set-export')?.addEventListener('click', () => {
    const data = Store.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budgt-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t('Data exported'), 'success');
  });

  // Import
  document.getElementById('set-import')?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          Store.importAll(data);
          showToast(t('Data imported. Reloading...'), 'success');
          setTimeout(() => window.location.reload(), 1000);
        } catch {
          showToast(t('Invalid backup file'), 'error');
        }
      };
      reader.readAsText(file);
    });
    input.click();
  });

  // Reset
  document.getElementById('set-reset')?.addEventListener('click', () => {
    showSheet({
      title: t('Reset All Data'),
      content: (ctr) => {
        ctr.innerHTML = `
          <div style="text-align:center;padding:var(--space-4) 0;">
            <i class="ph ph-warning" style="font-size:48px;color:var(--danger);"></i>
            <p style="color:var(--text-secondary);margin-top:var(--space-3);">${t('This will permanently delete all your data. This action cannot be undone.')}</p>
          </div>
          <button class="btn btn-danger btn-full" id="confirm-reset">${t('Yes, Delete Everything')}</button>
          <button class="btn btn-secondary btn-full" id="cancel-reset">${t('Cancel')}</button>
        `;
        ctr.querySelector('#confirm-reset').addEventListener('click', () => {
          Store.clearAll();
          resetToZero();
          closeSheet();
          showToast(t('All data deleted and reset to 0. Reloading...'), 'success');
          setTimeout(() => window.location.reload(), 1000);
        });
        ctr.querySelector('#cancel-reset').addEventListener('click', () => closeSheet());
      }
    });
  });
}
