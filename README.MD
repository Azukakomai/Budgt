# 📊 BUDGT — Simple Financial Management App

![Budgt Banner](hero.png)

**BUDGT** is a sleek, privacy-focused, and high-performance personal finance tracking application designed with a mobile-first philosophy. Available as a **Native Android App (APK)**, **Native iOS App**, and **Progressive Web Application (PWA)**, Budgt delivers an instant, fluid experience for managing budgets, tracking expenses, monitoring net worth, and generating financial reports directly on your device.

---

## 📲 Downloads & Platforms

* 🤖 **Android App**: Download the latest compiled debug APK directly: [`Budgt.apk`](Budgt-mobile/Budgt.apk) *(Version 1.0.6)*
* 🍏 **iOS App**: Xcode SwiftUI project located in [`Budgt-ios/`](Budgt-ios/)
* 🌐 **Web App**: Single-page web application located in [`budgt-app/`](budgt-app/)

---

## ✨ Key Features & Capabilities

* **📈 Real-Time Financial Dashboard**
  * Instant net worth overview and monthly cash flow (income vs. expense) summary.
  * Interactive category spending distribution charts and monthly trend visualizations.
  * Quick transaction feed for fast daily logging.

* **💸 Multi-Account Management & Ledger**
  * Support for both **Asset accounts** (Bank, Cash, Savings) and **Liability accounts** (Credit Cards, Loans).
  * Comprehensive transaction logging supporting **Withdrawals**, **Deposits**, and **Account Transfers**.
  * Dynamic auto-reconciliation: balances recalculate automatically whenever transactions are logged or edited.

* **🎯 Budgeting & Savings Goals (Piggy Banks)**
  * **Category Spending Limits:** Set monthly budget caps per category with visual progress indicators and threshold warnings.
  * **Piggy Banks:** Dedicated savings goal tracker to monitor milestone progress towards specific financial targets.

* **📅 Scheduled Bills & Subscriptions**
  * Recurring bill tracker to monitor upcoming due dates and recurring expenses.

* **📄 Financial Reports & Data Export**
  * **PDF Statement Generator:** In-browser export of detailed Profit & Loss (P&L) financial reports.
  * **Excel / CSV Data Dumps:** Export raw transaction ledgers for external analysis.
  * **JSON Backup & Restore:** Complete data backup and restore capabilities for easy data migration between devices.

* **🌐 Internationalization & Localization**
  * Multi-currency support with custom currency symbols (USD, IDR, MYR, EUR, GBP, JPY, etc.) and regional number formatting (`$1M`, `Rp 1 Jt`).
  * Multi-language support including English, Indonesian, and Malay.

* **🔒 100% Private & Client-Side**
  * All financial records are stored securely inside your device's local storage.
  * Zero external server tracking or data collection — your financial data never leaves your device.

* **📱 Cross-Platform Support**
  * Android Native App (WebView / Capacitor Shell)
  * iOS Native App (SwiftUI)
  * Progressive Web App (PWA) with offline capabilities.

---

## 🛠️ Tech Stack Highlights

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Mobile Core** | Android (Kotlin / WebView), iOS (SwiftUI) | Lightweight native mobile shells wrapping local assets. |
| **Web Architecture** | Vanilla JavaScript (ES Modules) | Framework-less Single Page Application (SPA) providing maximum performance and zero bundle overhead. |
| **Bundler** | [Vite 8](https://vitejs.dev/) | Lightning-fast development server with Hot Module Replacement (HMR). |
| **Styling & UI** | Vanilla CSS3 + Design Tokens | Custom tokenized CSS design system featuring glassmorphism, responsive mobile grids, and dynamic themes. |
| **Icons** | Phosphor Icons | Lightweight, modern vector iconography for financial categories and navigation. |
| **Database & Persistence** | Browser `localStorage` + Pub/Sub Engine | Custom local document storage driver (`store.js`) coupled with a reactive event-driven state engine (`state.js`). |
| **Reporting & Export** | `jsPDF`, `jspdf-autotable`, `xlsx` | In-browser PDF report synthesis and spreadsheet data extraction. |

---

## 📖 Deep-Dive Architecture & System Design
For a technical breakdown of the database mechanics, state management, directory layout, and event flow, please refer to [ARCHITECTURE.md](ARCHITECTURE.md).
