import SwiftUI

public struct BillsView: View {
    @EnvironmentObject var store: DataStore
    @State private var showingAddBill = false

    public var body: some View {
        NavigationStack {
            List {
                Section(header: Text("Upcoming Bills & Subscriptions")) {
                    if store.bills.isEmpty {
                        Text("No upcoming bills tracked.")
                            .foregroundColor(.secondary)
                    } else {
                        ForEach(store.bills) { bill in
                            BillRowView(bill: bill)
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Scheduled Bills")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showingAddBill = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title3)
                    }
                }
            }
            .sheet(isPresented: $showingAddBill) {
                AddBillModalView()
                    .environmentObject(store)
            }
        }
    }
}

public struct BillRowView: View {
    @EnvironmentObject var store: DataStore
    let bill: Bill

    public var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "calendar.badge.clock")
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(.purple)
                .frame(width: 38, height: 38)
                .background(Color.purple.opacity(0.12))
                .clipShape(Circle())

            VStack(alignment: .leading, spacing: 2) {
                Text(bill.name)
                    .font(.body)
                    .fontWeight(.semibold)
                HStack(spacing: 6) {
                    Text("Due: \(bill.nextDueDate, style: .date)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    if bill.autoPay {
                        Text("Auto-Pay")
                            .font(.caption2)
                            .padding(.horizontal, 4)
                            .padding(.vertical, 1)
                            .background(Color.blue.opacity(0.15))
                            .foregroundColor(.blue)
                            .cornerRadius(4)
                    }
                }
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 4) {
                Text(CurrencyFormatter.format(bill.amount, currency: store.settings.currency))
                    .font(.callout)
                    .fontWeight(.bold)

                Button("Mark Paid") {
                    store.markBillPaid(bill)
                }
                .font(.caption2)
                .buttonStyle(.borderedProminent)
                .tint(.green)
            }
        }
        .padding(.vertical, 4)
    }
}

public struct AddBillModalView: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.dismiss) var dismiss

    @State private var name: String = ""
    @State private var amountString: String = ""
    @State private var categoryId: String = ""
    @State private var dueDate: Date = Date()
    @State private var autoPay: Bool = false

    public var body: some View {
        NavigationStack {
            Form {
                Section(header: Text("Bill Info")) {
                    TextField("Bill Name (e.g. Electricity)", text: $name)
                    TextField("Amount", text: $amountString)
                        .keyboardType(.decimalPad)
                    DatePicker("Next Due Date", selection: $dueDate, displayedComponents: .date)
                    Toggle("Auto-Pay Enabled", isOn: $autoPay)
                }

                Section(header: Text("Category")) {
                    Picker("Category", selection: $categoryId) {
                        ForEach(store.categories.filter { $0.type == .expense }) { cat in
                            Text(cat.name).tag(cat.id)
                        }
                    }
                }
            }
            .navigationTitle("New Scheduled Bill")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        if let amount = Double(amountString), !name.isEmpty {
                            let newBill = Bill(name: name, amount: amount, categoryId: categoryId, nextDueDate: dueDate, autoPay: autoPay)
                            store.addBill(newBill)
                            dismiss()
                        }
                    }
                }
            }
            .onAppear {
                if let first = store.categories.filter({ $0.type == .expense }).first {
                    categoryId = first.id
                }
            }
        }
    }
}
