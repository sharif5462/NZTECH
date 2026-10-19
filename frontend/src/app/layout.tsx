import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "HirePulse | AI-Powered Recruitment & Pipeline Assessment",
  description: "Next-generation full-stack ATS with intelligent candidate matching and status workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <p>
            HirePulse ATS &bull; Built for NZ Tech Innovation Software Developer Practical Assessment
          </p>
        </footer>
      </body>
    </html>
  );
}
