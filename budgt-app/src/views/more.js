/* ════════════════════════════════════════════════════
   BUDGT — More View (Piggy Banks, Bills, Reports, 
   Categories, Settings)
   ════════════════════════════════════════════════════ */

import { State } from '../js/state.js';
import { Store } from '../js/store.js';
import { formatCurrency, formatDate, percentage, generateId, CATEGORY_COLORS } from '../js/utils.js';
import { renderHeader, hideFab, showSheet, closeSheet, showToast } from '../js/components.js';
import { renderBarChart, renderDonutChart } from '../js/charts.js';
import { resetToZero } from '../js/seed.js';

export function moreView(container) {
  renderHeader('More');
  hideFab();

  container.innerHTML = `
    <div class="list" style="padding-top: var(--space-2);">
      <div class="list-item" data-page="piggybanks">
        <div class="list-item-icon" style="background: var(--accent-muted); color: var(--accent);">
          <i class="ph ph-piggy-bank"></i>
        </div>
        <div class="list-item-content">
          <div class="list-item-title">Piggy Banks</div>
          <div class="list-item-subtitle">Savings goals</div>
        </div>
        <i class="ph ph-caret-right" style="color:var(--text-tertiary);"></i>
      </div>

      <div class="list-item" data-page="bills">
        <div class="list-item-icon" style="background: var(--warning-muted); color: var(--warning);">
          <i class="ph ph-receipt"></i>
        </div>
        <div class="list-item-content">
          <div class="list-item-title">Bills</div>
          <div class="list-item-subtitle">Recurring payments</div>
        </div>
        <i class="ph ph-caret-right" style="color:var(--text-tertiary);"></i>
      </div>

      <div class="list-item" data-page="reports">
        <div class="list-item-icon" style="background: var(--income-muted); color: var(--income);">
          <i class="ph ph-chart-bar"></i>
        </div>
        <div class="list-item-content">
          <div class="list-item-title">Reports</div>
          <div class="list-item-subtitle">Spending analytics</div>
        </div>
        <i class="ph ph-caret-right" style="color:var(--text-tertiary);"></i>
      </div>

      <div class="list-item" data-page="categories">
        <div class="list-item-icon" style="background: var(--transfer-muted); color: var(--transfer);">
          <i class="ph ph-tag"></i>
        </div>
        <div class="list-item-content">
          <div class="list-item-title">Categories</div>
          <div class="list-item-subtitle">Manage transaction categories</div>
        </div>
        <i class="ph ph-caret-right" style="color:var(--text-tertiary);"></i>
      </div>

      <div class="divider" style="margin: var(--space-2) var(--space-4);"></div>

      <div class="list-item" data-page="settings">
        <div class="list-item-icon" style="background: var(--bg-elevated); color: var(--text-secondary);">
          <i class="ph ph-gear"></i>
        </div>
        <div class="list-item-content">
          <div class="list-item-title">Settings</div>
          <div class="list-item-subtitle">Currency, data management</div>
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
  renderHeader('Piggy Banks', [
    { id: 'add-piggy-btn', icon: 'ph ph-plus', label: 'Add piggy bank', onClick: () => showPiggyForm() }
  ]);
  hideFab();

  const render = () => {
    const piggies = State.getPiggyBanks();

    container.innerHTML = `
      <div class="piggybanks-list">
        ${piggies.length === 0 ? `
          <div class="empty-state">
            <i class="ph ph-piggy-bank empty-state-icon"></i>
            <div class="empty-state-title">No savings goals</div>
            <div class="empty-state-desc">Create a piggy bank to start saving toward a goal</div>
            <button class="btn btn-primary btn-sm" id="empty-add-piggy">Create Goal</button>
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
                  <div class="piggy-target">Goal: ${formatCurrency(p.targetAmount)}</div>
                </div>
              </div>
              <div class="piggy-amount">
                <span class="piggy-current">${formatCurrency(p.currentAmount)}</span>
                <span class="piggy-percentage">${pct}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min(pct, 100)}%;"></div>
              </div>
              ${p.targetDate ? `<div style="font-size:var(--text-xs);color:var(--text-tertiary);">Target: ${formatDate(p.targetDate, 'medium')}</div>` : ''}
              <div class="piggy-actions">
                <button class="btn btn-sm btn-secondary piggy-add-funds" data-id="${p.id}">
                  <i class="ph ph-plus"></i> Add Funds
                </button>
                <button class="btn btn-sm btn-ghost piggy-edit" data-id="${p.id}">
                  <i class="ph ph-pencil"></i> Edit
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
    title: `Add to "${piggy.name}"`,
    content: (container) => {
      const remaining = piggy.targetAmount - piggy.currentAmount;
      container.innerHTML = `
        <div style="text-align:center;margin-bottom:var(--space-2);">
          <div style="font-size:var(--text-sm);color:var(--text-tertiary);">Remaining</div>
          <div style="font-size:var(--text-xl);font-weight:700;">${formatCurrency(remaining)}</div>
        </div>
        <div class="input-group">
          <label class="input-label" for="fund-amount">Amount to Add</label>
          <input class="input" type="number" id="fund-amount" placeholder="0.00" step="0.01" min="0" inputmode="decimal" />
        </div>
        <button class="btn btn-primary btn-full" id="fund-save">Add Funds</button>
      `;

      container.querySelector('#fund-save').addEventListener('click', () => {
        const amount = parseFloat(container.querySelector('#fund-amount').value);
        if (!amount || amount <= 0) {
          showToast('Enter a valid amount', 'error');
          return;
        }
        State.updatePiggyBank(piggy.id, { currentAmount: piggy.currentAmount + amount });
        closeSheet();
        showToast(`${formatCurrency(amount)} added to ${piggy.name}`, 'success');
      });
    }
  });
}

function showPiggyForm(existing = null) {
  const isEdit = !!existing;
  showSheet({
    title: isEdit ? 'Edit Savings Goal' : 'New Savings Goal',
    content: (container) => {
      container.innerHTML = `
        <div class="input-group">
          <label class="input-label" for="pig-name">Name</label>
          <input class="input" type="text" id="pig-name" placeholder="e.g. Vacation Fund" value="${existing?.name || ''}" />
        </div>
        <div class="input-group">
          <label class="input-label" for="pig-target">Target Amount</label>
          <input class="input" type="number" id="pig-target" placeholder="0.00" step="0.01" min="0"
                 value="${existing?.targetAmount || ''}" inputmode="decimal" />
        </div>
        <div class="input-group">
          <label class="input-label" for="pig-current">${isEdit ? 'Current' : 'Starting'} Amount</label>
          <input class="input" type="number" id="pig-current" placeholder="0.00" step="0.01" min="0"
                 value="${existing?.currentAmount ?? '0'}" inputmode="decimal" />
        </div>
        <div class="input-group">
          <label class="input-label" for="pig-date">Target Date (optional)</label>
          <input class="input" type="date" id="pig-date" value="${existing?.targetDate ? existing.targetDate.split('T')[0] : ''}" />
        </div>
        <button class="btn btn-primary btn-full" id="pig-save">${isEdit ? 'Update' : 'Create'}</button>
        ${isEdit ? '<button class="btn btn-danger btn-full" id="pig-delete">Delete</button>' : ''}
      `;

      container.querySelector('#pig-save').addEventListener('click', () => {
        const name = container.querySelector('#pig-name').value.trim();
        const targetAmount = parseFloat(container.querySelector('#pig-target').value);
        const currentAmount = parseFloat(container.querySelector('#pig-current').value) || 0;
        const targetDate = container.querySelector('#pig-date').value;

        if (!name) { showToast('Enter a name', 'error'); return; }
        if (!targetAmount || targetAmount <= 0) { showToast('Enter a target amount', 'error'); return; }

        if (isEdit) {
          State.updatePiggyBank(existing.id, { name, targetAmount, currentAmount, targetDate: targetDate ? new Date(targetDate).toISOString() : null });
          showToast('Goal updated', 'success');
        } else {
          State.addPiggyBank({ id: generateId(), name, targetAmount, currentAmount, icon: 'ph-piggy-bank', targetDate: targetDate ? new Date(targetDate).toISOString() : null, accountId: null });
          showToast('Goal created', 'success');
        }
        closeSheet();
      });

      if (isEdit) {
        container.querySelector('#pig-delete').addEventListener('click', () => {
          State.deletePiggyBank(existing.id);
          closeSheet();
          showToast('Goal deleted', 'success');
        });
      }
    }
  });
}

// ─────────── Bills ───────────
export function billsView(container) {
  renderHeader('Bills', [
    { id: 'add-bill-btn', icon: 'ph ph-plus', label: 'Add bill', onClick: () => showBillForm() }
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
        <div style="font-size:var(--text-sm);color:var(--text-tertiary);">Monthly Bills</div>
        <div style="font-size:var(--text-2xl);font-weight:700;font-variant-numeric:tabular-nums;">${formatCurrency(monthlyTotal)}</div>
      </div>

      <div class="bills-list">
        ${bills.length === 0 ? `
          <div class="empty-state">
            <i class="ph ph-receipt empty-state-icon"></i>
            <div class="empty-state-title">No bills tracked</div>
            <div class="empty-state-desc">Add recurring bills to keep track of upcoming payments</div>
            <button class="btn btn-primary btn-sm" id="empty-add-bill">Add Bill</button>
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
                <div class="bill-meta">${b.frequency} · ${b.autoPay ? 'Auto-pay' : 'Manual'}</div>
              </div>
              <div class="bill-trailing">
                <div class="bill-amount">${formatCurrency(b.amount)}</div>
                <div class="bill-status ${isPaid ? 'paid' : isOverdue ? 'overdue' : isDueSoon ? 'due' : ''}">
                  ${isPaid ? 'Paid' : isOverdue ? 'Overdue' : isDueSoon ? `Due in ${daysUntilDue}d` : `Due ${formatDate(b.nextDueDate, 'dayMonth')}`}
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
    title: isEdit ? 'Edit Bill' : 'New Bill',
    content: (container) => {
      container.innerHTML = `
        <div class="input-group">
          <label class="input-label" for="bill-name">Name</label>
          <input class="input" type="text" id="bill-name" placeholder="e.g. Netflix" value="${existing?.name || ''}" />
        </div>
        <div class="input-group">
          <label class="input-label" for="bill-amount">Amount</label>
          <input class="input" type="number" id="bill-amount" placeholder="0.00" step="0.01" min="0"
                 value="${existing?.amount || ''}" inputmode="decimal" />
        </div>
        <div class="input-group">
          <label class="input-label" for="bill-cat">Category</label>
          <div class="select-wrapper">
            <select class="input" id="bill-cat">
              <option value="">None</option>
              ${categories.map(c => `<option value="${c.id}" ${existing?.categoryId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="input-group">
          <label class="input-label" for="bill-freq">Frequency</label>
          <div class="select-wrapper">
            <select class="input" id="bill-freq">
              <option value="monthly" ${existing?.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
              <option value="weekly" ${existing?.frequency === 'weekly' ? 'selected' : ''}>Weekly</option>
              <option value="yearly" ${existing?.frequency === 'yearly' ? 'selected' : ''}>Yearly</option>
            </select>
          </div>
        </div>
        <div class="input-group">
          <label class="input-label" for="bill-due">Next Due Date</label>
          <input class="input" type="date" id="bill-due" value="${existing?.nextDueDate ? existing.nextDueDate.split('T')[0] : ''}" />
        </div>
        <button class="btn btn-primary btn-full" id="bill-save">${isEdit ? 'Update' : 'Add'} Bill</button>
        ${isEdit ? `
          <button class="btn btn-secondary btn-full" id="bill-mark-paid">Mark as Paid</button>
          <button class="btn btn-danger btn-full" id="bill-delete">Delete Bill</button>
        ` : ''}
      `;

      container.querySelector('#bill-save').addEventListener('click', () => {
        const name = container.querySelector('#bill-name').value.trim();
        const amount = parseFloat(container.querySelector('#bill-amount').value);
        if (!name) { showToast('Enter a name', 'error'); return; }
        if (!amount || amount <= 0) { showToast('Enter an amount', 'error'); return; }

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
          showToast('Bill updated', 'success');
        } else {
          State.addBill({ id: generateId(), ...data, lastPaidDate: null });
          showToast('Bill added', 'success');
        }
        closeSheet();
      });

      if (isEdit) {
        container.querySelector('#bill-mark-paid')?.addEventListener('click', () => {
          State.updateBill(existing.id, { lastPaidDate: new Date().toISOString() });
          closeSheet();
          showToast(`${existing.name} marked as paid`, 'success');
        });
        container.querySelector('#bill-delete')?.addEventListener('click', () => {
          State.deleteBill(existing.id);
          closeSheet();
          showToast('Bill deleted', 'success');
        });
      }
    }
  });
}

// ─────────── Reports ───────────
export function reportsView(container) {
  renderHeader('Reports');
  hideFab();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const spending = State.getSpendingByCategory(year, month);
  const totalSpending = spending.reduce((s, c) => s + c.amount, 0);
  const totalIncome = State.getMonthlyIncome(year, month);

  // Last 6 months data for bar chart
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - i, 1);
    const mSpending = State.getMonthlySpending(d.getFullYear(), d.getMonth());
    monthlyData.push({
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      value: mSpending,
      color: i === 0 ? 'oklch(0.72 0.15 185)' : 'oklch(0.35 0.008 260)'
    });
  }

  container.innerHTML = `
    <div class="report-section">
      <div class="report-chart">
        <div class="report-chart-title">Monthly Spending Trend</div>
        <canvas id="monthly-bar-chart" style="width:100%;height:200px;"></canvas>
      </div>

      <div class="report-chart">
        <div class="report-chart-title">Category Breakdown</div>
        <canvas id="report-donut" style="width:100%;height:200px;"></canvas>
        <div class="report-legend" id="report-legend"></div>
      </div>

      <div class="report-chart">
        <div class="report-chart-title">Summary</div>
        <div style="display:flex;flex-direction:column;gap:var(--space-3);padding-top:var(--space-2);">
          <div style="display:flex;justify-content:space-between;">
            <span style="color:var(--text-secondary);">Total Income</span>
            <span class="amount-income" style="font-weight:600;">${formatCurrency(totalIncome)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="color:var(--text-secondary);">Total Spending</span>
            <span class="amount-expense" style="font-weight:600;">${formatCurrency(totalSpending)}</span>
          </div>
          <div class="divider"></div>
          <div style="display:flex;justify-content:space-between;">
            <span style="font-weight:600;">Net</span>
            <span style="font-weight:700;color:${totalIncome - totalSpending >= 0 ? 'var(--income)' : 'var(--expense)'};">
              ${totalIncome - totalSpending >= 0 ? '+' : ''}${formatCurrency(totalIncome - totalSpending)}
            </span>
          </div>
        </div>
      </div>

      <div class="report-chart">
        <div class="report-chart-title">Top Spending Categories</div>
        <div style="display:flex;flex-direction:column;gap:var(--space-3);padding-top:var(--space-2);">
          ${spending.slice(0, 6).map(s => {
            const pct = totalSpending > 0 ? percentage(s.amount, totalSpending) : 0;
            return `
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-1);">
                  <span style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-base);">
                    <i class="ph ${s.icon}" style="color:${s.color};"></i>
                    ${s.name}
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
      centerSubtext: 'Total',
      lineWidth: 18
    });

    const legend = document.getElementById('report-legend');
    if (legend) {
      legend.innerHTML = spending.slice(0, 5).map(s => `
        <div class="legend-item">
          <div class="legend-dot" style="background:${s.color}"></div>
          <span>${s.name}</span>
        </div>
      `).join('');
    }
  }
}

// ─────────── Categories ───────────
export function categoriesView(container) {
  renderHeader('Categories', [
    { id: 'add-cat-btn', icon: 'ph ph-plus', label: 'Add category', onClick: () => showCategoryForm() }
  ]);
  hideFab();

  const render = () => {
    const categories = State.getCategories();
    const expenseCats = categories.filter(c => c.type === 'expense');
    const incomeCats = categories.filter(c => c.type === 'income');

    container.innerHTML = `
      <div class="section">
        <div class="section-header">
          <span class="section-title">Expense Categories</span>
        </div>
        <div class="categories-grid">
          ${expenseCats.map(c => `
            <div class="category-card" data-id="${c.id}">
              <div class="category-icon" style="background: ${c.color}20; color: ${c.color};">
                <i class="ph ${c.icon}"></i>
              </div>
              <div class="category-name">${c.name}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <span class="section-title">Income Categories</span>
        </div>
        <div class="categories-grid">
          ${incomeCats.map(c => `
            <div class="category-card" data-id="${c.id}">
              <div class="category-icon" style="background: ${c.color}20; color: ${c.color};">
                <i class="ph ${c.icon}"></i>
              </div>
              <div class="category-name">${c.name}</div>
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
    title: isEdit ? 'Edit Category' : 'New Category',
    content: (container) => {
      container.innerHTML = `
        <div class="input-group">
          <label class="input-label" for="cat-name">Name</label>
          <input class="input" type="text" id="cat-name" value="${existing?.name || ''}" placeholder="Category name" />
        </div>
        <div class="input-group">
          <label class="input-label">Type</label>
          <div class="tabs" id="cat-type-tabs">
            <button class="tab ${(!existing || existing.type === 'expense') ? 'active' : ''}" data-type="expense">Expense</button>
            <button class="tab ${existing?.type === 'income' ? 'active' : ''}" data-type="income">Income</button>
          </div>
        </div>
        <div class="input-group">
          <label class="input-label">Icon</label>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;max-height:160px;overflow-y:auto;">
            ${icons.map(icon => `
              <button class="btn btn-sm ${existing?.icon === icon ? 'btn-primary' : 'btn-secondary'} cat-icon-btn" data-icon="${icon}" style="width:40px;height:40px;padding:0;">
                <i class="ph ${icon}" style="font-size:18px;"></i>
              </button>
            `).join('')}
          </div>
        </div>
        <div class="input-group">
          <label class="input-label">Color</label>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
            ${CATEGORY_COLORS.map(color => `
              <button class="cat-color-btn" data-color="${color}" style="width:32px;height:32px;border-radius:var(--radius-full);background:${color};border:2px solid ${existing?.color === color ? 'var(--text-primary)' : 'transparent'};cursor:pointer;transition:border var(--duration-fast) var(--ease-out);"></button>
            `).join('')}
          </div>
        </div>
        <button class="btn btn-primary btn-full" id="cat-save">${isEdit ? 'Update' : 'Create'}</button>
        ${isEdit ? '<button class="btn btn-danger btn-full" id="cat-delete">Delete</button>' : ''}
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
        if (!name) { showToast('Enter a name', 'error'); return; }

        if (isEdit) {
          State.updateCategory(existing.id, { name, type: selectedType, icon: selectedIcon, color: selectedColor });
          showToast('Category updated', 'success');
        } else {
          State.addCategory({ id: generateId(), name, type: selectedType, icon: selectedIcon, color: selectedColor });
          showToast('Category created', 'success');
        }
        closeSheet();
      });

      if (isEdit) {
        container.querySelector('#cat-delete')?.addEventListener('click', () => {
          State.deleteCategory(existing.id);
          closeSheet();
          showToast('Category deleted', 'success');
        });
      }
    }
  });
}

// ─────────── Settings ───────────
export function settingsView(container) {
  renderHeader('Settings');
  hideFab();

  const settings = State.getSettings();

  container.innerHTML = `
    <div class="settings-group">
      <div class="settings-group-title">Preferences</div>
      <div class="settings-item" id="set-currency">
        <span class="settings-item-label">Currency</span>
        <span class="settings-item-value">${settings.currency} <i class="ph ph-caret-right"></i></span>
      </div>
    </div>

    <div class="settings-group">
      <div class="settings-group-title">Data</div>
      <div class="settings-item" id="set-export">
        <span class="settings-item-label">Export Data</span>
        <span class="settings-item-value"><i class="ph ph-download"></i></span>
      </div>
      <div class="settings-item" id="set-import">
        <span class="settings-item-label">Import Data</span>
        <span class="settings-item-value"><i class="ph ph-upload"></i></span>
      </div>
      <div class="settings-item" id="set-reset" style="color: var(--danger);">
        <span class="settings-item-label">Reset All Data</span>
        <span class="settings-item-value"><i class="ph ph-trash" style="color:var(--danger);"></i></span>
      </div>
    </div>

    <div class="settings-group">
      <div class="settings-group-title">About</div>
      <div class="settings-item">
        <span class="settings-item-label">Version</span>
        <span class="settings-item-value">1.0.0</span>
      </div>
      <div class="settings-item">
        <span class="settings-item-label">Built with</span>
        <span class="settings-item-value">Vite + Vanilla JS</span>
      </div>
    </div>
  `;

  // Currency setting
  document.getElementById('set-currency')?.addEventListener('click', () => {
    showSheet({
      title: 'Select Currency',
      content: (ctr) => {
        const currencies = [
          { code: 'USD', symbol: '$', name: 'US Dollar' },
          { code: 'EUR', symbol: '€', name: 'Euro' },
          { code: 'GBP', symbol: '£', name: 'British Pound' },
          { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
          { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
          { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
          { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
          { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
          { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
          { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
          { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
          { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
        ];
        ctr.innerHTML = `<div class="list">${currencies.map(c => `
          <div class="list-item currency-pick" data-code="${c.code}" data-symbol="${c.symbol}">
            <div class="list-item-content">
              <div class="list-item-title">${c.name}</div>
              <div class="list-item-subtitle">${c.code}</div>
            </div>
            ${settings.currency === c.code ? '<i class="ph ph-check" style="color:var(--accent);"></i>' : ''}
          </div>
        `).join('')}</div>`;

        ctr.querySelectorAll('.currency-pick').forEach(item => {
          item.addEventListener('click', () => {
            State.updateSettings({ currency: item.dataset.code, currencySymbol: item.dataset.symbol });
            closeSheet();
            showToast(`Currency set to ${item.dataset.code}`, 'success');
            // Re-render
            settingsView(container);
          });
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
    showToast('Data exported', 'success');
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
          showToast('Data imported. Reloading...', 'success');
          setTimeout(() => window.location.reload(), 1000);
        } catch {
          showToast('Invalid backup file', 'error');
        }
      };
      reader.readAsText(file);
    });
    input.click();
  });

  // Reset
  document.getElementById('set-reset')?.addEventListener('click', () => {
    showSheet({
      title: 'Reset All Data',
      content: (ctr) => {
        ctr.innerHTML = `
          <div style="text-align:center;padding:var(--space-4) 0;">
            <i class="ph ph-warning" style="font-size:48px;color:var(--danger);"></i>
            <p style="color:var(--text-secondary);margin-top:var(--space-3);">This will permanently delete all your data. This action cannot be undone.</p>
          </div>
          <button class="btn btn-danger btn-full" id="confirm-reset">Yes, Delete Everything</button>
          <button class="btn btn-secondary btn-full" id="cancel-reset">Cancel</button>
        `;
        ctr.querySelector('#confirm-reset').addEventListener('click', () => {
          Store.clearAll();
          resetToZero();
          closeSheet();
          showToast('All data deleted and reset to 0. Reloading...', 'success');
          setTimeout(() => window.location.reload(), 1000);
        });
        ctr.querySelector('#cancel-reset').addEventListener('click', () => closeSheet());
      }
    });
  });
}
