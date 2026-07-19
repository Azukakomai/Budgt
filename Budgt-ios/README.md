# 📱 BUDGT — Native iOS Application

**BUDGT iOS** is a native iOS personal finance tracking app built with **SwiftUI** (Swift 5.9+, iOS 16/17+ target).

It mirrors all capabilities of the Budgt web ecosystem:
- **📊 Real-time Dashboard:** Net worth, asset/liability breakdown, monthly cash flow, category chart visualizations, and quick transaction feed.
- **💸 Transactions Ledger:** Track Withdrawals, Deposits, and Account Transfers with interactive search, filtering, and swift swipe-to-delete.
- **🏛️ Account Management:** Asset accounts (Checking, Savings, Cash) and Liability accounts (Credit Cards, Loans) with dynamic balance updates.
- **🎯 Budgets & Piggy Banks:** Category spending limits with progress bars & status indicators, plus Piggy Bank savings goals with deposit/withdraw actions.
- **📅 Scheduled Bills:** Recurring payment tracker with due dates and auto-pay tags.
- **⚙️ Multi-Currency & Settings:** Support for USD ($), EUR (€), IDR (Rp), MYR (RM), GBP (£), and JPY (¥).

---

## 🏗️ Project Structure

```
Budgt-ios/
├── Budgt/
│   ├── App/
│   │   ├── BudgtApp.swift              # App entrypoint (@main)
│   │   └── Info.plist                  # App configuration metadata
│   ├── Models/
│   │   └── Models.swift                # Data models (Transaction, Account, Category, Budget, PiggyBank, Bill)
│   ├── Services/
│   │   └── DataStore.swift             # Reactive State Engine & UserDefaults JSON storage
│   ├── Utilities/
│   │   └── CurrencyFormatter.swift     # Currency and hex color utilities
│   └── Views/
│       ├── MainTabView.swift           # Native Bottom Tab Bar Navigation
│       ├── DashboardView.swift         # Net worth, cash flow & Swift Charts
│       ├── TransactionsView.swift      # Transaction ledger & Add modal
│       ├── AccountsView.swift          # Asset & Liability account lists
│       ├── BudgetsView.swift           # Category budget limits & Piggy Banks
│       ├── BillsView.swift             # Scheduled bills & payment tracking
│       └── SettingsView.swift          # Currency picker & data reset
├── Budgt.xcodeproj/
│   └── project.pbxproj                 # Xcode Project Bundle Configuration
└── README.md
```

---

## 🚀 How to Run in Xcode (macOS)

1. Open Xcode on your Mac.
2. Open the project by double-clicking `Budgt.xcodeproj` or running:
   ```bash
   open Budgt.xcodeproj
   ```
3. Select an iOS Simulator (e.g. **iPhone 15 Pro**) or a physical iOS Device from the scheme picker.
4. Press **⌘R** (Run) to build and launch the app.
