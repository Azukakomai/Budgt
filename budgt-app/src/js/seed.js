/* ════════════════════════════════════════════════════
   BUDGT — Seed Data
   Default categories, accounts, and demo transactions
   ════════════════════════════════════════════════════ */

import { Store } from './store.js';
import { generateId } from './utils.js';

export function seedData() {
  // Don't seed if data already exists
  if (Store.get('seeded')) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // ── Default Categories ──
  const categories = [
    { id: 'cat_food',       name: 'Food & Dining',   icon: 'ph-fork-knife',       color: 'oklch(0.72 0.15 185)', type: 'expense' },
    { id: 'cat_transport',  name: 'Transport',       icon: 'ph-car',              color: 'oklch(0.68 0.14 25)',  type: 'expense' },
    { id: 'cat_housing',    name: 'Housing',         icon: 'ph-house',            color: 'oklch(0.70 0.12 280)', type: 'expense' },
    { id: 'cat_entertain',  name: 'Entertainment',   icon: 'ph-film-strip',       color: 'oklch(0.78 0.14 80)', type: 'expense' },
    { id: 'cat_shopping',   name: 'Shopping',        icon: 'ph-shopping-bag',     color: 'oklch(0.65 0.15 330)', type: 'expense' },
    { id: 'cat_health',     name: 'Health',          icon: 'ph-heart',            color: 'oklch(0.68 0.12 215)', type: 'expense' },
    { id: 'cat_utilities',  name: 'Utilities',       icon: 'ph-lightning',        color: 'oklch(0.75 0.13 110)', type: 'expense' },
    { id: 'cat_groceries',  name: 'Groceries',       icon: 'ph-basket',           color: 'oklch(0.72 0.14 155)', type: 'expense' },
    { id: 'cat_subs',       name: 'Subscriptions',   icon: 'ph-repeat',           color: 'oklch(0.62 0.14 350)', type: 'expense' },
    { id: 'cat_education',  name: 'Education',       icon: 'ph-graduation-cap',   color: 'oklch(0.70 0.10 50)',  type: 'expense' },
    { id: 'cat_salary',     name: 'Salary',          icon: 'ph-money',            color: 'oklch(0.72 0.14 155)', type: 'income' },
    { id: 'cat_freelance',  name: 'Freelance',       icon: 'ph-briefcase',        color: 'oklch(0.68 0.12 215)', type: 'income' },
  ];
  Store.set('categories', categories);

  // ── Default Accounts ──
  const accounts = [
    { id: 'acc_checking', name: 'Checking Account', type: 'asset', balance: 4280.50, currency: 'USD', icon: 'ph-bank',       color: 'oklch(0.72 0.15 185)', createdAt: new Date().toISOString() },
    { id: 'acc_savings',  name: 'Savings',          type: 'asset', balance: 12500.00, currency: 'USD', icon: 'ph-piggy-bank', color: 'oklch(0.72 0.14 155)', createdAt: new Date().toISOString() },
    { id: 'acc_cash',     name: 'Cash',             type: 'asset', balance: 340.00,  currency: 'USD', icon: 'ph-wallet',     color: 'oklch(0.78 0.14 80)',  createdAt: new Date().toISOString() },
  ];
  Store.set('accounts', accounts);

  // ── Demo Transactions (current month) ──
  function makeDate(day) {
    return new Date(year, month, day, 10 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60)).toISOString();
  }

  const transactions = [
    { id: generateId(), type: 'deposit',    amount: 4500.00, description: 'Monthly Salary',       categoryId: 'cat_salary',     sourceAccountId: null,          destAccountId: 'acc_checking', date: makeDate(1),  notes: '', tags: [], createdAt: new Date().toISOString() },
    { id: generateId(), type: 'withdrawal', amount: 1200.00, description: 'Rent Payment',         categoryId: 'cat_housing',    sourceAccountId: 'acc_checking', destAccountId: null,          date: makeDate(1),  notes: '', tags: [], createdAt: new Date().toISOString() },
    { id: generateId(), type: 'withdrawal', amount: 85.40,   description: 'Grocery Store',        categoryId: 'cat_groceries',  sourceAccountId: 'acc_checking', destAccountId: null,          date: makeDate(3),  notes: '', tags: [], createdAt: new Date().toISOString() },
    { id: generateId(), type: 'withdrawal', amount: 45.00,   description: 'Gas Station',          categoryId: 'cat_transport',  sourceAccountId: 'acc_checking', destAccountId: null,          date: makeDate(4),  notes: '', tags: [], createdAt: new Date().toISOString() },
    { id: generateId(), type: 'withdrawal', amount: 12.99,   description: 'Netflix',              categoryId: 'cat_subs',       sourceAccountId: 'acc_checking', destAccountId: null,          date: makeDate(5),  notes: '', tags: [], createdAt: new Date().toISOString() },
    { id: generateId(), type: 'withdrawal', amount: 32.50,   description: 'Restaurant Dinner',    categoryId: 'cat_food',       sourceAccountId: 'acc_checking', destAccountId: null,          date: makeDate(6),  notes: '', tags: [], createdAt: new Date().toISOString() },
    { id: generateId(), type: 'withdrawal', amount: 150.00,  description: 'Electric Bill',        categoryId: 'cat_utilities',  sourceAccountId: 'acc_checking', destAccountId: null,          date: makeDate(7),  notes: '', tags: [], createdAt: new Date().toISOString() },
    { id: generateId(), type: 'withdrawal', amount: 28.90,   description: 'Coffee & Snacks',      categoryId: 'cat_food',       sourceAccountId: 'acc_cash',    destAccountId: null,          date: makeDate(8),  notes: '', tags: [], createdAt: new Date().toISOString() },
    { id: generateId(), type: 'withdrawal', amount: 67.30,   description: 'Online Shopping',      categoryId: 'cat_shopping',   sourceAccountId: 'acc_checking', destAccountId: null,          date: makeDate(9),  notes: '', tags: [], createdAt: new Date().toISOString() },
    { id: generateId(), type: 'withdrawal', amount: 120.00,  description: 'Weekly Groceries',     categoryId: 'cat_groceries',  sourceAccountId: 'acc_checking', destAccountId: null,          date: makeDate(10), notes: '', tags: [], createdAt: new Date().toISOString() },
    { id: generateId(), type: 'withdrawal', amount: 55.00,   description: 'Movie Night',          categoryId: 'cat_entertain',  sourceAccountId: 'acc_cash',    destAccountId: null,          date: makeDate(11), notes: '', tags: [], createdAt: new Date().toISOString() },
    { id: generateId(), type: 'transfer',   amount: 500.00,  description: 'Savings Transfer',     categoryId: null,             sourceAccountId: 'acc_checking', destAccountId: 'acc_savings', date: makeDate(12), notes: '', tags: [], createdAt: new Date().toISOString() },
    { id: generateId(), type: 'withdrawal', amount: 40.00,   description: 'Pharmacy',             categoryId: 'cat_health',     sourceAccountId: 'acc_checking', destAccountId: null,          date: makeDate(13), notes: '', tags: [], createdAt: new Date().toISOString() },
    { id: generateId(), type: 'deposit',    amount: 350.00,  description: 'Freelance Project',    categoryId: 'cat_freelance',  sourceAccountId: null,          destAccountId: 'acc_checking', date: makeDate(14), notes: '', tags: [], createdAt: new Date().toISOString() },
  ];
  Store.set('transactions', transactions);

  // ── Default Budgets ──
  const budgets = [
    { id: 'bud_food',      categoryId: 'cat_food',      amount: 300, period: 'monthly', startDate: makeDate(1) },
    { id: 'bud_transport',  categoryId: 'cat_transport',  amount: 200, period: 'monthly', startDate: makeDate(1) },
    { id: 'bud_groceries',  categoryId: 'cat_groceries',  amount: 400, period: 'monthly', startDate: makeDate(1) },
    { id: 'bud_entertain',  categoryId: 'cat_entertain',  amount: 150, period: 'monthly', startDate: makeDate(1) },
    { id: 'bud_shopping',   categoryId: 'cat_shopping',   amount: 200, period: 'monthly', startDate: makeDate(1) },
  ];
  Store.set('budgets', budgets);

  // ── Default Piggy Banks ──
  const piggybanks = [
    { id: 'pig_vacation', name: 'Summer Vacation', targetAmount: 3000, currentAmount: 1250, icon: 'ph-airplane',     targetDate: new Date(year, month + 4, 1).toISOString(), accountId: 'acc_savings' },
    { id: 'pig_laptop',   name: 'New Laptop',      targetAmount: 1500, currentAmount: 800,  icon: 'ph-laptop',       targetDate: new Date(year, month + 2, 1).toISOString(), accountId: 'acc_savings' },
    { id: 'pig_emergency', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 5500, icon: 'ph-shield-check', targetDate: null,                                         accountId: 'acc_savings' },
  ];
  Store.set('piggybanks', piggybanks);

  // ── Default Bills ──
  const bills = [
    { id: 'bill_rent',     name: 'Rent',         amount: 1200, categoryId: 'cat_housing',   frequency: 'monthly', nextDueDate: new Date(year, month + 1, 1).toISOString(),  autoPay: true,  lastPaidDate: makeDate(1) },
    { id: 'bill_electric', name: 'Electricity',  amount: 150,  categoryId: 'cat_utilities', frequency: 'monthly', nextDueDate: new Date(year, month + 1, 7).toISOString(),  autoPay: false, lastPaidDate: makeDate(7) },
    { id: 'bill_netflix',  name: 'Netflix',      amount: 12.99, categoryId: 'cat_subs',     frequency: 'monthly', nextDueDate: new Date(year, month + 1, 5).toISOString(),  autoPay: true,  lastPaidDate: makeDate(5) },
    { id: 'bill_gym',      name: 'Gym Membership', amount: 45, categoryId: 'cat_health',    frequency: 'monthly', nextDueDate: new Date(year, month + 1, 15).toISOString(), autoPay: true,  lastPaidDate: null },
  ];
  Store.set('bills', bills);

  // ── Settings ──
  Store.set('settings', { currency: 'USD', locale: 'en-US', currencySymbol: '$' });

  // Mark as seeded
  Store.set('seeded', true);
}

