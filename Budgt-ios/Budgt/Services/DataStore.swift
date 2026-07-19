import Foundation
import Combine

public class DataStore: ObservableObject {
    @Published public var transactions: [Transaction] = [] {
        didSet { saveTransactions() }
    }
    @Published public var accounts: [Account] = [] {
        didSet { saveAccounts() }
    }
    @Published public var categories: [Category] = [] {
        didSet { saveCategories() }
    }
    @Published public var budgets: [Budget] = [] {
        didSet { saveBudgets() }
    }
    @Published public var piggyBanks: [PiggyBank] = [] {
        didSet { savePiggyBanks() }
    }
    @Published public var bills: [Bill] = [] {
        didSet { saveBills() }
    }
    @Published public var settings: AppSettings = AppSettings() {
        didSet { saveSettings() }
    }
    
    private let userDefaults = UserDefaults.standard
    
    public init() {
        loadData()
        if categories.isEmpty || accounts.isEmpty {
            seedInitialData()
        }
    }
    
    // MARK: - Core Calculations
    
    public var totalNetWorth: Double {
        let assets = accounts.filter { $0.type == .asset }.reduce(0) { $0 + $1.balance }
        let liabilities = accounts.filter { $0.type == .liability }.reduce(0) { $0 + $1.balance }
        return assets - liabilities
    }
    
    public var totalAssets: Double {
        accounts.filter { $0.type == .asset }.reduce(0) { $0 + $1.balance }
    }
    
    public var totalLiabilities: Double {
        accounts.filter { $0.type == .liability }.reduce(0) { $0 + $1.balance }
    }
    
    public var currentMonthIncome: Double {
        let calendar = Calendar.current
        let currentMonth = calendar.component(.month, from: Date())
        let currentYear = calendar.component(.year, from: Date())
        
        return transactions.filter { tx in
            tx.type == .deposit &&
            calendar.component(.month, from: tx.date) == currentMonth &&
            calendar.component(.year, from: tx.date) == currentYear
        }.reduce(0) { $0 + $1.amount }
    }
    
    public var currentMonthExpense: Double {
        let calendar = Calendar.current
        let currentMonth = calendar.component(.month, from: Date())
        let currentYear = calendar.component(.year, from: Date())
        
        return transactions.filter { tx in
            tx.type == .withdrawal &&
            calendar.component(.month, from: tx.date) == currentMonth &&
            calendar.component(.year, from: tx.date) == currentYear
        }.reduce(0) { $0 + $1.amount }
    }
    
    // MARK: - Transaction Actions
    
    public func addTransaction(_ transaction: Transaction) {
        transactions.insert(transaction, at: 0)
        applyTransactionToAccounts(transaction, isUndo: false)
    }
    
    public func deleteTransaction(_ transaction: Transaction) {
        if let index = transactions.firstIndex(where: { $0.id == transaction.id }) {
            let tx = transactions.remove(at: index)
            applyTransactionToAccounts(tx, isUndo: true)
        }
    }
    
    private func applyTransactionToAccounts(_ tx: Transaction, isUndo: Bool) {
        let multiplier = isUndo ? -1.0 : 1.0
        
        switch tx.type {
        case .withdrawal:
            if let srcId = tx.sourceAccountId, let index = accounts.firstIndex(where: { $0.id == srcId }) {
                accounts[index].balance -= (tx.amount * multiplier)
            }
        case .deposit:
            if let destId = tx.destAccountId, let index = accounts.firstIndex(where: { $0.id == destId }) {
                accounts[index].balance += (tx.amount * multiplier)
            }
        case .transfer:
            if let srcId = tx.sourceAccountId, let index = accounts.firstIndex(where: { $0.id == srcId }) {
                accounts[index].balance -= (tx.amount * multiplier)
            }
            if let destId = tx.destAccountId, let index = accounts.firstIndex(where: { $0.id == destId }) {
                accounts[index].balance += (tx.amount * multiplier)
            }
        }
    }
    
    // MARK: - Account Actions
    
    public func addAccount(_ account: Account) {
        accounts.append(account)
    }
    
    public func updateAccount(_ account: Account) {
        if let index = accounts.firstIndex(where: { $0.id == account.id }) {
            accounts[index] = account
        }
    }
    
    public func deleteAccount(id: String) {
        accounts.removeAll { $0.id == id }
    }
    
    // MARK: - Budget Actions
    
    public func addOrUpdateBudget(categoryId: String, amount: Double) {
        if let index = budgets.firstIndex(where: { $0.categoryId == categoryId }) {
            budgets[index].amount = amount
        } else {
            let budget = Budget(categoryId: categoryId, amount: amount)
            budgets.append(budget)
        }
    }
    
