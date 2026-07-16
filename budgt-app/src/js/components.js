/* ════════════════════════════════════════════════════
   BUDGT — UI Components
   Nav, Header, FAB, Modal, Toast, Empty State
   ════════════════════════════════════════════════════ */

import { Router } from './router.js';
import { t } from './i18n.js';

// ─────────── Bottom Navigation ───────────
export function renderNav() {
  const nav = document.getElementById('app-nav');
  if (!nav) return;

  const items = [
    { route: '/dashboard',     icon: 'ph ph-house',              iconActive: 'ph-fill ph-house-fill',              label: 'Home' },
    { route: '/transactions',  icon: 'ph ph-list-bullets',       iconActive: 'ph-fill ph-list-bullets-fill',       label: 'Activity' },
    { route: '/budgets',       icon: 'ph ph-chart-pie',          iconActive: 'ph-fill ph-chart-pie-fill',          label: 'Budgets' },
    { route: '/accounts',      icon: 'ph ph-wallet',             iconActive: 'ph-fill ph-wallet-fill',             label: 'Accounts' },
    { route: '/more',          icon: 'ph ph-dots-three-circle',  iconActive: 'ph-fill ph-dots-three-circle-fill',  label: 'More' },
  ];

  nav.className = 'bottom-nav';
  nav.innerHTML = items.map(item => `
    <button class="nav-item" data-route="${item.route}" aria-label="${t(item.label)}">
      <i class="${item.icon}"></i>
      <span>${t(item.label)}</span>
    </button>
  `).join('');

  nav.addEventListener('click', (e) => {
    const navItem = e.target.closest('.nav-item');
    if (!navItem) return;
    const route = navItem.dataset.route;
    Router.navigate('#' + route);

    // Update active state (color change via CSS, icon stays the same)
    nav.querySelectorAll('.nav-item').forEach(ni => {
      const r = ni.dataset.route;
      if (route === r) {
        ni.classList.add('active');
      } else {
        ni.classList.remove('active');
      }
    });
  });
}

// ─────────── Header ───────────
export function renderHeader(title, actions = []) {
  const header = document.getElementById('app-header');
  if (!header) return;

  header.className = 'app-header';
  header.innerHTML = `
    <h1 class="header-title">${title}</h1>
    <div class="header-actions">
      ${actions.map(a => `
        <button class="btn-icon btn-ghost" id="${a.id || ''}" aria-label="${a.label || ''}">
          <i class="${a.icon}"></i>
        </button>
      `).join('')}
    </div>
  `;

  // Attach action handlers
  actions.forEach(a => {
    if (a.id && a.onClick) {
      const btn = document.getElementById(a.id);
      if (btn) btn.addEventListener('click', a.onClick);
    }
  });
}

// ─────────── FAB ───────────
export function renderFab(onClick) {
  const fabRoot = document.getElementById('app-fab');
  if (!fabRoot) return;

  fabRoot.innerHTML = `
    <button class="fab" id="main-fab" aria-label="Add transaction">
      <i class="ph-bold ph-plus"></i>
    </button>
  `;

  document.getElementById('main-fab').addEventListener('click', onClick);
}

export function hideFab() {
  const fabRoot = document.getElementById('app-fab');
  if (fabRoot) fabRoot.innerHTML = '';
}

// ─────────── Bottom Sheet Modal ───────────
let activeSheet = null;

