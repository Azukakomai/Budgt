import SwiftUI

public struct MainTabView: View {
    @EnvironmentObject var store: DataStore

    public var body: some View {
        TabView {
            DashboardView()
                .tabItem {
                    Label("Dashboard", systemImage: "chart.bar.fill")
                }

            TransactionsView()
                .tabItem {
                    Label("Transactions", systemImage: "list.bullet.rectangle.portrait.fill")
                }

            AccountsView()
                .tabItem {
                    Label("Accounts", systemImage: "creditcard.fill")
                }

            BudgetsView()
                .tabItem {
                    Label("Budgets", systemImage: "target")
                }

            SettingsView()
                .tabItem {
                    Label("More", systemImage: "ellipsis.circle.fill")
                }
        }
        .tint(.blue)
    }
}
