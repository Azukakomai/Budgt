/* ════════════════════════════════════════════════════
   BUDGT — Utilities
   Currency formatting, date helpers, ID generation
   ════════════════════════════════════════════════════ */

import { State } from './state.js';
import { t } from './i18n.js';

// ── ID Generation ──
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// ── Currency Formatting ──
export function formatCurrency(amount, opts = {}) {
  const settings = State.getSettings();
  const { showSign = false, compact = false } = opts;

  const lang = settings.language || 'en';
  const currency = settings.currency || 'USD';
  const currencySymbol = settings.currencySymbol || '$';
  const locale = settings.locale || (lang === 'id' ? 'id-ID' : lang === 'ms' ? 'ms-MY' : 'en-US');
  const numAmount = Number(amount) || 0;
  const absAmount = Math.abs(numAmount);

  let formatted = '';

  if (compact && absAmount >= 1000) {
    if (absAmount >= 1000000) {
      const millions = absAmount / 1000000;
      const formattedNum = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(millions);

      const suffix = (lang === 'id' || lang === 'ms') ? 'Jt' : 'M';
      if (currencySymbol === '$' || currencySymbol === '£' || currencySymbol === '€' || currencySymbol === '¥') {
        formatted = `${currencySymbol}${formattedNum}${suffix}`;
      } else {
        formatted = `${currencySymbol} ${formattedNum} ${suffix}`;
      }
    } else {
      const thousands = absAmount / 1000;
      const formattedNum = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
      }).format(thousands);

      const suffix = (lang === 'id' || lang === 'ms') ? 'rb' : 'K';
      if (currencySymbol === '$' || currencySymbol === '£' || currencySymbol === '€' || currencySymbol === '¥') {
        formatted = `${currencySymbol}${formattedNum}${suffix}`;
      } else {
        formatted = `${currencySymbol} ${formattedNum} ${suffix}`;
      }
    }
  } else {
    const fracDigits = (currency === 'IDR' || currency === 'JPY') ? 0 : 2;
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: fracDigits,
      maximumFractionDigits: fracDigits
    });
    formatted = formatter.format(absAmount);
  }

  if (showSign && numAmount > 0) formatted = '+' + formatted;
  if (numAmount < 0) formatted = '-' + formatted;

  return formatted;
}

// ── Date Formatting ──
export function formatDate(dateStr, format = 'short') {
  const settings = State.getSettings();
  const locale = settings.locale || 'en-US';
  const date = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (format === 'relative') {
    if (isSameDay(date, now)) return t('Today');
    if (isSameDay(date, yesterday)) return t('Yesterday');
  }

  const options = {
    short: { month: 'short', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    monthYear: { month: 'long', year: 'numeric' },
    time: { hour: 'numeric', minute: '2-digit' },
    dayMonth: { day: 'numeric', month: 'short' }
  };

  return date.toLocaleDateString(locale, options[format] || options.short);
}

export function formatTime(dateStr) {
  const settings = State.getSettings();
  const locale = settings.locale || 'en-US';
  return new Date(dateStr).toLocaleTimeString(locale, {
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

// ── Universal File Download (Android Native Bridge + Browser Fallback) ──
export function triggerFileDownload(data, fileName, mimeType) {
  if (window.AndroidBridge && typeof window.AndroidBridge.downloadFile === 'function') {
    if (data instanceof Blob) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        const base64 = result.substring(result.indexOf(',') + 1);
        window.AndroidBridge.downloadFile(base64, fileName, mimeType);
      };
      reader.readAsDataURL(data);
      return;
    }
    let base64Str = data;
    if (typeof data === 'string' && data.startsWith('data:')) {
      base64Str = data.substring(data.indexOf(',') + 1);
    }
    window.AndroidBridge.downloadFile(base64Str, fileName, mimeType);
    return;
  }

  let url;
  if (data instanceof Blob) {
    url = URL.createObjectURL(data);
  } else if (typeof data === 'string' && data.startsWith('data:')) {
    url = data;
  } else {
    const blob = new Blob([data], { type: mimeType });
    url = URL.createObjectURL(blob);
  }

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (url.startsWith('blob:')) {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
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
