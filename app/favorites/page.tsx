"use client";

import { useState, useEffect, useCallback } from "react";
import { RecipeDisplayCard } from "@/components/recipe-card"; // Renamed component
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

// Interface for a favorited recipe stored in our MongoDB
interface StoredFavoriteRecipe {
  _id: string; // MongoDB's unique document ID
  recipeId: string; // TheMealDB's unique recipe ID
  recipeName: string;
  imageUrl: string;
}

export default function MyFavoritesPage() { // Renamed for clarity
  const [myFavoriteRecipes, setMyFavoriteRecipes] = useState<StoredFavoriteRecipe[]>([]); // Renamed for clarity
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true); // Renamed for clarity
  const { toast } = useToast();

  // Function to fetch the list of favorited recipes from our backend
  const fetchMyFavorites = useCallback(async () => {
    setIsLoadingFavorites(true);
    try {
      const response = await fetch("/api/favorites");
      if (response.ok) {
        const data = await response.json();
        setMyFavoriteRecipes(data);
      } else {
        console.error("Failed to fetch favorite recipes:", response.statusText);
        toast({
          title: "Favorites Load Error",
          description: "Couldn't retrieve your favorite recipes. Please try refreshing.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching favorite recipes:", error);
      toast({
        title: "Network Problem",
        description: "Failed to connect to the server to load favorites. Check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingFavorites(false);
    }
  }, [toast]);

  // Fetch favorites on component mount
  useEffect(() => {
    fetchMyFavorites();
  }, [fetchMyFavorites]);

  // Handler for removing a recipe from favorites directly from this page
  const handleRemoveFavoriteFromList = async (recipeIdToRemove: string) => { // Renamed for clarity
    try {
      const response = await fetch(`/api/favorites/${recipeIdToRemove}`, {
        method: "DELETE",
      });
      if (response.ok) {
        // Optimistically update the UI by filtering out the removed recipe
        setMyFavoriteRecipes(prevFavorites => prevFavorites.filter((fav) => fav.recipeId !== recipeIdToRemove));
        toast({
          title: "Recipe Removed",
          description: "The recipe has been successfully removed from your favorites.",
        });
      } else {
        const errorDetails = await response.json();
        toast({
          title: "Removal Failed",
          description: errorDetails.message || "Failed to remove recipe from favorites.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Client-side error removing favorite:", error);
      toast({
        title: "Network Error",
        description: "Could not connect to the server to remove favorite. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingFavorites) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-600">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl">Loading your cherished recipes...</p>
        <span className="sr-only">Loading favorite recipes...</span>
      </div>
    );
  }

  return (
    <section className="space-y-8 py-8">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 dark:text-gray-100">
        Your Favorite Recipes
      </h1>
      {myFavoriteRecipes.length === 0 ? (
        <p className="text-center text-xl text-muted-foreground py-10">
          It looks like you haven&apos;t added any recipes to your favorites yet.
          <br />
          Head over to <Link href="/" className="text-primary hover:underline">Browse Recipes</Link> to find some!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {myFavoriteRecipes.map((favoriteItem) => (
            <RecipeDisplayCard
              key={favoriteItem.recipeId} // Use recipeId as key for consistency with TheMealDB
              recipeId={favoriteItem.recipeId}
              recipeName={favoriteItem.recipeName}
              imageUrl={favoriteItem.imageUrl}
              showRemoveButton={true} // Explicitly show the remove button on this page
              onRemoveFromFavorites={handleRemoveFavoriteFromList}
            />
          ))}
        </div>
      )}
    </section>
  );
}
