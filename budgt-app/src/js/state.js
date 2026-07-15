/* ════════════════════════════════════════════════════
   BUDGT — State (reactive pub/sub)
   ════════════════════════════════════════════════════ */

import { Store } from './store.js';

const listeners = {};

export const State = {
  _cache: {},

  subscribe(key, callback) {
    if (!listeners[key]) listeners[key] = [];
    listeners[key].push(callback);
    return () => {
      listeners[key] = listeners[key].filter(cb => cb !== callback);
    };
  },

  emit(key, data) {
    if (listeners[key]) {
      listeners[key].forEach(cb => cb(data));
    }
  },

  // ── Accounts ──
  getAccounts() {
    return Store.getCollection('accounts');
  },
  getAssetAccounts() {
    return this.getAccounts().filter(a => a.type === 'asset');
  },
  addAccount(account) {
    const items = Store.addToCollection('accounts', account);
    this.emit('accounts', items);
    return items;
  },
  updateAccount(id, updates) {
    const items = Store.updateInCollection('accounts', id, updates);
    this.emit('accounts', items);
    return items;
  },
  deleteAccount(id) {
    const items = Store.removeFromCollection('accounts', id);
    this.emit('accounts', items);
    return items;
  },

  // ── Transactions ──
  getTransactions() {
    return Store.getCollection('transactions').sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    );
  },
  addTransaction(tx) {
    const items = Store.addToCollection('transactions', tx);
    // Update account balances
    this._applyTransactionToAccounts(tx, 1);
    this.emit('transactions', this.getTransactions());
    this.emit('accounts', this.getAccounts());
    return items;
  },
  deleteTransaction(id) {
    const tx = Store.findInCollection('transactions', id);
    if (tx) {
      this._applyTransactionToAccounts(tx, -1);
    }
    const items = Store.removeFromCollection('transactions', id);
    this.emit('transactions', this.getTransactions());
    this.emit('accounts', this.getAccounts());
    return items;
  },

  _applyTransactionToAccounts(tx, direction) {
    const amount = tx.amount * direction;
    if (tx.type === 'withdrawal' && tx.sourceAccountId) {
      const acc = Store.findInCollection('accounts', tx.sourceAccountId);
      if (acc) Store.updateInCollection('accounts', tx.sourceAccountId, { balance: acc.balance - amount });
    } else if (tx.type === 'deposit' && tx.destAccountId) {
      const acc = Store.findInCollection('accounts', tx.destAccountId);
      if (acc) Store.updateInCollection('accounts', tx.destAccountId, { balance: acc.balance + amount });
    } else if (tx.type === 'transfer') {
      if (tx.sourceAccountId) {
        const src = Store.findInCollection('accounts', tx.sourceAccountId);
        if (src) Store.updateInCollection('accounts', tx.sourceAccountId, { balance: src.balance - amount });
      }
      if (tx.destAccountId) {
        const dest = Store.findInCollection('accounts', tx.destAccountId);
        if (dest) Store.updateInCollection('accounts', tx.destAccountId, { balance: dest.balance + amount });
      }
    }
  },

  // ── Categories ──
  getCategories() {
    return Store.getCollection('categories');
  },
  getCategory(id) {
    return Store.findInCollection('categories', id);
  },
  addCategory(cat) {
    const items = Store.addToCollection('categories', cat);
    this.emit('categories', items);
    return items;
  },
  updateCategory(id, updates) {
    const items = Store.updateInCollection('categories', id, updates);
    this.emit('categories', items);
    return items;
  },
  deleteCategory(id) {
    const items = Store.removeFromCollection('categories', id);
    this.emit('categories', items);
    return items;
  },

  // ── Budgets ──
  getBudgets() {
    return Store.getCollection('budgets');
  },
  addBudget(budget) {
    const items = Store.addToCollection('budgets', budget);
    this.emit('budgets', items);
    return items;
  },
  updateBudget(id, updates) {
    const items = Store.updateInCollection('budgets', id, updates);
    this.emit('budgets', items);
    return items;
  },
  deleteBudget(id) {
    const items = Store.removeFromCollection('budgets', id);
    this.emit('budgets', items);
    return items;
  },

  // ── Piggy Banks ──
  getPiggyBanks() {
    return Store.getCollection('piggybanks');
  },
  addPiggyBank(piggy) {
    const items = Store.addToCollection('piggybanks', piggy);
    this.emit('piggybanks', items);
    return items;
  },
  updatePiggyBank(id, updates) {
    const items = Store.updateInCollection('piggybanks', id, updates);
    this.emit('piggybanks', items);
    return items;
  },
  deletePiggyBank(id) {
    const items = Store.removeFromCollection('piggybanks', id);
    this.emit('piggybanks', items);
    return items;
  },

  // ── Bills ──
  getBills() {
    return Store.getCollection('bills');
  },
  addBill(bill) {
    const items = Store.addToCollection('bills', bill);
    this.emit('bills', items);
    return items;
  },
  updateBill(id, updates) {
    const items = Store.updateInCollection('bills', id, updates);
    this.emit('bills', items);
    return items;
  },
  deleteBill(id) {
    const items = Store.removeFromCollection('bills', id);
    this.emit('bills', items);
    return items;
  },

  // ── Settings ──
  getSettings() {
    return Store.get('settings') || {
      currency: 'USD',
      locale: 'en-US',
      currencySymbol: '$'
    };
  },
  updateSettings(updates) {
    const settings = { ...this.getSettings(), ...updates };
    Store.set('settings', settings);
    this.emit('settings', settings);
    return settings;
  },

  // ── Computed ──
  getTotalBalance() {
    return this.getAssetAccounts().reduce((sum, a) => sum + a.balance, 0);
  },

  getMonthlySpending(year, month) {
    const transactions = this.getTransactions();
    return transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'withdrawal' && d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getMonthlyIncome(year, month) {
    const transactions = this.getTransactions();
    return transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'deposit' && d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getSpendingByCategory(year, month) {
    const transactions = this.getTransactions();
    const categories = this.getCategories();
    const spending = {};

    transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'withdrawal' && d.getFullYear() === year && d.getMonth() === month;
      })
      .forEach(t => {
        const catId = t.categoryId || 'uncategorized';
        spending[catId] = (spending[catId] || 0) + t.amount;
      });

    return Object.entries(spending).map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        categoryId: catId,
        name: cat ? cat.name : 'Uncategorized',
        icon: cat ? cat.icon : 'ph-question',
        color: cat ? cat.color : 'var(--text-tertiary)',
        amount
      };
    }).sort((a, b) => b.amount - a.amount);
  },

  getBudgetSpending(budgetId) {
    const budget = Store.findInCollection('budgets', budgetId);
    if (!budget) return 0;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return this.getTransactions()
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'withdrawal' &&
               t.categoryId === budget.categoryId &&
               d.getFullYear() === year &&
               d.getMonth() === month;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }
};
