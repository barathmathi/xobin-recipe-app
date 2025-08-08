"use client";

import { useState, useEffect, useCallback } from "react"; // Added useCallback for memoization
import { RecipeDisplayCard } from "@/components/recipe-card"; // Renamed component
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Search } from 'lucide-react';

// Type definition for a meal object from TheMealDB API search results
interface MealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions: string; // TheMealDB search results sometimes include this, useful for description
}

export default function RecipeHomePage() { // Renamed for clarity
  const [availableRecipes, setAvailableRecipes] = useState<MealSummary[]>([]); // Renamed for clarity
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<string[]>([]); // Renamed for clarity
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true); // Renamed for clarity
  const [currentSearchTerm, setCurrentSearchTerm] = useState("chicken"); // More descriptive name
  const [isPerformingSearch, setIsPerformingSearch] = useState(false); // Renamed for clarity
  const { toast } = useToast();

  // Function to fetch recipes from TheMealDB API
  const fetchRecipesFromApi = useCallback(async (query: string) => {
    setIsPerformingSearch(true);
    setAvailableRecipes([]); // Clear previous results immediately
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAvailableRecipes(data.meals || []); // The API returns null if no meals found
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
  }, [toast]); // Dependency array for useCallback

  // Function to fetch current favorite recipe IDs from our backend
  const fetchCurrentFavorites = useCallback(async () => {
    try {
      const response = await fetch("/api/favorites");
      if (response.ok) {
        const data = await response.json();
        setFavoriteRecipeIds(data.map((fav: { recipeId: string }) => fav.recipeId));
      } else {
        console.error("Failed to fetch favorite IDs:", response.statusText);
        // No toast here, as it's a background fetch and might not be critical for initial page load
      }
    } catch (error) {
      console.error("Error fetching favorite IDs:", error);
    } finally {
      setIsLoadingRecipes(false); // Mark initial loading complete after both fetches
    }
  }, []); // Dependency array for useCallback

  // Initial data fetch on component mount
  useEffect(() => {
    fetchRecipesFromApi(currentSearchTerm);
    fetchCurrentFavorites();
  }, [fetchRecipesFromApi, fetchCurrentFavorites, currentSearchTerm]); // Include currentSearchTerm as a dependency

  // Handler for the search form submission
  const handleSearchSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    const searchInput = (e.target as HTMLFormElement).elements.namedItem("search") as HTMLInputElement;
    if (searchInput.value.trim() !== currentSearchTerm) { // Only search if term changed
      setCurrentSearchTerm(searchInput.value.trim());
    }
  };

  // Handler for toggling a recipe's favorite status
  const handleToggleRecipeFavorite = async (recipeId: string, recipeName: string, imageUrl: string, isCurrentlyFavorite: boolean) => {
    if (isCurrentlyFavorite) {
      // Logic to remove from favorites
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
      // Logic to add to favorites
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
    <section className="space-y-8 py-8">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 dark:text-gray-100">
        Discover Delicious Recipes
      </h1>
      <form onSubmit={handleSearchSubmission} className="flex gap-3 max-w-lg mx-auto p-2 bg-white rounded-lg shadow-md">
        <Input
          type="search"
          name="search"
          placeholder="Search for a dish, e.g., 'pasta' or 'chicken'..."
          defaultValue={currentSearchTerm}
          className="flex-1 border-none focus-visible:ring-0"
        />
        <Button type="submit" disabled={isPerformingSearch} className="px-6 py-2">
          {isPerformingSearch ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          Search
        </Button>
      </form>

      {isLoadingRecipes || isPerformingSearch ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-600">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-lg">Whipping up some recipes for you...</p>
          <span className="sr-only">Loading recipes...</span>
        </div>
      ) : availableRecipes.length === 0 ? (
        <p className="text-center text-xl text-muted-foreground py-10">
          No recipes found for &quot;{currentSearchTerm}&quot;. Perhaps try a different ingredient or dish name?
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {availableRecipes.map((recipe) => (
            <RecipeDisplayCard
              key={recipe.idMeal}
              recipeId={recipe.idMeal}
              recipeName={recipe.strMeal}
              imageUrl={recipe.strMealThumb}
              shortDescription={recipe.strInstructions?.substring(0, 100) + "..." || "No detailed description available."}
              isCurrentlyFavorite={favoriteRecipeIds.includes(recipe.idMeal)}
              onToggleFavoriteStatus={handleToggleRecipeFavorite}
            />
          ))}
        </div>
      )}
    </section>
  );
}
