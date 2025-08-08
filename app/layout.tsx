import type { Metadata } from "next";
import { Inter, Poppins } from 'next/font/google'; // Import both fonts
import "./globals.css"; // Global Tailwind CSS styles
import { AppHeader } from "@/components/header"; // Our custom header component
import { Toaster } from "@/components/ui/toaster"; // shadcn/ui Toaster for notifications

// Configure Inter for body text
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // CSS variable for Inter
});

// Configure Poppins for headings
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"], // Specify weights for headings
  variable: "--font-poppins", // CSS variable for Poppins
});

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
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}> {/* Apply font variables */}
      <body className="bg-background text-foreground"> {/* Apply new background and foreground colors */}
        <AppHeader /> {/* Our custom header component */}
        <main className="container mx-auto p-4 md:p-6 min-h-[calc(100vh-64px)]"> {/* Added min-height for better layout */}
          {children}
        </main>
        <Toaster /> {/* Renders toast notifications */}
      </body>
    </html>
  );
}