export function showSheet(options) {
  const { title, content, onClose } = options;
  const root = document.getElementById('modal-root');
  if (!root) return;

  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'sheet-backdrop';

  // Create sheet
  const sheet = document.createElement('div');
  sheet.className = 'sheet';
  sheet.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-header">
      <span class="sheet-title">${title}</span>
      <button class="btn-icon btn-ghost sheet-close" aria-label="Close">
        <i class="ph ph-x"></i>
      </button>
    </div>
    <div class="sheet-body" id="sheet-content"></div>
  `;

  root.appendChild(backdrop);
  root.appendChild(sheet);

  // Insert content
  const contentEl = sheet.querySelector('#sheet-content');
  if (typeof content === 'string') {
    contentEl.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    contentEl.appendChild(content);
  } else if (typeof content === 'function') {
    content(contentEl);
  }

  // Animate in
  requestAnimationFrame(() => {
    backdrop.classList.add('active');
    sheet.classList.add('active');
  });

  // Close handler
  const close = () => {
    sheet.classList.remove('active');
    backdrop.classList.remove('active');
    setTimeout(() => {
      backdrop.remove();
      sheet.remove();
      activeSheet = null;
      if (onClose) onClose();
    }, 350);
  };

  backdrop.addEventListener('click', close);
  sheet.querySelector('.sheet-close').addEventListener('click', close);

  // Swipe down to dismiss
  let startY = 0;
  let currentY = 0;
  let isDragging = false;

  const handle = sheet.querySelector('.sheet-handle');
  handle.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    isDragging = true;
    sheet.style.transition = 'none';
  });

  handle.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentY = e.touches[0].clientY - startY;
    if (currentY > 0) {
      sheet.style.transform = `translateY(${currentY}px)`;
    }
  });

  handle.addEventListener('touchend', () => {
    isDragging = false;
    sheet.style.transition = '';
    if (currentY > 100) {
      close();
    } else {
      sheet.style.transform = '';
    }
    currentY = 0;
  });

  activeSheet = { sheet, backdrop, close };
  return { close, contentEl };
}

export function closeSheet() {
  if (activeSheet) activeSheet.close();
}

// ─────────── Toast Notifications ───────────
export function showToast(message, type = 'default', duration = 3000) {
  const container = document.getElementById('toast-root');
  if (!container) return;

  container.className = 'toast-container';

  const toast = document.createElement('div');
  toast.className = `toast ${type !== 'default' ? 'toast-' + type : ''}`;
  toast.innerHTML = `
    <i class="ph ${type === 'success' ? 'ph-check-circle' : type === 'error' ? 'ph-warning-circle' : 'ph-info'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 200);
  }, duration);
}

// ─────────── Empty State ───────────
export function emptyState(icon, title, description, actionLabel, onAction) {
  const html = `
    <div class="empty-state">
      <i class="ph ${icon} empty-state-icon"></i>
      <div class="empty-state-title">${title}</div>
      <div class="empty-state-desc">${description}</div>
      ${actionLabel ? `<button class="btn btn-primary btn-sm empty-state-action">${actionLabel}</button>` : ''}
    </div>
  `;

  // Return HTML string, attach handler after insertion
  return { html, attachHandler: (container) => {
    if (actionLabel && onAction) {
      const btn = container.querySelector('.empty-state-action');
      if (btn) btn.addEventListener('click', onAction);
    }
  }};
}

// ─────────── Transaction Form (used in modal) ───────────
import { State } from './state.js';
import { generateId, formatCurrency, CATEGORY_COLORS } from './utils.js';

