/* ════════════════════════════════════════════════════
   BUDGT — Main Entry Point
   ════════════════════════════════════════════════════ */

// Styles
import './css/tokens.css';
import './css/base.css';
import './css/components.css';
import './css/views.css';

// Core
import { Router } from './js/router.js';
import { seedData } from './js/seed.js';
import { renderNav } from './js/components.js';

// Views
import { dashboardView } from './views/dashboard.js';
import { transactionsView } from './views/transactions.js';
import { accountsView } from './views/accounts.js';
import { budgetsView } from './views/budgets.js';
import { moreView, piggybanksView, billsView, reportsView, categoriesView, settingsView } from './views/more.js';

// ── Initialize ──
function init() {
  // Seed default data on first run
  seedData();

  // Register routes
  Router.register('/dashboard', dashboardView);
  Router.register('/transactions', transactionsView);
  Router.register('/accounts', accountsView);
  Router.register('/budgets', budgetsView);
  Router.register('/more', moreView);
  Router.register('/piggybanks', piggybanksView);
  Router.register('/bills', billsView);
  Router.register('/reports', reportsView);
  Router.register('/categories', categoriesView);
  Router.register('/settings', settingsView);

  // Render bottom nav
  renderNav();

  // Start routing
  Router.init();

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
