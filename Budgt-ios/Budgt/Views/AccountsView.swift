import SwiftUI

public struct AccountsView: View {
    @EnvironmentObject var store: DataStore
    @State private var showingAddAccount = false

    public var assetAccounts: [Account] {
        store.accounts.filter { $0.type == .asset }
    }

    public var liabilityAccounts: [Account] {
        store.accounts.filter { $0.type == .liability }
    }

    public var body: some View {
        NavigationStack {
            List {
                Section(header: Text("Assets (\(CurrencyFormatter.format(store.totalAssets, currency: store.settings.currency)))")) {
                    if assetAccounts.isEmpty {
                        Text("No asset accounts added.")
                            .foregroundColor(.secondary)
                    } else {
                        ForEach(assetAccounts) { account in
                            AccountRowView(account: account)
                        }
                        .onDelete { indexSet in
                            indexSet.forEach { store.deleteAccount(id: assetAccounts[$0].id) }
                        }
                    }
                }

                Section(header: Text("Liabilities (\(CurrencyFormatter.format(store.totalLiabilities, currency: store.settings.currency)))")) {
                    if liabilityAccounts.isEmpty {
                        Text("No liability accounts added.")
                            .foregroundColor(.secondary)
                    } else {
                        ForEach(liabilityAccounts) { account in
                            AccountRowView(account: account)
                        }
                        .onDelete { indexSet in
                            indexSet.forEach { store.deleteAccount(id: liabilityAccounts[$0].id) }
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Accounts")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showingAddAccount = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title3)
                    }
                }
            }
            .sheet(isPresented: $showingAddAccount) {
                AddAccountModalView()
                    .environmentObject(store)
            }
        }
    }
}

public struct AccountRowView: View {
    @EnvironmentObject var store: DataStore
    let account: Account
    @State private var showingEdit = false

    public var body: some View {
        HStack(spacing: 14) {
            Image(systemName: account.icon)
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(Color(hex: account.colorHex))
                .frame(width: 40, height: 40)
                .background(Color(hex: account.colorHex).opacity(0.15))
                .clipShape(RoundedRectangle(cornerRadius: 10))
            
            VStack(alignment: .leading, spacing: 2) {
                Text(account.name)
                    .font(.body)
                    .fontWeight(.semibold)
                Text(account.type.title)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Text(CurrencyFormatter.format(account.balance, currency: store.settings.currency))
                .font(.callout)
                .fontWeight(.bold)
                .foregroundColor(account.type == .liability ? .red : .primary)
        }
        .padding(.vertical, 4)
        .contentShape(Rectangle())
        .onTapGesture {
            showingEdit = true
        }
        .sheet(isPresented: $showingEdit) {
            EditAccountModalView(account: account)
                .environmentObject(store)
        }
    }
}

public struct AddAccountModalView: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.dismiss) var dismiss

    @State private var name: String = ""
    @State private var type: AccountType = .asset
    @State private var balanceString: String = "0"

    public var body: some View {
        NavigationStack {
            Form {
                Section(header: Text("Account Details")) {
                    TextField("Account Name (e.g. Bank Account)", text: $name)
                    Picker("Account Type", selection: $type) {
                        ForEach(AccountType.allCases) { t in
                            Text(t.title).tag(t)
                        }
                    }
                    .pickerStyle(.segmented)
                    TextField("Initial Balance", text: $balanceString)
                        .keyboardType(.decimalPad)
                }
            }
            .navigationTitle("New Account")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        if let balance = Double(balanceString), !name.isEmpty {
                            let newAcc = Account(name: name, type: type, balance: balance)
                            store.addAccount(newAcc)
                            dismiss()
                        }
                    }
                    .disabled(name.isEmpty || Double(balanceString) == nil)
                }
            }
        }
    }
}

public struct EditAccountModalView: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.dismiss) var dismiss

    let account: Account
    @State private var name: String = ""
    @State private var balanceString: String = ""

    public var body: some View {
        NavigationStack {
            Form {
                Section(header: Text("Edit Account")) {
                    TextField("Account Name", text: $name)
                    TextField("Current Balance", text: $balanceString)
                        .keyboardType(.decimalPad)
                }
            }
            .navigationTitle("Edit Balance")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        if let balance = Double(balanceString), !name.isEmpty {
                            var updated = account
                            updated.name = name
                            updated.balance = balance
                            store.updateAccount(updated)
                            dismiss()
                        }
                    }
                }
            }
            .onAppear {
                name = account.name
                balanceString = String(format: "%.2f", account.balance)
            }
        }
    }
}
