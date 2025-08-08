import Link from "next/link";
import { UtensilsCrossed } from 'lucide-react'; // Using Lucide for icons

/**
 * Renders the main application header with navigation links.
 * This component is a client component to allow for interactive elements
 * if needed in the future, but currently acts as a static header.
 */
export function AppHeader() {
  return (
    <header className="bg-card text-card-foreground py-4 px-6 flex items-center justify-between shadow-md sticky top-0 z-50"> {/* Use card colors, make it sticky */}
      {/* Application title and logo, links to the home page */}
      <Link href="/" className="flex items-center gap-2 text-2xl font-heading font-extrabold text-primary hover:opacity-90 transition-opacity"> {/* Use font-heading, primary color */}
        <UtensilsCrossed className="w-7 h-7" /> {/* Slightly larger icon */}
        <span>Recipe Explorer</span>
      </Link>
      {/* Main navigation links */}
      <nav className="flex items-center gap-6"> {/* Increased gap */}
        <Link href="/" className="text-lg font-medium text-foreground hover:text-primary transition-colors"> {/* Larger text, color transition */}
          Browse Recipes
        </Link>
        <Link href="/favorites" className="text-lg font-medium text-foreground hover:text-primary transition-colors"> {/* Larger text, color transition */}
          My Favorites
        </Link>
      </nav>
    </header>
  );
}
