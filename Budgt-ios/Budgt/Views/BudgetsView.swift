import SwiftUI

public struct BudgetsView: View {
    @EnvironmentObject var store: DataStore
    @State private var showingAddBudget = false
    @State private var showingAddPiggy = false

    public var body: some View {
        NavigationStack {
            List {
                // MARK: - Monthly Category Budgets
                Section(header: Text("Monthly Category Budgets")) {
                    if store.budgets.isEmpty {
                        Text("No budget caps set. Tap + to add one.")
                            .foregroundColor(.secondary)
                    } else {
                        ForEach(store.budgets) { budget in
                            BudgetRowView(budget: budget)
                        }
                    }
                }

                // MARK: - Piggy Banks (Savings Goals)
                Section(header: Text("Savings Goals (Piggy Banks)")) {
                    if store.piggyBanks.isEmpty {
                        Text("No savings goals yet.")
                            .foregroundColor(.secondary)
                    } else {
                        ForEach(store.piggyBanks) { piggy in
                            PiggyBankRowView(piggy: piggy)
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Budgets & Goals")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Menu {
                        Button {
                            showingAddBudget = true
                        } label: {
                            Label("Set Category Budget", systemImage: "chart.line.uptrend.xyaxis")
                        }
                        Button {
                            showingAddPiggy = true
                        } label: {
                            Label("New Piggy Bank", systemImage: "arrow.up.bin.fill")
                        }
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title3)
                    }
                }
            }
            .sheet(isPresented: $showingAddBudget) {
                AddBudgetModalView()
                    .environmentObject(store)
            }
            .sheet(isPresented: $showingAddPiggy) {
                AddPiggyModalView()
                    .environmentObject(store)
            }
        }
    }
}

// MARK: - Budget Row View
public struct BudgetRowView: View {
    @EnvironmentObject var store: DataStore
    let budget: Budget

    public var category: Category? {
        store.categories.first(where: { $0.id == budget.categoryId })
    }

    public var spent: Double {
        store.categorySpentThisMonth(categoryId: budget.categoryId)
    }

    public var progress: Double {
        guard budget.amount > 0 else { return 0 }
        return min(1.0, spent / budget.amount)
    }

    public var statusColor: Color {
        if spent >= budget.amount { return .red }
        if spent >= (budget.amount * 0.75) { return .orange }
        return .green
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(category?.name ?? "Category")
                    .font(.body)
                    .fontWeight(.semibold)
                Spacer()
                Text("\(CurrencyFormatter.format(spent, currency: store.settings.currency)) / \(CurrencyFormatter.format(budget.amount, currency: store.settings.currency))")
                    .font(.subheadline)
                    .fontWeight(.bold)
                    .foregroundColor(statusColor)
            }

            ProgressView(value: progress)
                .tint(statusColor)
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Piggy Bank Row View
public struct PiggyBankRowView: View {
    @EnvironmentObject var store: DataStore
    let piggy: PiggyBank
    @State private var showingAction = false
    @State private var inputAmount = ""

    public var progress: Double {
        guard piggy.targetAmount > 0 else { return 0 }
        return min(1.0, piggy.currentAmount / piggy.targetAmount)
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: piggy.icon)
                    .font(.body)
                    .foregroundColor(.blue)
                Text(piggy.name)
                    .font(.body)
                    .fontWeight(.semibold)
                Spacer()
                Text("\(CurrencyFormatter.format(piggy.currentAmount, currency: store.settings.currency)) / \(CurrencyFormatter.format(piggy.targetAmount, currency: store.settings.currency))")
                    .font(.subheadline)
                    .fontWeight(.bold)
            }

            ProgressView(value: progress)
                .tint(.blue)

            HStack {
                Spacer()
                Button("Deposit") {
                    store.depositToPiggyBank(id: piggy.id, amount: 50.0)
                }
                .font(.caption)
                .buttonStyle(.borderedProminent)
                .tint(.green)

                Button("Withdraw") {
                    store.withdrawFromPiggyBank(id: piggy.id, amount: 50.0)
                }
                .font(.caption)
                .buttonStyle(.bordered)
                .tint(.red)
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Add Budget Modal View
public struct AddBudgetModalView: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.dismiss) var dismiss

    @State private var selectedCategoryId: String = ""
    @State private var amountString: String = ""

    public var body: some View {
        NavigationStack {
            Form {
                Section {
                    Picker("Category", selection: $selectedCategoryId) {
                        ForEach(store.categories.filter { $0.type == .expense }) { cat in
                            Text(cat.name).tag(cat.id)
                        }
                    }
                    TextField("Monthly Cap Amount", text: $amountString)
                        .keyboardType(.decimalPad)
                }
            }
            .navigationTitle("Set Budget Limit")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        if let amt = Double(amountString), !selectedCategoryId.isEmpty {
                            store.addOrUpdateBudget(categoryId: selectedCategoryId, amount: amt)
                            dismiss()
                        }
                    }
                }
            }
            .onAppear {
                if let first = store.categories.filter({ $0.type == .expense }).first {
                    selectedCategoryId = first.id
                }
            }
        }
    }
}

// MARK: - Add Piggy Modal View
public struct AddPiggyModalView: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.dismiss) var dismiss

    @State private var name: String = ""
    @State private var targetAmountString: String = ""

    public var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Goal Name (e.g. Vacation)", text: $name)
                    TextField("Target Amount", text: $targetAmountString)
                        .keyboardType(.decimalPad)
                }
            }
            .navigationTitle("New Savings Goal")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        if let amt = Double(targetAmountString), !name.isEmpty {
                            let newPiggy = PiggyBank(name: name, targetAmount: amt)
                            store.addPiggyBank(newPiggy)
                            dismiss()
                        }
                    }
                }
            }
        }
    }
}
