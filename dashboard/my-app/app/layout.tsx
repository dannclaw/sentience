import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SolanaWalletProvider } from "./components/WalletProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sentience AI | Treasury Dashboard",
  description: "Autonomous DeFi Treasury Management on Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-gradient-animate min-h-screen">
        <SolanaWalletProvider>
          {/* Animated particles background */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 20}s`,
                  animationDuration: `${15 + Math.random() * 10}s`,
                }}
              />
            ))}
          </div>
          
          {/* Grid pattern overlay */}
          <div className="fixed inset-0 pointer-events-none grid-pattern opacity-50" />
          
          {/* Main content */}
          <main className="relative z-10">
            {children}
          </main>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