    public func categorySpentThisMonth(categoryId: String) -> Double {
        let calendar = Calendar.current
        let currentMonth = calendar.component(.month, from: Date())
        let currentYear = calendar.component(.year, from: Date())
        
        return transactions.filter { tx in
            tx.type == .withdrawal &&
            tx.categoryId == categoryId &&
            calendar.component(.month, from: tx.date) == currentMonth &&
            calendar.component(.year, from: tx.date) == currentYear
        }.reduce(0) { $0 + $1.amount }
    }
    
    // MARK: - Piggy Bank Actions
    
    public func addPiggyBank(_ piggy: PiggyBank) {
        piggyBanks.append(piggy)
    }
    
    public func depositToPiggyBank(id: String, amount: Double) {
        if let index = piggyBanks.firstIndex(where: { $0.id == id }) {
            piggyBanks[index].currentAmount += amount
        }
    }
    
    public func withdrawFromPiggyBank(id: String, amount: Double) {
        if let index = piggyBanks.firstIndex(where: { $0.id == id }) {
            piggyBanks[index].currentAmount = max(0, piggyBanks[index].currentAmount - amount)
        }
    }
    
    // MARK: - Bill Actions
    
    public func addBill(_ bill: Bill) {
        bills.append(bill)
    }
    
    public func markBillPaid(_ bill: Bill) {
        if let index = bills.firstIndex(where: { $0.id == bill.id }) {
            bills[index].lastPaidDate = Date()
            
            // Log automated transaction
            let tx = Transaction(
                type: .withdrawal,
                amount: bill.amount,
                description: "Bill Payment: \(bill.name)",
                categoryId: bill.categoryId,
                sourceAccountId: accounts.first?.id,
                date: Date()
            )
            addTransaction(tx)
        }
    }
    
    // MARK: - Persistence & Storage
    
    private func loadData() {
        if let data = userDefaults.data(forKey: "budgt_transactions"), let decoded = try? JSONDecoder().decode([Transaction].self, from: data) {
            self.transactions = decoded
        }
        if let data = userDefaults.data(forKey: "budgt_accounts"), let decoded = try? JSONDecoder().decode([Account].self, from: data) {
            self.accounts = decoded
        }
        if let data = userDefaults.data(forKey: "budgt_categories"), let decoded = try? JSONDecoder().decode([Category].self, from: data) {
            self.categories = decoded
        }
        if let data = userDefaults.data(forKey: "budgt_budgets"), let decoded = try? JSONDecoder().decode([Budget].self, from: data) {
            self.budgets = decoded
        }
        if let data = userDefaults.data(forKey: "budgt_piggybanks"), let decoded = try? JSONDecoder().decode([PiggyBank].self, from: data) {
            self.piggyBanks = decoded
        }
        if let data = userDefaults.data(forKey: "budgt_bills"), let decoded = try? JSONDecoder().decode([Bill].self, from: data) {
            self.bills = decoded
        }
        if let data = userDefaults.data(forKey: "budgt_settings"), let decoded = try? JSONDecoder().decode(AppSettings.self, from: data) {
            self.settings = decoded
        }
    }
    
    private func saveTransactions() {
        if let encoded = try? JSONEncoder().encode(transactions) {
            userDefaults.set(encoded, forKey: "budgt_transactions")
        }
    }
    
    private func saveAccounts() {
        if let encoded = try? JSONEncoder().encode(accounts) {
            userDefaults.set(encoded, forKey: "budgt_accounts")
        }
    }
    
    private func saveCategories() {
        if let encoded = try? JSONEncoder().encode(categories) {
            userDefaults.set(encoded, forKey: "budgt_categories")
        }
    }
    
    private func saveBudgets() {
        if let encoded = try? JSONEncoder().encode(budgets) {
            userDefaults.set(encoded, forKey: "budgt_budgets")
        }
    }
    
    private func savePiggyBanks() {
        if let encoded = try? JSONEncoder().encode(piggyBanks) {
            userDefaults.set(encoded, forKey: "budgt_piggybanks")
        }
    }
    
    private func saveBills() {
        if let encoded = try? JSONEncoder().encode(bills) {
            userDefaults.set(encoded, forKey: "budgt_bills")
        }
    }
    
    private func saveSettings() {
        if let encoded = try? JSONEncoder().encode(settings) {
            userDefaults.set(encoded, forKey: "budgt_settings")
        }
    }
    
    // MARK: - Seed Data
    
