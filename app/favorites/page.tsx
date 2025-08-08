"use client";

import { useState, useEffect, useCallback } from "react";
import { RecipeDisplayCard } from "@/components/recipe-card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import Link from "next/link"; // Import Link for the empty state message

interface StoredFavoriteRecipe {
  _id: string;
  recipeId: string;
  recipeName: string;
  imageUrl: string;
  // category is not stored in DB, so we'll omit it here for simplicity
  // In a real app, you might store it or fetch it on demand.
}

export default function MyFavoritesPage() {
  const [myFavoriteRecipes, setMyFavoriteRecipes] = useState<StoredFavoriteRecipe[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const { toast } = useToast();

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

  useEffect(() => {
    fetchMyFavorites();
  }, [fetchMyFavorites]);

  const handleRemoveFavoriteFromList = async (recipeIdToRemove: string) => {
    try {
      const response = await fetch(`/api/favorites/${recipeIdToRemove}`, {
        method: "DELETE",
      });
      if (response.ok) {
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
      <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
        <Loader2 className="h-14 w-14 animate-spin text-primary mb-6" />
        <p className="text-2xl font-medium">Loading your cherished recipes...</p>
        <span className="sr-only">Loading favorite recipes...</span>
      </div>
    );
  }

  return (
    <section className="space-y-10 py-8 animate-fade-in"> {/* Added fade-in animation */}
      <h1 className="text-5xl font-heading font-extrabold text-center text-foreground leading-tight">
        Your Favorite Recipes
      </h1>
      {myFavoriteRecipes.length === 0 ? (
        <p className="text-center text-2xl text-muted-foreground py-16 font-medium">
          It looks like you haven&apos;t added any recipes to your favorites yet.
          <br />
          <Link href="/" className="text-primary hover:underline font-semibold">
            Head over to Browse Recipes
          </Link> to find some inspiration!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {myFavoriteRecipes.map((favoriteItem) => (
            <RecipeDisplayCard
              key={favoriteItem.recipeId}
              recipeId={favoriteItem.recipeId}
              recipeName={favoriteItem.recipeName}
              imageUrl={favoriteItem.imageUrl}
              showRemoveButton={true}
              onRemoveFromFavorites={handleRemoveFavoriteFromList}
              // Note: Category is not stored in DB, so it won't appear on favorite cards unless fetched separately.
              // For this minimal design, we'll omit it here.
            />
          ))}
        </div>
      )}
    </section>
  );
}
