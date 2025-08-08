import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css"; // Global Tailwind CSS styles
import { AppHeader } from "@/components/header"; // Renamed header component
import { Toaster } from "@/components/ui/toaster"; // shadcn/ui Toaster for notifications

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Recipe Explorer App", // More specific title
  description: "Discover, view, and favorite delicious recipes from TheMealDB API.",
    generator: 'v0.dev'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppHeader /> {/* Our custom header component */}
        <main className="container mx-auto p-4 md:p-6 min-h-[calc(100vh-64px)]"> {/* Added min-height for better layout */}
          {children}
        </main>
        <Toaster /> {/* Renders toast notifications */}
      </body>
    </html>
  );
}