    public func seedInitialData() {
        let defaultCategories: [Category] = [
            Category(id: "cat_food", name: "Food & Dining", icon: "fork.knife", colorHex: "#34C759", type: .expense),
            Category(id: "cat_transport", name: "Transport", icon: "car.fill", colorHex: "#FF9500", type: .expense),
            Category(id: "cat_housing", name: "Housing", icon: "house.fill", colorHex: "#AF52DE", type: .expense),
            Category(id: "cat_entertain", name: "Entertainment", icon: "film.fill", colorHex: "#FF2D55", type: .expense),
            Category(id: "cat_shopping", name: "Shopping", icon: "bag.fill", colorHex: "#5856D6", type: .expense),
            Category(id: "cat_health", name: "Health", icon: "heart.fill", colorHex: "#FF3B30", type: .expense),
            Category(id: "cat_utilities", name: "Utilities", icon: "bolt.fill", colorHex: "#FFCC00", type: .expense),
            Category(id: "cat_groceries", name: "Groceries", icon: "cart.fill", colorHex: "#30B0C7", type: .expense),
            Category(id: "cat_subs", name: "Subscriptions", icon: "arrow.triangle.2.circlepath", colorHex: "#E040FB", type: .expense),
            Category(id: "cat_salary", name: "Salary", icon: "dollarsign.circle.fill", colorHex: "#34C759", type: .income),
            Category(id: "cat_freelance", name: "Freelance", icon: "briefcase.fill", colorHex: "#007AFF", type: .income)
        ]
        self.categories = defaultCategories
        
        let defaultAccounts: [Account] = [
            Account(id: "acc_checking", name: "Checking Account", type: .asset, balance: 4280.50, currency: "USD", icon: "building.columns.fill", colorHex: "#007AFF"),
            Account(id: "acc_savings", name: "Savings", type: .asset, balance: 12500.00, currency: "USD", icon: "archivebox.fill", colorHex: "#34C759"),
            Account(id: "acc_cash", name: "Cash", type: .asset, balance: 340.00, currency: "USD", icon: "banknote.fill", colorHex: "#FF9500")
        ]
        self.accounts = defaultAccounts
        
        let now = Date()
        let defaultTransactions: [Transaction] = [
            Transaction(type: .deposit, amount: 4500.00, description: "Monthly Salary", categoryId: "cat_salary", destAccountId: "acc_checking", date: now.addingTimeInterval(-86400 * 14)),
            Transaction(type: .withdrawal, amount: 1200.00, description: "Rent Payment", categoryId: "cat_housing", sourceAccountId: "acc_checking", date: now.addingTimeInterval(-86400 * 13)),
            Transaction(type: .withdrawal, amount: 85.40, description: "Grocery Store", categoryId: "cat_groceries", sourceAccountId: "acc_checking", date: now.addingTimeInterval(-86400 * 10)),
            Transaction(type: .withdrawal, amount: 45.00, description: "Gas Station", categoryId: "cat_transport", sourceAccountId: "acc_checking", date: now.addingTimeInterval(-86400 * 8)),
            Transaction(type: .withdrawal, amount: 12.99, description: "Netflix", categoryId: "cat_subs", sourceAccountId: "acc_checking", date: now.addingTimeInterval(-86400 * 6)),
            Transaction(type: .withdrawal, amount: 32.50, description: "Restaurant Dinner", categoryId: "cat_food", sourceAccountId: "acc_checking", date: now.addingTimeInterval(-86400 * 4)),
            Transaction(type: .transfer, amount: 500.00, description: "Savings Transfer", categoryId: nil, sourceAccountId: "acc_checking", destAccountId: "acc_savings", date: now.addingTimeInterval(-86400 * 2))
        ]
        self.transactions = defaultTransactions
        
        self.budgets = [
            Budget(categoryId: "cat_food", amount: 300),
            Budget(categoryId: "cat_groceries", amount: 400),
            Budget(categoryId: "cat_transport", amount: 200)
        ]
        
        self.piggyBanks = [
            PiggyBank(name: "Summer Vacation", targetAmount: 3000, currentAmount: 1250, icon: "airplane", accountId: "acc_savings"),
            PiggyBank(name: "Emergency Fund", targetAmount: 10000, currentAmount: 5500, icon: "shield.fill", accountId: "acc_savings")
        ]
        
        self.bills = [
            Bill(name: "Rent", amount: 1200, categoryId: "cat_housing", nextDueDate: now.addingTimeInterval(86400 * 12), autoPay: true),
            Bill(name: "Electricity", amount: 150, categoryId: "cat_utilities", nextDueDate: now.addingTimeInterval(86400 * 5), autoPay: false)
        ]
    }
}
