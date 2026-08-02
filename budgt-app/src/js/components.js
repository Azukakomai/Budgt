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

  const currentRoute = (window.location.hash || '#/dashboard').replace('#', '');

  const leftItems = [
    { route: '/dashboard',    icon: 'ph ph-house',         label: 'Home' },
    { route: '/transactions', icon: 'ph ph-calendar-blank', label: 'Activity' },
  ];

  const rightItems = [
    { route: '/accounts',     icon: 'ph ph-wallet',        label: 'Accounts' },
    { route: '/budgets',      icon: 'ph ph-chart-pie',     label: 'Budgets' },
  ];

  nav.className = 'bottom-nav';
  nav.innerHTML = `
    <div class="nav-pill">
      ${leftItems.map(item => `
        <button class="nav-item ${currentRoute === item.route ? 'active' : ''}" data-route="${item.route}" aria-label="${t(item.label)}">
          <i class="${item.icon}"></i>
        </button>
      `).join('')}

      <button class="nav-fab-btn" id="nav-fab" aria-label="${t('Add transaction')}">
        <i class="ph-bold ph-plus"></i>
      </button>

      ${rightItems.map(item => `
        <button class="nav-item ${currentRoute === item.route ? 'active' : ''}" data-route="${item.route}" aria-label="${t(item.label)}">
          <i class="${item.icon}"></i>
        </button>
      `).join('')}
    </div>
  `;

  const fabBtn = nav.querySelector('#nav-fab');
  if (fabBtn) {
    fabBtn.onclick = (e) => {
      e.stopPropagation();
      showTransactionForm();
    };
  }

  nav.addEventListener('click', (e) => {
    const navItem = e.target.closest('.nav-item');
    if (!navItem) return;
    const route = navItem.dataset.route;
    Router.navigate('#' + route);

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

  const currentRoute = (window.location.hash || '#/dashboard').replace('#', '');

  // Add borderless "More" button to top right header actions
  const moreAction = {
    id: 'header-more-btn',
    icon: currentRoute === '/more' ? 'ph-fill ph-dots-three-circle-fill' : 'ph ph-dots-three-circle',
    label: t('More'),
    onClick: () => Router.navigate('#/more')
  };

  const allActions = [...actions];
  if (!allActions.some(a => a.id === 'header-more-btn')) {
    allActions.push(moreAction);
  }

  header.className = 'app-header';
  header.innerHTML = `
    <h1 class="header-title">${title}</h1>
    <div class="header-actions">
      ${allActions.map(a => `
        <button class="header-btn-borderless" id="${a.id || ''}" aria-label="${a.label || ''}">
          <i class="${a.icon}"></i>
        </button>
      `).join('')}
    </div>
  `;

  allActions.forEach(a => {
    if (a.id && a.onClick) {
      const btn = document.getElementById(a.id);
      if (btn) btn.addEventListener('click', a.onClick);
    }
  });
}

// ─────────── FAB ───────────
export function renderFab(onClick) {
  const fabBtn = document.getElementById('nav-fab');
  if (fabBtn && onClick) {
    fabBtn.onclick = onClick;
  }
}

export function hideFab() {
  // Central Add button is permanent in navbar pill
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

  let isClosed = false;
  // Close handler
  const close = () => {
    if (isClosed) return;
    isClosed = true;
    sheet.classList.remove('active');
    backdrop.classList.remove('active');
    sheet.style.pointerEvents = 'none';
    backdrop.style.pointerEvents = 'none';
    setTimeout(() => {
      try { backdrop.remove(); } catch (e) {}
      try { sheet.remove(); } catch (e) {}
      if (activeSheet?.sheet === sheet) {
        activeSheet = null;
      }
      if (onClose) onClose();
    }, 200);
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
  if (activeSheet) {
    try { activeSheet.close(); } catch (e) {}
    activeSheet = null;
  }
  const root = document.getElementById('modal-root');
  if (root) {
    const sheets = root.querySelectorAll('.sheet');
    const backdrops = root.querySelectorAll('.sheet-backdrop');
    sheets.forEach(s => {
      s.classList.remove('active');
      s.style.pointerEvents = 'none';
      s.style.display = 'none';
      try { s.remove(); } catch (e) {}
    });
    backdrops.forEach(b => {
      b.classList.remove('active');
      b.style.pointerEvents = 'none';
      b.style.display = 'none';
      try { b.remove(); } catch (e) {}
    });
  }
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
  // Always close any currently open sheet before opening a new form
  closeSheet();

  const categories = State.getCategories();
  const accounts = State.getAssetAccounts();
  const isEdit = !!existingTx;

  const today = new Date().toISOString().split('T')[0];

  let closeModal = null;

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
      const amountVal = container.querySelector('#tx-amount').value;
      const amount = parseFloat(amountVal);
      const description = (container.querySelector('#tx-desc').value || '').trim();

      if (isNaN(amount) || amount <= 0) {
        showToast(t('Please enter a valid amount'), 'error');
        return;
      }
      if (!description) {
        showToast(t('Please enter a description'), 'error');
        return;
      }

      let dateIso = new Date().toISOString();
      const rawDate = container.querySelector('#tx-date').value;
      if (rawDate) {
        const parsed = new Date(rawDate);
        if (!isNaN(parsed.getTime())) {
          dateIso = parsed.toISOString();
        }
      }

      const tx = {
        id: existingTx?.id || generateId(),
        type: selectedType,
        amount,
        description,
        categoryId: selectedType === 'transfer' ? null : container.querySelector('#tx-category').value || null,
        sourceAccountId: (selectedType === 'withdrawal' || selectedType === 'transfer')
          ? container.querySelector('#tx-source').value || null : null,
        destAccountId: (selectedType === 'deposit' || selectedType === 'transfer')
          ? container.querySelector('#tx-dest').value || null : null,
        date: dateIso,
        notes: (container.querySelector('#tx-notes').value || '').trim(),
        tags: [],
        createdAt: existingTx?.createdAt || new Date().toISOString(),
      };

      // Close modal first so pop-up always closes
      (closeModal ?? closeSheet)();

      try {
        if (isEdit) {
          State.deleteTransaction(existingTx.id);
        }
        State.addTransaction(tx);
        showToast(isEdit ? t('Transaction updated') : t('Transaction added'), 'success');
      } catch (err) {
        console.error('Error saving transaction:', err);
        showToast(t('Error saving transaction'), 'error');
      }
    });

    // Delete handler
    if (isEdit) {
      container.querySelector('#tx-delete').addEventListener('click', () => {
        (closeModal ?? closeSheet)();
        try {
          State.deleteTransaction(existingTx.id);
          showToast(t('Transaction deleted'), 'success');
        } catch (err) {
          console.error('Error deleting transaction:', err);
        }
      });
    }
  };

  const sheetResult = showSheet({
    title: isEdit ? t('Update Transaction') : t('Add Transaction'),
    content: formContent
  });
  closeModal = sheetResult?.close;
}
