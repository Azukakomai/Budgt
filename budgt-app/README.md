# Budgt — Mobile-First Personal Finance App

Budgt is a modern, mobile-first personal finance tracking application built with **Vanilla JS**, **Vite**, and **OKLCH CSS**. It allows you to track transactions, manage accounts, monitor budget limits, set savings goals (piggy banks), and track recurring bills—all with zero external charting or framework dependencies.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
To run locally on your machine or test across your local Wi-Fi network (mobile device):
```bash
npx vite --host
```
Then open `http://localhost:5173` or your local network IP (`http://192.168.1.33:5173`) in your browser or phone.

### 3. Build for Production
```bash
npm run build
```
The optimized production bundle will be generated inside the `dist/` folder (~71 KB JS / ~23 KB CSS).

---

## ✨ Features & Capabilities

- **Dashboard & Analytics**: Custom canvas renderers for donut charts, bar charts, and 7-day sparklines.
- **Activity Feed**: Date-grouped transaction log with tap-to-edit support and expense/income/transfer filtering.
- **Multi-Account Tracking**: Asset and liability accounts (`Checking`, `Savings`, `Cash`) with net worth calculations.
- **Budgets & Alerts**: Real-time progress bars with `Near limit` (>80%) and `Over budget` (>100%) color warnings.
- **Piggy Banks**: Goal tracking with target dates and one-tap **+ Add Funds** actions.
- **Bills**: Recurring payment reminders with due date countdowns (`Due in 3d`, `Overdue`, `Paid`).
- **Settings & Backup**: Multi-currency support (`USD`, `EUR`, `GBP`, `JPY`, etc.), 1-click JSON backup export, and import.
