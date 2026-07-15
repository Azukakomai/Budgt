/* ════════════════════════════════════════════════════
   BUDGT — Router (hash-based SPA)
   ════════════════════════════════════════════════════ */

const routes = {};
let currentRoute = null;
let currentCleanup = null;

export const Router = {
  register(path, handler) {
    routes[path] = handler;
  },

  navigate(path) {
    window.location.hash = path;
  },

  getCurrentRoute() {
    return currentRoute;
  },

  init() {
    window.addEventListener('hashchange', () => this._handleRoute());
    // Initial route
    if (!window.location.hash) {
      window.location.hash = '#/dashboard';
    } else {
      this._handleRoute();
    }
  },

  _handleRoute() {
    const hash = window.location.hash || '#/dashboard';
    const path = hash.replace('#', '');

    // Find matching route
    const handler = routes[path];
    if (!handler) {
      // Default fallback
      window.location.hash = '#/dashboard';
      return;
    }

    // Cleanup previous view
    if (currentCleanup && typeof currentCleanup === 'function') {
      currentCleanup();
    }

    currentRoute = path;

    // Get the main container
    const main = document.getElementById('app-main');
    if (!main) return;

    // Clear and render
    main.innerHTML = '';
    main.className = 'view-enter';

    // Remove animation class after it completes
    const onAnimEnd = () => {
      main.classList.remove('view-enter');
      main.removeEventListener('animationend', onAnimEnd);
    };
    main.addEventListener('animationend', onAnimEnd);

    // Execute route handler, store cleanup function
    currentCleanup = handler(main);

    // Update nav active state
    this._updateNav(path);
  },

  _updateNav(path) {
    const iconMap = {
      '/dashboard': { icon: 'ph ph-house', active: 'ph-fill ph-house-fill' },
      '/transactions': { icon: 'ph ph-list-bullets', active: 'ph-fill ph-list-bullets-fill' },
      '/budgets': { icon: 'ph ph-chart-pie', active: 'ph-fill ph-chart-pie-fill' },
      '/accounts': { icon: 'ph ph-wallet', active: 'ph-fill ph-wallet-fill' },
      '/more': { icon: 'ph ph-dots-three-circle', active: 'ph-fill ph-dots-three-circle-fill' },
    };
    document.querySelectorAll('.nav-item').forEach(item => {
      const navPath = item.dataset.route;
      const isActive = navPath && path.startsWith(navPath);
      const iconEl = item.querySelector('i');
      if (isActive) {
        item.classList.add('active');
        if (iconEl && iconMap[navPath]) iconEl.className = iconMap[navPath].active;
      } else {
        item.classList.remove('active');
        if (iconEl && iconMap[navPath]) iconEl.className = iconMap[navPath].icon;
      }
    });
  }
};