export function showTransactionForm(existingTx = null) {
  const categories = State.getCategories();
  const accounts = State.getAssetAccounts();
  const isEdit = !!existingTx;

  const today = new Date().toISOString().split('T')[0];

  const formContent = (container) => {
    container.innerHTML = `
      <div class="tabs" id="tx-type-tabs">
        <button class="tab ${(!existingTx || existingTx.type === 'withdrawal') ? 'active' : ''}" data-type="withdrawal">${t('Expense')}</button>
        <button class="tab ${existingTx?.type === 'deposit' ? 'active' : ''}" data-type="deposit">${t('Income')}</button>
        <button class="tab ${existingTx?.type === 'transfer' ? 'active' : ''}" data-type="transfer">${t('Transfer')}</button>
      </div>

      <div class="input-group">
        <label class="input-label" for="tx-amount">${t('Amount')}</label>
        <input class="input" type="number" id="tx-amount" placeholder="0.00" step="0.01" min="0"
               value="${existingTx?.amount || ''}" inputmode="decimal" />
      </div>

      <div class="input-group">
        <label class="input-label" for="tx-desc">${t('Description')}</label>
        <input class="input" type="text" id="tx-desc" placeholder="${t('What was this for?')}"
               value="${existingTx?.description || ''}" />
      </div>

      <div class="input-group" id="tx-category-group">
        <label class="input-label" for="tx-category">${t('Category')}</label>
        <div class="select-wrapper">
          <select class="input" id="tx-category">
            <option value="">${t('Select category')}</option>
            ${categories.map(c => `
              <option value="${c.id}" ${existingTx?.categoryId === c.id ? 'selected' : ''}>${t(c.name)}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <div class="input-group" id="tx-source-group">
        <label class="input-label" for="tx-source">${t('From Account')}</label>
        <div class="select-wrapper">
          <select class="input" id="tx-source">
            ${accounts.map(a => `
              <option value="${a.id}" ${existingTx?.sourceAccountId === a.id ? 'selected' : ''}>${t(a.name)}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <div class="input-group" id="tx-dest-group" style="display: none;">
        <label class="input-label" for="tx-dest">${t('To Account')}</label>
        <div class="select-wrapper">
          <select class="input" id="tx-dest">
            ${accounts.map(a => `
              <option value="${a.id}" ${existingTx?.destAccountId === a.id ? 'selected' : ''}>${t(a.name)}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <div class="input-group">
        <label class="input-label" for="tx-date">${t('Date')}</label>
        <input class="input" type="date" id="tx-date" value="${existingTx ? existingTx.date.split('T')[0] : today}" />
      </div>

      <div class="input-group">
        <label class="input-label" for="tx-notes">${t('Notes')}</label>
        <input class="input" type="text" id="tx-notes" placeholder="${t('Optional notes')}"
               value="${existingTx?.notes || ''}" />
      </div>

      <button class="btn btn-primary btn-full" id="tx-save">
        ${isEdit ? t('Update Transaction') : t('Add Transaction')}
      </button>

      ${isEdit ? `<button class="btn btn-danger btn-full" id="tx-delete">${t('Delete Transaction')}</button>` : ''}
    `;

    // Type tab switching
    let selectedType = existingTx?.type || 'withdrawal';
    const tabs = container.querySelectorAll('#tx-type-tabs .tab');
    const sourceGroup = container.querySelector('#tx-source-group');
    const destGroup = container.querySelector('#tx-dest-group');
    const categoryGroup = container.querySelector('#tx-category-group');

    function updateFormForType(type) {
      selectedType = type;
      tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.type === type));

      sourceGroup.style.display = (type === 'withdrawal' || type === 'transfer') ? '' : 'none';
      destGroup.style.display = (type === 'deposit' || type === 'transfer') ? '' : 'none';
      categoryGroup.style.display = type === 'transfer' ? 'none' : '';

      // Update source label
      const sourceLabel = sourceGroup.querySelector('.input-label');
      sourceLabel.textContent = type === 'transfer' ? t('From Account') : t('Account');
    }

    updateFormForType(selectedType);

    tabs.forEach(tab => {
      tab.addEventListener('click', () => updateFormForType(tab.dataset.type));
    });

    // Save handler
    container.querySelector('#tx-save').addEventListener('click', () => {
      const amount = parseFloat(container.querySelector('#tx-amount').value);
      const description = container.querySelector('#tx-desc').value.trim();

      if (!amount || amount <= 0) {
        showToast(t('Please enter a valid amount'), 'error');
        return;
      }
      if (!description) {
        showToast(t('Please enter a description'), 'error');
        return;
      }

      const tx = {
        id: existingTx?.id || generateId(),
        type: selectedType,
        amount,
        description,
        categoryId: selectedType === 'transfer' ? null : container.querySelector('#tx-category').value || null,
        sourceAccountId: (selectedType === 'withdrawal' || selectedType === 'transfer')
          ? container.querySelector('#tx-source').value : null,
        destAccountId: (selectedType === 'deposit' || selectedType === 'transfer')
          ? container.querySelector('#tx-dest').value : null,
        date: new Date(container.querySelector('#tx-date').value).toISOString(),
        notes: container.querySelector('#tx-notes').value.trim(),
        tags: [],
        createdAt: existingTx?.createdAt || new Date().toISOString(),
      };

      if (isEdit) {
        // Delete old and add new (to recalculate balances)
        State.deleteTransaction(existingTx.id);
      }
      State.addTransaction(tx);
      closeSheet();
      showToast(isEdit ? t('Transaction updated') : t('Transaction added'), 'success');
    });

    // Delete handler
    if (isEdit) {
      container.querySelector('#tx-delete').addEventListener('click', () => {
        State.deleteTransaction(existingTx.id);
        closeSheet();
        showToast(t('Transaction deleted'), 'success');
      });
    }
  };

  showSheet({
    title: isEdit ? t('Update Transaction') : t('Add Transaction'),
    content: formContent
  });
}
