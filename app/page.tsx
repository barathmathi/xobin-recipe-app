"use client";

import { useState, useEffect, useCallback } from "react";
import { RecipeDisplayCard } from "@/components/recipe-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Search } from 'lucide-react';

interface MealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions: string;
  strCategory: string; // Added category to fetch
}

export default function RecipeHomePage() {
  const [availableRecipes, setAvailableRecipes] = useState<MealSummary[]>([]);
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<string[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
  const [currentSearchTerm, setCurrentSearchTerm] = useState("chicken");
  const [isPerformingSearch, setIsPerformingSearch] = useState(false);
  const { toast } = useToast();

  const fetchRecipesFromApi = useCallback(async (query: string) => {
    setIsPerformingSearch(true);
    setAvailableRecipes([]);
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // TheMealDB search results don't always include category directly,
      // so we'll fetch random recipes first to get categories, then search.
      // For simplicity, we'll assume search results have enough info or default category.
      // A more robust solution would involve fetching details for each search result.
      setAvailableRecipes(data.meals || []);
    } catch (error) {
      console.error("Error fetching recipes from TheMealDB:", error);
      toast({
        title: "Recipe Fetch Failed",
        description: "Couldn't load recipes. Please check your internet connection or try again later.",
        variant: "destructive",
      });
    } finally {
      setIsPerformingSearch(false);
    }
  }, [toast]);

  const fetchCurrentFavorites = useCallback(async () => {
    try {
      const response = await fetch("/api/favorites");
      if (response.ok) {
        const data = await response.json();
        setFavoriteRecipeIds(data.map((fav: { recipeId: string }) => fav.recipeId));
      } else {
        console.error("Failed to fetch favorite IDs:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching favorite IDs:", error);
    } finally {
      setIsLoadingRecipes(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipesFromApi(currentSearchTerm);
    fetchCurrentFavorites();
  }, [fetchRecipesFromApi, fetchCurrentFavorites, currentSearchTerm]);

  const handleSearchSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    const searchInput = (e.target as HTMLFormElement).elements.namedItem("search") as HTMLInputElement;
    if (searchInput.value.trim() !== currentSearchTerm) {
      setCurrentSearchTerm(searchInput.value.trim());
    }
  };

  const handleToggleRecipeFavorite = async (recipeId: string, recipeName: string, imageUrl: string, isCurrentlyFavorite: boolean) => {
    if (isCurrentlyFavorite) {
      try {
        const response = await fetch(`/api/favorites/${recipeId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setFavoriteRecipeIds(prevIds => prevIds.filter((id) => id !== recipeId));
          toast({
            title: "Removed from Favorites",
            description: `${recipeName} is no longer in your favorites.`,
          });
        } else {
          const errorDetails = await response.json();
          toast({
            title: "Removal Failed",
            description: errorDetails.message || "Could not remove recipe from favorites.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Client-side error removing favorite:", error);
        toast({
          title: "Network Error",
          description: "Failed to connect to the server to remove favorite. Try again.",
          variant: "destructive",
        });
      }
    } else {
      try {
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recipeId, recipeName, imageUrl }),
        });
        if (response.ok) {
          setFavoriteRecipeIds(prevIds => [...prevIds, recipeId]);
          toast({
            title: "Added to Favorites!",
            description: `${recipeName} is now in your favorites.`,
          });
        } else {
          const errorDetails = await response.json();
          toast({
            title: "Add Failed",
            description: errorDetails.message || "Could not add recipe to favorites.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Client-side error adding favorite:", error);
        toast({
          title: "Network Error",
          description: "Failed to connect to the server to add favorite. Try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <section className="space-y-10 py-8"> {/* Increased spacing */}
      <h1 className="text-5xl font-heading font-extrabold text-center text-foreground leading-tight"> {/* Larger, bolder heading */}
        Discover Delicious Recipes
      </h1>
      <form onSubmit={handleSearchSubmission} className="flex gap-3 max-w-xl mx-auto p-2 bg-card rounded-full shadow-lg border border-border"> {/* Rounded search bar, shadow, border */}
        <Input
          type="search"
          name="search"
          placeholder="Search for a dish, e.g., 'pasta' or 'chicken'..."
          defaultValue={currentSearchTerm}
          className="flex-1 border-none focus-visible:ring-0 bg-transparent text-lg px-4" // Larger text, no border/ring
        />
        <Button type="submit" disabled={isPerformingSearch} className="px-8 py-3 rounded-full text-lg font-semibold shadow-md hover:shadow-lg transition-all"> {/* Rounded, larger button */}
          {isPerformingSearch ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
          Search
        </Button>
      </form>

      {isLoadingRecipes || isPerformingSearch ? (
        <div className="flex flex-col items-center justify-center h-80 text-muted-foreground"> {/* Increased height */}
          <Loader2 className="h-14 w-14 animate-spin text-primary mb-6" /> {/* Larger loader */}
          <p className="text-2xl font-medium">Whipping up some recipes for you...</p> {/* Larger text */}
          <span className="sr-only">Loading recipes...</span>
        </div>
      ) : availableRecipes.length === 0 ? (
        <p className="text-center text-2xl text-muted-foreground py-16 font-medium"> {/* Larger text, more padding */}
          No recipes found for &quot;<span className="font-semibold text-foreground">{currentSearchTerm}</span>&quot;.
          <br />
          Perhaps try a different ingredient or dish name?
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"> {/* Increased gap */}
          {availableRecipes.map((recipe) => (
            <RecipeDisplayCard
              key={recipe.idMeal}
              recipeId={recipe.idMeal}
              recipeName={recipe.strMeal}
              imageUrl={recipe.strMealThumb}
              shortDescription={recipe.strInstructions?.substring(0, 100) + "..." || "No detailed description available."}
              category={recipe.strCategory || "Dish"} // Pass category, default if not available
              isCurrentlyFavorite={favoriteRecipeIds.includes(recipe.idMeal)}
              onToggleFavoriteStatus={handleToggleRecipeFavorite}
            />
          ))}
        </div>
      )}
    </section>
  );
}
