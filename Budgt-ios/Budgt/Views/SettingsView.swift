import SwiftUI

public struct SettingsView: View {
    @EnvironmentObject var store: DataStore
    @State private var showingResetAlert = false

    let currencies = [
        ("USD", "$", "United States Dollar"),
        ("EUR", "€", "Euro"),
        ("IDR", "Rp", "Indonesian Rupiah"),
        ("MYR", "RM", "Malaysian Ringgit"),
        ("GBP", "£", "British Pound"),
        ("JPY", "¥", "Japanese Yen")
    ]

    public var body: some View {
        NavigationStack {
            List {
                Section(header: Text("Currency Settings")) {
                    Picker("Primary Currency", selection: $store.settings.currency) {
                        ForEach(currencies, id: \.0) { curr in
                            Text("\(curr.0) (\(curr.1)) - \(curr.2)").tag(curr.0)
                        }
                    }
                    .onChange(of: store.settings.currency) { newValue in
                        if let found = currencies.first(where: { $0.0 == newValue }) {
                            store.settings.currencySymbol = found.1
                        }
                    }
                }

                Section(header: Text("Features & Management")) {
                    NavigationLink(destination: BillsView().environmentObject(store)) {
                        Label("Scheduled Bills & Subscriptions", systemImage: "calendar.badge.clock")
                    }
                }

                Section(header: Text("Data & Storage")) {
                    Button(role: .destructive) {
                        showingResetAlert = true
                    } label: {
                        Label("Reset Demo Seed Data", systemImage: "arrow.counterclockwise.circle")
                    }
                }

                Section(header: Text("About BUDGT iOS")) {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.secondary)
                    }
                    HStack {
                        Text("Privacy")
                        Spacer()
                        Text("100% Client-Side Local Storage")
                            .foregroundColor(.secondary)
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("More & Settings")
            .alert("Reset Data?", isPresented: $showingResetAlert) {
                Button("Cancel", role: .cancel) {}
                Button("Reset", role: .destructive) {
                    store.seedInitialData()
                }
            } message: {
                Text("This will restore initial demo transactions, accounts, categories, and budgets.")
            }
        }
    }
}
