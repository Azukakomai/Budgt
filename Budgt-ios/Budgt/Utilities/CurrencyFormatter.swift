import Foundation
import SwiftUI

public struct CurrencyFormatter {
    public static func format(_ amount: Double, currency: String = "USD") -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = currency
        
        switch currency.uppercased() {
        case "IDR":
            formatter.currencySymbol = "Rp "
            formatter.maximumFractionDigits = 0
        case "MYR":
            formatter.currencySymbol = "RM "
            formatter.maximumFractionDigits = 2
        case "EUR":
            formatter.currencySymbol = "€"
            formatter.maximumFractionDigits = 2
        case "GBP":
            formatter.currencySymbol = "£"
            formatter.maximumFractionDigits = 2
        case "JPY":
            formatter.currencySymbol = "¥"
            formatter.maximumFractionDigits = 0
        default:
            formatter.currencySymbol = "$"
            formatter.maximumFractionDigits = 2
        }
        
        return formatter.string(from: NSNumber(value: amount)) ?? "\(currency) \(amount)"
    }
}

public extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 122, 255)
        }
        
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
