import Foundation

// MARK: - Transaction Model
public enum TransactionType: String, Codable, CaseIterable, Identifiable {
    case withdrawal = "withdrawal"
    case deposit = "deposit"
    case transfer = "transfer"
    
    public var id: String { self.rawValue }
    
    public var title: String {
        switch self {
        case .withdrawal: return "Expense"
        case .deposit: return "Income"
        case .transfer: return "Transfer"
        }
    }
}

public struct Transaction: Identifiable, Codable, Hashable {
    public var id: String
    public var type: TransactionType
    public var amount: Double
    public var description: String
    public var categoryId: String?
    public var sourceAccountId: String?
    public var destAccountId: String?
    public var date: Date
    public var notes: String?
    public var tags: [String]?
    public var createdAt: Date
    
    public init(
        id: String = UUID().uuidString,
        type: TransactionType,
        amount: Double,
        description: String,
        categoryId: String? = nil,
        sourceAccountId: String? = nil,
        destAccountId: String? = nil,
        date: Date = Date(),
        notes: String? = nil,
        tags: [String]? = [],
        createdAt: Date = Date()
    ) {
        self.id = id
        self.type = type
        self.amount = amount
        self.description = description
        self.categoryId = categoryId
        self.sourceAccountId = sourceAccountId
        self.destAccountId = destAccountId
        self.date = date
        self.notes = notes
        self.tags = tags
        self.createdAt = createdAt
    }
}

// MARK: - Account Model
public enum AccountType: String, Codable, CaseIterable, Identifiable {
    case asset = "asset"
    case liability = "liability"
    
    public var id: String { self.rawValue }
    
    public var title: String {
        switch self {
        case .asset: return "Asset"
        case .liability: return "Liability"
        }
    }
}

public struct Account: Identifiable, Codable, Hashable {
    public var id: String
    public var name: String
    public var type: AccountType
    public var balance: Double
    public var currency: String
    public var icon: String
    public var colorHex: String
    public var createdAt: Date
    
    public init(
        id: String = UUID().uuidString,
        name: String,
        type: AccountType,
        balance: Double,
        currency: String = "USD",
        icon: String = "creditcard.fill",
        colorHex: String = "#007AFF",
        createdAt: Date = Date()
    ) {
        self.id = id
        self.name = name
        self.type = type
        self.balance = balance
        self.currency = currency
        self.icon = icon
        self.colorHex = colorHex
        self.createdAt = createdAt
    }
}

// MARK: - Category Model
public enum CategoryType: String, Codable, CaseIterable, Identifiable {
    case expense = "expense"
    case income = "income"
    
    public var id: String { self.rawValue }
}

public struct Category: Identifiable, Codable, Hashable {
    public var id: String
    public var name: String
    public var icon: String
    public var colorHex: String
    public var type: CategoryType
    
    public init(id: String, name: String, icon: String, colorHex: String, type: CategoryType) {
        self.id = id
        self.name = name
        self.icon = icon
        self.colorHex = colorHex
        self.type = type
    }
}

// MARK: - Budget Model
public struct Budget: Identifiable, Codable, Hashable {
    public var id: String
    public var categoryId: String
    public var amount: Double
    public var period: String
    public var startDate: Date
    
    public init(id: String = UUID().uuidString, categoryId: String, amount: Double, period: String = "monthly", startDate: Date = Date()) {
        self.id = id
        self.categoryId = categoryId
        self.amount = amount
        self.period = period
        self.startDate = startDate
    }
}

// MARK: - Piggy Bank (Savings Goal) Model
public struct PiggyBank: Identifiable, Codable, Hashable {
    public var id: String
    public var name: String
    public var targetAmount: Double
    public var currentAmount: Double
    public var icon: String
    public var targetDate: Date?
    public var accountId: String?
    
    public init(
        id: String = UUID().uuidString,
        name: String,
        targetAmount: Double,
        currentAmount: Double = 0.0,
        icon: String = "target",
        targetDate: Date? = nil,
        accountId: String? = nil
    ) {
        self.id = id
        self.name = name
        self.targetAmount = targetAmount
        self.currentAmount = currentAmount
        self.icon = icon
        self.targetDate = targetDate
        self.accountId = accountId
    }
}

// MARK: - Bill Model
public struct Bill: Identifiable, Codable, Hashable {
    public var id: String
    public var name: String
    public var amount: Double
    public var categoryId: String
    public var frequency: String
    public var nextDueDate: Date
    public var autoPay: Bool
    public var lastPaidDate: Date?
    
    public init(
        id: String = UUID().uuidString,
        name: String,
        amount: Double,
        categoryId: String,
        frequency: String = "monthly",
        nextDueDate: Date,
        autoPay: Bool = false,
        lastPaidDate: Date? = nil
    ) {
        self.id = id
        self.name = name
        self.amount = amount
        self.categoryId = categoryId
        self.frequency = frequency
        self.nextDueDate = nextDueDate
        self.autoPay = autoPay
        self.lastPaidDate = lastPaidDate
    }
}

// MARK: - App Settings Model
public struct AppSettings: Codable, Hashable {
    public var currency: String
    public var locale: String
    public var currencySymbol: String
    public var theme: String
    
    public init(currency: String = "USD", locale: String = "en-US", currencySymbol: String = "$", theme: String = "system") {
        self.currency = currency
        self.locale = locale
        self.currencySymbol = currencySymbol
        self.theme = theme
    }
}
