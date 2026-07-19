import SwiftUI

@main
struct BudgtApp: App {
    @StateObject private var store = DataStore()

    var body: some Scene {
        WindowGroup {
            MainTabView()
                .environmentObject(store)
        }
    }
}
