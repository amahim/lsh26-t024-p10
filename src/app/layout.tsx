import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dhaka Prepaid Electricity Meter Advisor",
  description: "Reconstruct meter balances, predict run-out dates, calculate required recharges, and analyze recharge habits.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="antialiased bg-[#090d16] text-slate-100 min-h-screen"
      >
        {children}
      </body>
    </html>
  );
}
