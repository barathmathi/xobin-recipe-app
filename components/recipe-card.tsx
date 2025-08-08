import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Trash2 } from 'lucide-react';

interface RecipeCardProps {
  recipeId: string;
  recipeName: string;
  imageUrl: string;
  shortDescription?: string;
  category?: string; // Added category for the badge
  isCurrentlyFavorite?: boolean;
  onToggleFavoriteStatus?: (recipeId: string, recipeName: string, imageUrl: string, isCurrentlyFavorite: boolean) => void;
  onRemoveFromFavorites?: (recipeId: string) => void;
  showRemoveButton?: boolean;
}

/**
 * A reusable card component to display a recipe.
 * It can show a recipe from the main list or a favorited recipe,
 * with appropriate actions (view details, add/remove favorite).
 */
export function RecipeDisplayCard({
  recipeId,
  recipeName,
  imageUrl,
  shortDescription,
  category, // Destructure category
  isCurrentlyFavorite,
  onToggleFavoriteStatus,
  onRemoveFromFavorites,
  showRemoveButton = false,
}: RecipeCardProps) {
  const handleFavoriteToggle = () => {
    if (onToggleFavoriteStatus) {
      onToggleFavoriteStatus(recipeId, recipeName, imageUrl, isCurrentlyFavorite || false);
    }
  };

  const handleRemoveAction = () => {
    if (onRemoveFromFavorites) {
      onRemoveFromFavorites(recipeId);
    }
  };

  return (
    <Card className="w-full max-w-sm rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] animate-fade-in"> {/* Larger rounded corners, softer shadow, subtle animation */}
      <Link href={`/recipe/${recipeId}`} className="block relative h-48 overflow-hidden">
        <Image
          src={imageUrl || "/placeholder.svg?height=200&width=300&query=delicious food"}
          alt={recipeName}
          fill
          style={{ objectFit: "cover" }}
          className="transition-transform duration-300 hover:scale-105" // Image zoom on hover
          priority
        />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        {/* Category Badge */}
        {category && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full shadow-md">
            {category}
          </span>
        )}
      </Link>
      <CardHeader className="pt-4 pb-2"> {/* Adjusted padding */}
        <CardTitle className="text-xl font-heading font-semibold text-foreground truncate">{recipeName}</CardTitle> {/* Use font-heading */}
        {shortDescription && (
          <CardDescription className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {shortDescription}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex items-center justify-between pb-4"> {/* Adjusted padding */}
        <Link href={`/recipe/${recipeId}`} passHref>
          <Button variant="outline" size="sm" className="rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"> {/* Rounded button, border */}
            View Details
          </Button>
        </Link>
        {showRemoveButton ? (
          <Button variant="destructive" size="icon" onClick={handleRemoveAction} aria-label="Remove from favorites" className="rounded-full hover:scale-110 transition-transform">
            <Trash2 className="w-5 h-5" />
          </Button>
        ) : (
          onToggleFavoriteStatus && (
            <Button
              variant={isCurrentlyFavorite ? "secondary" : "ghost"}
              size="icon"
              onClick={handleFavoriteToggle}
              aria-label={isCurrentlyFavorite ? "Remove from favorites" : "Add to favorites"}
              className="rounded-full hover:scale-110 transition-transform"
            >
              <Heart className={isCurrentlyFavorite ? "w-5 h-5 fill-red-500 text-red-500" : "w-5 h-5 text-muted-foreground"} /> {/* Larger icon, muted color when not favorited */}
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );
}