export function resetToZero() {
  const now = new Date();
  const categories = [
    { id: 'cat_food',       name: 'Food & Dining',   icon: 'ph-fork-knife',       color: 'oklch(0.72 0.15 185)', type: 'expense' },
    { id: 'cat_transport',  name: 'Transport',       icon: 'ph-car',              color: 'oklch(0.68 0.14 25)',  type: 'expense' },
    { id: 'cat_housing',    name: 'Housing',         icon: 'ph-house',            color: 'oklch(0.70 0.12 280)', type: 'expense' },
    { id: 'cat_entertain',  name: 'Entertainment',   icon: 'ph-film-strip',       color: 'oklch(0.78 0.14 80)', type: 'expense' },
    { id: 'cat_shopping',   name: 'Shopping',        icon: 'ph-shopping-bag',     color: 'oklch(0.65 0.15 330)', type: 'expense' },
    { id: 'cat_health',     name: 'Health',          icon: 'ph-heart',            color: 'oklch(0.68 0.12 215)', type: 'expense' },
    { id: 'cat_utilities',  name: 'Utilities',       icon: 'ph-lightning',        color: 'oklch(0.75 0.13 110)', type: 'expense' },
    { id: 'cat_groceries',  name: 'Groceries',       icon: 'ph-basket',           color: 'oklch(0.72 0.14 155)', type: 'expense' },
    { id: 'cat_subs',       name: 'Subscriptions',   icon: 'ph-repeat',           color: 'oklch(0.62 0.14 350)', type: 'expense' },
    { id: 'cat_education',  name: 'Education',       icon: 'ph-graduation-cap',   color: 'oklch(0.70 0.10 50)',  type: 'expense' },
    { id: 'cat_salary',     name: 'Salary',          icon: 'ph-money',            color: 'oklch(0.72 0.14 155)', type: 'income' },
    { id: 'cat_freelance',  name: 'Freelance',       icon: 'ph-briefcase',        color: 'oklch(0.68 0.12 215)', type: 'income' },
  ];
  Store.set('categories', categories);

  const accounts = [
    { id: 'acc_checking', name: 'Checking Account', type: 'asset', balance: 0, currency: 'USD', icon: 'ph-bank',       color: 'oklch(0.72 0.15 185)', createdAt: now.toISOString() },
    { id: 'acc_savings',  name: 'Savings',          type: 'asset', balance: 0, currency: 'USD', icon: 'ph-piggy-bank', color: 'oklch(0.72 0.14 155)', createdAt: now.toISOString() },
    { id: 'acc_cash',     name: 'Cash',             type: 'asset', balance: 0, currency: 'USD', icon: 'ph-wallet',     color: 'oklch(0.78 0.14 80)',  createdAt: now.toISOString() },
  ];
  Store.set('accounts', accounts);
  Store.set('transactions', []);
  Store.set('budgets', []);
  Store.set('piggybanks', []);
  Store.set('bills', []);
  Store.set('settings', { currency: 'USD', locale: 'en-US', currencySymbol: '$' });
  Store.set('seeded', true);
}
