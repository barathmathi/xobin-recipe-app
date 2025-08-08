import Link from "next/link";
import { UtensilsCrossed } from 'lucide-react'; // Using Lucide for icons

/**
 * Renders the main application header with navigation links.
 * This component is a client component to allow for interactive elements
 * if needed in the future, but currently acts as a static header.
 */
export function AppHeader() {
  return (
    <header className="bg-primary text-primary-foreground py-4 px-6 flex items-center justify-between shadow-md">
      {/* Application title and logo, links to the home page */}
      <Link href="/" className="flex items-center gap-2 text-lg font-bold hover:opacity-80 transition-opacity">
        <UtensilsCrossed className="w-6 h-6" />
        <span>Recipe Explorer</span> {/* Slightly more evocative name */}
      </Link>
      {/* Main navigation links */}
      <nav className="flex items-center gap-4">
        <Link href="/" className="hover:underline underline-offset-4">
          Browse Recipes
        </Link>
        <Link href="/favorites" className="hover:underline underline-offset-4">
          My Favorites
        </Link>
      </nav>
    </header>
  );
}
