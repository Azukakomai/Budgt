/* ════════════════════════════════════════════════════
   BUDGT — Store (localStorage persistence layer)
   ════════════════════════════════════════════════════ */

const STORAGE_PREFIX = 'budgt_';

export const Store = {
  get(key) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage write failed:', e);
    }
  },

  remove(key) {
    localStorage.removeItem(STORAGE_PREFIX + key);
  },

  // Collection helpers
  getCollection(key) {
    return this.get(key) || [];
  },

  addToCollection(key, item) {
    const items = this.getCollection(key);
    items.push(item);
    this.set(key, items);
    return items;
  },

  updateInCollection(key, id, updates) {
    const items = this.getCollection(key);
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      this.set(key, items);
    }
    return items;
  },

  removeFromCollection(key, id) {
    const items = this.getCollection(key).filter(i => i.id !== id);
    this.set(key, items);
    return items;
  },

  findInCollection(key, id) {
    return this.getCollection(key).find(i => i.id === id) || null;
  },

  // Clear all budgt data
  clearAll() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  },

  // Export all data
  exportAll() {
    const data = {};
    const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
    keys.forEach(k => {
      data[k.replace(STORAGE_PREFIX, '')] = JSON.parse(localStorage.getItem(k));
    });
    return data;
  },

  // Import data
  importAll(data) {
    Object.entries(data).forEach(([key, value]) => {
      this.set(key, value);
    });
  }
};
