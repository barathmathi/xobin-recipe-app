import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Trash2 } from 'lucide-react';

interface RecipeCardProps {
  recipeId: string; // Renamed from 'id' for clarity with TheMealDB ID
  recipeName: string; // Renamed from 'name'
  imageUrl: string;   // Renamed from 'image'
  shortDescription?: string; // Renamed from 'description'
  isCurrentlyFavorite?: boolean; // Renamed from 'isFavorite' for clarity
  onToggleFavoriteStatus?: (recipeId: string, recipeName: string, imageUrl: string, isCurrentlyFavorite: boolean) => void;
  onRemoveFromFavorites?: (recipeId: string) => void; // Renamed from 'onRemoveFavorite'
  showRemoveButton?: boolean; // Indicates if this card is for the favorites page
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
  isCurrentlyFavorite,
  onToggleFavoriteStatus,
  onRemoveFromFavorites,
  showRemoveButton = false,
}: RecipeCardProps) {
  // Handler for adding/removing from favorites on the main recipe list
  const handleFavoriteToggle = () => {
    if (onToggleFavoriteStatus) {
      onToggleFavoriteStatus(recipeId, recipeName, imageUrl, isCurrentlyFavorite || false);
    }
  };

  // Handler for removing from favorites on the favorites page
  const handleRemoveAction = () => {
    if (onRemoveFromFavorites) {
      onRemoveFromFavorites(recipeId);
    }
  };

  return (
    <Card className="w-full max-w-sm rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
      {/* Link to the detailed recipe page */}
      <Link href={`/recipe/${recipeId}`}>
        <Image
          src={imageUrl || "/placeholder.svg?height=200&width=300&query=delicious food"} // More descriptive placeholder query
          alt={recipeName}
          width={300}
          height={200}
          className="w-full h-48 object-cover"
          priority // Prioritize loading for initial view
        />
      </Link>
      <CardHeader>
        <CardTitle className="text-lg font-semibold truncate">{recipeName}</CardTitle>
        {shortDescription && (
          <CardDescription className="text-sm text-muted-foreground line-clamp-2">
            {shortDescription}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <Link href={`/recipe/${recipeId}`} passHref>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Link>
        {/* Conditional rendering for favorite/remove buttons */}
        {showRemoveButton ? (
          // Button for removing from favorites (on the favorites page)
          <Button variant="destructive" size="icon" onClick={handleRemoveAction} aria-label="Remove from favorites">
            <Trash2 className="w-4 h-4" />
          </Button>
        ) : (
          // Button for toggling favorite status (on the main recipe list)
          onToggleFavoriteStatus && (
            <Button
              variant={isCurrentlyFavorite ? "secondary" : "ghost"}
              size="icon"
              onClick={handleFavoriteToggle}
              aria-label={isCurrentlyFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={isCurrentlyFavorite ? "w-4 h-4 fill-red-500 text-red-500" : "w-4 h-4"} />
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );
}
