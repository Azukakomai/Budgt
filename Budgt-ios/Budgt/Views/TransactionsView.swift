import SwiftUI

public struct TransactionsView: View {
    @EnvironmentObject var store: DataStore
    @State private var searchText = ""
    @State private var selectedFilter: FilterType = .all
    @State private var showingAddModal = false

    enum FilterType: String, CaseIterable, Identifiable {
        case all = "All"
        case withdrawal = "Expenses"
        case deposit = "Income"
        case transfer = "Transfers"
        var id: String { self.rawValue }
    }

    public var filteredTransactions: [Transaction] {
        store.transactions.filter { tx in
            let matchesSearch = searchText.isEmpty || tx.description.localizedCaseInsensitiveContains(searchText)
            let matchesFilter: Bool
            switch selectedFilter {
            case .all: matchesFilter = true
            case .withdrawal: matchesFilter = tx.type == .withdrawal
            case .deposit: matchesFilter = tx.type == .deposit
            case .transfer: matchesFilter = tx.type == .transfer
            }
            return matchesSearch && matchesFilter
        }
    }

    public var body: some View {
        NavigationStack {
            VStack {
                Picker("Filter", selection: $selectedFilter) {
                    ForEach(FilterType.allCases) { filter in
                        Text(filter.rawValue).tag(filter)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)
                .padding(.top, 8)

                List {
                    ForEach(filteredTransactions) { tx in
                        TransactionRowView(transaction: tx)
                            .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                Button(role: .destructive) {
                                    store.deleteTransaction(tx)
                                } label: {
                                    Label("Delete", systemImage: "trash")
                                }
                            }
                    }
                }
                .listStyle(.insetGrouped)
                .searchable(text: $searchText, prompt: "Search transactions...")
            }
            .navigationTitle("Transactions")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showingAddModal = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title3)
                    }
                }
            }
            .sheet(isPresented: $showingAddModal) {
                AddTransactionModalView()
                    .environmentObject(store)
            }
        }
    }
}

// MARK: - Add Transaction Modal View
public struct AddTransactionModalView: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.dismiss) var dismiss

    @State private var type: TransactionType = .withdrawal
    @State private var description: String = ""
    @State private var amountString: String = ""
    @State private var categoryId: String = ""
    @State private var sourceAccountId: String = ""
    @State private var destAccountId: String = ""
    @State private var date: Date = Date()
    @State private var notes: String = ""

    public var body: some View {
        NavigationStack {
            Form {
                Section {
                    Picker("Transaction Type", selection: $type) {
                        ForEach(TransactionType.allCases) { t in
                            Text(t.title).tag(t)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                Section(header: Text("Details")) {
                    TextField("Description (e.g. Grocery Store)", text: $description)
                    TextField("Amount", text: $amountString)
                        .keyboardType(.decimalPad)
                    DatePicker("Date", selection: $date, displayedComponents: .date)
                }

                if type != .transfer {
                    Section(header: Text("Category")) {
                        Picker("Category", selection: $categoryId) {
                            Text("Select Category").tag("")
                            ForEach(store.categories.filter { $0.type.rawValue == (type == .withdrawal ? "expense" : "income") }) { cat in
                                Text(cat.name).tag(cat.id)
                            }
                        }
                    }
                }

                Section(header: Text("Accounts")) {
                    if type == .withdrawal || type == .transfer {
                        Picker("Source Account", selection: $sourceAccountId) {
                            Text("Select Account").tag("")
                            ForEach(store.accounts) { acc in
                                Text(acc.name).tag(acc.id)
                            }
                        }
                    }
                    if type == .deposit || type == .transfer {
                        Picker("Destination Account", selection: $destAccountId) {
                            Text("Select Account").tag("")
                            ForEach(store.accounts) { acc in
                                Text(acc.name).tag(acc.id)
                            }
                        }
                    }
                }

                Section(header: Text("Notes")) {
                    TextField("Optional notes", text: $notes)
                }
            }
            .navigationTitle("Add Transaction")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        saveTransaction()
                    }
                    .disabled(description.isEmpty || Double(amountString) == nil)
                }
            }
            .onAppear {
                if let firstAcc = store.accounts.first?.id {
                    sourceAccountId = firstAcc
                    destAccountId = firstAcc
                }
                if let firstCat = store.categories.first(where: { $0.type == .expense })?.id {
                    categoryId = firstCat
                }
            }
        }
    }

    private func saveTransaction() {
        guard let amount = Double(amountString) else { return }
        let newTx = Transaction(
            type: type,
            amount: amount,
            description: description,
            categoryId: type == .transfer ? nil : (categoryId.isEmpty ? nil : categoryId),
            sourceAccountId: sourceAccountId.isEmpty ? nil : sourceAccountId,
            destAccountId: destAccountId.isEmpty ? nil : destAccountId,
            date: date,
            notes: notes.isEmpty ? nil : notes
        )
        store.addTransaction(newTx)
        dismiss()
    }
}
