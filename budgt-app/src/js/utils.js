/* ════════════════════════════════════════════════════
   BUDGT — Utilities
   Currency formatting, date helpers, ID generation
   ════════════════════════════════════════════════════ */

import { State } from './state.js';

// ── ID Generation ──
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// ── Currency Formatting ──
export function formatCurrency(amount, opts = {}) {
  const settings = State.getSettings();
  const { showSign = false, compact = false } = opts;

  const formatter = new Intl.NumberFormat(settings.locale, {
    style: 'currency',
    currency: settings.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...(compact && Math.abs(amount) >= 1000 ? { notation: 'compact' } : {})
  });

  let formatted = formatter.format(Math.abs(amount));
  if (showSign && amount > 0) formatted = '+' + formatted;
  if (amount < 0) formatted = '-' + formatted;

  return formatted;
}

// ── Date Formatting ──
export function formatDate(dateStr, format = 'short') {
  const date = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (format === 'relative') {
    if (isSameDay(date, now)) return 'Today';
    if (isSameDay(date, yesterday)) return 'Yesterday';
  }

  const options = {
    short: { month: 'short', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    monthYear: { month: 'long', year: 'numeric' },
    time: { hour: 'numeric', minute: '2-digit' },
    dayMonth: { day: 'numeric', month: 'short' }
  };

  return date.toLocaleDateString('en-US', options[format] || options.short);
}

export function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
}

export function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

export function getToday() {
  return new Date().toISOString().split('T')[0];
}

export function getMonthStart() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getDayOfMonth() {
  return new Date().getDate();
}

export function getMonthProgress() {
  const now = new Date();
  const daysInMonth = getDaysInMonth(now.getFullYear(), now.getMonth());
  return getDayOfMonth() / daysInMonth;
}

// ── Group transactions by date ──
export function groupByDate(transactions) {
  const groups = {};
  transactions.forEach(tx => {
    const dateKey = new Date(tx.date).toISOString().split('T')[0];
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(tx);
  });
  return Object.entries(groups)
    .sort(([a], [b]) => new Date(b) - new Date(a))
    .map(([date, items]) => ({ date, items }));
}

// ── Percentage ──
export function percentage(value, total) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// ── Clamp ──
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

// ── Debounce ──
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// ── Sanitize HTML ──
export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── Category colors (OKLCH-based, pre-defined palette) ──
export const CATEGORY_COLORS = [
  'oklch(0.72 0.15 185)',  // Teal
  'oklch(0.68 0.14 25)',   // Coral
  'oklch(0.72 0.14 155)',  // Green
  'oklch(0.70 0.12 280)',  // Purple
  'oklch(0.78 0.14 80)',   // Amber
  'oklch(0.65 0.15 330)',  // Pink
  'oklch(0.68 0.12 215)',  // Blue
  'oklch(0.75 0.13 110)',  // Lime
  'oklch(0.62 0.14 350)',  // Rose
  'oklch(0.70 0.10 50)',   // Orange
  'oklch(0.65 0.12 250)',  // Indigo
  'oklch(0.72 0.10 140)',  // Mint
];

// ── Category icons mapping ──
export const CATEGORY_ICONS = {
  food: 'ph-fork-knife',
  transport: 'ph-car',
  housing: 'ph-house',
  entertainment: 'ph-film-strip',
  shopping: 'ph-shopping-bag',
  health: 'ph-heart',
  utilities: 'ph-lightning',
  education: 'ph-graduation-cap',
  travel: 'ph-airplane',
  clothing: 'ph-t-shirt',
  gifts: 'ph-gift',
  subscriptions: 'ph-repeat',
  groceries: 'ph-basket',
  dining: 'ph-coffee',
  salary: 'ph-money',
  freelance: 'ph-briefcase',
  investment: 'ph-chart-line-up',
  other: 'ph-dots-three',
};

// ── Account icons ──
export const ACCOUNT_ICONS = {
  checking: 'ph-bank',
  savings: 'ph-piggy-bank',
  cash: 'ph-wallet',
  credit: 'ph-credit-card',
  investment: 'ph-chart-line-up',
};
