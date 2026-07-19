import SwiftUI
import Charts

public struct DashboardView: View {
    @EnvironmentObject var store: DataStore
    @State private var showingAddTransaction = false

    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // MARK: - Net Worth Header Card
                    VStack(alignment: .leading, spacing: 12) {
                        Text("TOTAL NET WORTH")
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundColor(.secondary)
                        
                        Text(CurrencyFormatter.format(store.totalNetWorth, currency: store.settings.currency))
                            .font(.system(size: 34, weight: .bold, design: .rounded))
                            .foregroundColor(.primary)
                        
                        HStack(spacing: 16) {
                            HStack {
                                Image(systemName: "arrow.down.left.circle.fill")
                                    .foregroundColor(.green)
                                VStack(alignment: .leading) {
                                    Text("Assets")
                                        .font(.caption2)
                                        .foregroundColor(.secondary)
                                    Text(CurrencyFormatter.format(store.totalAssets, currency: store.settings.currency))
                                        .font(.subheadline)
                                        .fontWeight(.semibold)
                                }
                            }
                            
                            Spacer()
                            
                            HStack {
                                Image(systemName: "arrow.up.right.circle.fill")
                                    .foregroundColor(.red)
                                VStack(alignment: .leading) {
                                    Text("Liabilities")
                                        .font(.caption2)
                                        .foregroundColor(.secondary)
                                    Text(CurrencyFormatter.format(store.totalLiabilities, currency: store.settings.currency))
                                        .font(.subheadline)
                                        .fontWeight(.semibold)
                                }
                            }
                        }
                        .padding(.top, 4)
                    }
                    .padding()
                    .background(Color(uiColor: .secondarySystemGroupedBackground))
                    .cornerRadius(16)
                    .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 4)

                    // MARK: - Monthly Cash Flow Summary
                    HStack(spacing: 12) {
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Image(systemName: "arrow.down.right")
                                    .foregroundColor(.green)
                                Text("Monthly Income")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            Text(CurrencyFormatter.format(store.currentMonthIncome, currency: store.settings.currency))
                                .font(.title3)
                                .fontWeight(.bold)
                                .foregroundColor(.green)
                        }
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color(uiColor: .secondarySystemGroupedBackground))
                        .cornerRadius(14)
                        
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Image(systemName: "arrow.up.right")
                                    .foregroundColor(.red)
                                Text("Monthly Expenses")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            Text(CurrencyFormatter.format(store.currentMonthExpense, currency: store.settings.currency))
                                .font(.title3)
                                .fontWeight(.bold)
                                .foregroundColor(.red)
                        }
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color(uiColor: .secondarySystemGroupedBackground))
                        .cornerRadius(14)
                    }

                    // MARK: - Category Spending Chart (Swift Charts)
                    if #available(iOS 16.0, *) {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Category Spending")
                                .font(.headline)
                            
                            let categoryData = categorySpendingData()
                            if categoryData.isEmpty {
                                Text("No expenses logged this month.")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                    .padding(.vertical, 20)
                            } else {
                                Chart(categoryData, id: \.name) { item in
                                    SectorMark(
                                        angle: .value("Spent", item.amount),
                                        innerRadius: .ratio(0.6),
                                        angularInset: 1.5
                                    )
                                    .cornerRadius(4)
                                    .foregroundStyle(Color(hex: item.colorHex))
                                }
                                .frame(height: 180)
                            }
                        }
                        .padding()
                        .background(Color(uiColor: .secondarySystemGroupedBackground))
                        .cornerRadius(16)
                    }

                    // MARK: - Recent Activity Feed
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("Recent Transactions")
                                .font(.headline)
                            Spacer()
                            Button("Add") {
                                showingAddTransaction = true
                            }
                            .font(.subheadline)
                            .fontWeight(.semibold)
                        }
                        
                        if store.transactions.isEmpty {
                            Text("No transactions found.")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                                .padding(.vertical, 12)
                        } else {
                            ForEach(store.transactions.prefix(5)) { tx in
                                TransactionRowView(transaction: tx)
                                Divider()
                            }
                        }
                    }
                    .padding()
                    .background(Color(uiColor: .secondarySystemGroupedBackground))
                    .cornerRadius(16)
                }
                .padding()
            }
            .background(Color(uiColor: .systemGroupedBackground))
            .navigationTitle("Dashboard")
            .sheet(isPresented: $showingAddTransaction) {
                AddTransactionModalView()
                    .environmentObject(store)
            }
        }
    }

    private struct CategorySpendingItem {
        let name: String
        let amount: Double
        let colorHex: String
    }

    private func categorySpendingData() -> [CategorySpendingItem] {
        var dict: [String: (Double, String)] = [:]
        for tx in store.transactions where tx.type == .withdrawal {
            if let catId = tx.categoryId, let cat = store.categories.first(where: { $0.id == catId }) {
                dict[cat.name] = ((dict[cat.name]?.0 ?? 0) + tx.amount, cat.colorHex)
            }
        }
        return dict.map { CategorySpendingItem(name: $0.key, amount: $0.value.0, colorHex: $0.value.1) }
    }
}

// MARK: - Transaction Row Helper
public struct TransactionRowView: View {
    @EnvironmentObject var store: DataStore
    let transaction: Transaction

    public var body: some View {
        HStack(spacing: 12) {
            Image(systemName: iconName(for: transaction))
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(iconColor(for: transaction))
                .frame(width: 38, height: 38)
                .background(iconColor(for: transaction).opacity(0.12))
                .clipShape(Circle())
            
            VStack(alignment: .leading, spacing: 2) {
                Text(transaction.description)
                    .font(.body)
                    .fontWeight(.medium)
                Text(categoryName(for: transaction))
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 2) {
                Text(amountPrefix(for: transaction) + CurrencyFormatter.format(transaction.amount, currency: store.settings.currency))
                    .font(.callout)
                    .fontWeight(.semibold)
                    .foregroundColor(amountColor(for: transaction))
                Text(transaction.date, style: .date)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
    }

    private func iconName(for tx: Transaction) -> String {
        if let catId = tx.categoryId, let cat = store.categories.first(where: { $0.id == catId }) {
            return cat.icon
        }
        return tx.type == .transfer ? "arrow.left.arrow.right" : "dollarsign.circle"
    }

    private func iconColor(for tx: Transaction) -> Color {
        switch tx.type {
        case .withdrawal: return .red
        case .deposit: return .green
        case .transfer: return .blue
        }
    }

    private func categoryName(for tx: Transaction) -> String {
        if let catId = tx.categoryId, let cat = store.categories.first(where: { $0.id == catId }) {
            return cat.name
        }
        return tx.type.title
    }

    private func amountPrefix(for tx: Transaction) -> String {
        switch tx.type {
        case .withdrawal: return "-"
        case .deposit: return "+"
        case .transfer: return ""
        }
    }

    private func amountColor(for tx: Transaction) -> Color {
        switch tx.type {
        case .withdrawal: return .primary
        case .deposit: return .green
        case .transfer: return .blue
        }
    }
}
