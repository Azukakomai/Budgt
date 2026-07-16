/* ════════════════════════════════════════════════════
   BUDGT — Accounts View
   ════════════════════════════════════════════════════ */

import { State } from '../js/state.js';
import { formatCurrency, generateId, ACCOUNT_ICONS } from '../js/utils.js';
import { renderHeader, hideFab, showSheet, closeSheet, showToast } from '../js/components.js';
import { t } from '../js/i18n.js';

export function accountsView(container) {
  renderHeader(t('Accounts'), [
    { id: 'add-account-btn', icon: 'ph ph-plus', label: t('Add account'), onClick: () => showAccountForm() }
  ]);
  hideFab();

  const render = () => {
    const accounts = State.getAssetAccounts();
    const totalBalance = State.getTotalBalance();

    container.innerHTML = `
      <div class="accounts-total">
        <div class="accounts-total-label">${t('Net Worth')}</div>
        <div class="accounts-total-amount">${formatCurrency(totalBalance)}</div>
      </div>

      <div class="accounts-list">
        ${accounts.length === 0 ? `
          <div class="empty-state">
            <i class="ph ph-wallet empty-state-icon"></i>
            <div class="empty-state-title">${t('No accounts')}</div>
            <div class="empty-state-desc">${t('Add your first account to start tracking')}</div>
          </div>
        ` : accounts.map(acc => `
          <div class="account-card" data-id="${acc.id}">
            <div class="account-icon" style="background: ${acc.color}20; color: ${acc.color}">
              <i class="ph ${acc.icon || 'ph-bank'}"></i>
            </div>
            <div class="account-info">
              <div class="account-name">${acc.name}</div>
              <div class="account-type">${acc.type}</div>
            </div>
            <div class="account-balance ${acc.balance >= 0 ? '' : 'amount-expense'}">
              ${formatCurrency(acc.balance)}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Account click → edit
    container.querySelectorAll('.account-card').forEach(card => {
      card.addEventListener('click', () => {
        const acc = State.getAccounts().find(a => a.id === card.dataset.id);
        if (acc) showAccountForm(acc);
      });
    });
  };

  render();

  const unsubs = [
    State.subscribe('accounts', render),
  ];

  return () => unsubs.forEach(u => u());
}

function showAccountForm(existing = null) {
  const isEdit = !!existing;

  showSheet({
    title: isEdit ? t('Edit Account') : t('New Account'),
    content: (container) => {
      container.innerHTML = `
        <div class="input-group">
          <label class="input-label" for="acc-name">${t('Account Name')}</label>
          <input class="input" type="text" id="acc-name" placeholder="e.g. Checking Account"
                 value="${existing?.name || ''}" />
        </div>

        <div class="input-group">
          <label class="input-label" for="acc-balance">${isEdit ? t('Current Balance') : t('Starting Balance')}</label>
          <input class="input" type="number" id="acc-balance" placeholder="0.00" step="0.01"
                 value="${existing?.balance ?? ''}" inputmode="decimal" />
        </div>

        <div class="input-group">
          <label class="input-label">${t('Icon')}</label>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
            ${['ph-bank', 'ph-piggy-bank', 'ph-wallet', 'ph-credit-card', 'ph-chart-line-up', 'ph-coin', 'ph-money'].map(icon => `
              <button class="btn btn-sm ${existing?.icon === icon ? 'btn-primary' : 'btn-secondary'} acc-icon-btn" data-icon="${icon}" style="width:44px;height:44px;padding:0;">
                <i class="ph ${icon}" style="font-size:20px;"></i>
              </button>
            `).join('')}
          </div>
        </div>

        <button class="btn btn-primary btn-full" id="acc-save">${isEdit ? t('Update') : t('Create')} ${t('Account')}</button>
        ${isEdit ? `<button class="btn btn-danger btn-full" id="acc-delete">${t('Delete Account')}</button>` : ''}
      `;

      let selectedIcon = existing?.icon || 'ph-bank';

      container.querySelectorAll('.acc-icon-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.acc-icon-btn').forEach(b => {
            b.classList.remove('btn-primary');
            b.classList.add('btn-secondary');
          });
          btn.classList.remove('btn-secondary');
          btn.classList.add('btn-primary');
          selectedIcon = btn.dataset.icon;
        });
      });

      container.querySelector('#acc-save').addEventListener('click', () => {
        const name = container.querySelector('#acc-name').value.trim();
        const balance = parseFloat(container.querySelector('#acc-balance').value) || 0;

        if (!name) {
          showToast(t('Please enter an account name'), 'error');
          return;
        }

        if (isEdit) {
          State.updateAccount(existing.id, { name, balance, icon: selectedIcon });
          showToast(t('Account updated'), 'success');
        } else {
          State.addAccount({
            id: generateId(),
            name,
            type: 'asset',
            balance,
            currency: 'USD',
            icon: selectedIcon,
            color: 'oklch(0.72 0.15 185)',
            createdAt: new Date().toISOString()
          });
          showToast(t('Account created'), 'success');
        }
        closeSheet();
      });

      if (isEdit) {
        container.querySelector('#acc-delete').addEventListener('click', () => {
          State.deleteAccount(existing.id);
          closeSheet();
          showToast(t('Account deleted'), 'success');
        });
      }
    }
  });
}
