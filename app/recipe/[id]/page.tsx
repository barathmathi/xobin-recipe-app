"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, Youtube } from 'lucide-react'; // Added Youtube icon
import { useToast } from "@/components/ui/use-toast";

// Detailed type definition for a meal from TheMealDB API lookup
interface FullMealDetails {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions: string;
  strCategory: string;
  strArea: string;
  strYoutube: string | null; // Can be null
  [key: string]: string | null; // For dynamic ingredient/measure properties
}

export default function SingleRecipePage({ params }: { params: { id: string } }) { // Renamed for clarity
  const { id: recipeIdFromUrl } = params; // Destructure and rename for clarity
  const [recipeDetails, setRecipeDetails] = useState<FullMealDetails | null>(null); // Renamed for clarity
  const [isLoadingDetails, setIsLoadingDetails] = useState(true); // Renamed for clarity
  const [isRecipeFavorited, setIsRecipeFavorited] = useState(false); // Renamed for clarity
  const [isUpdatingFavoriteStatus, setIsUpdatingFavoriteStatus] = useState(false); // Renamed for clarity
  const { toast } = useToast();

  // Fetches detailed recipe information from TheMealDB API
  const fetchRecipeData = useCallback(async () => {
    setIsLoadingDetails(true);
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeIdFromUrl}`);
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      const data = await response.json();
      if (data.meals && data.meals.length > 0) {
        setRecipeDetails(data.meals[0]);
      } else {
        setRecipeDetails(null); // No recipe found for this ID
      }
    } catch (error) {
      console.error("Error fetching recipe details:", error);
      toast({
        title: "Recipe Load Error",
        description: "Failed to load recipe details. It might not exist or there's a network issue.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDetails(false);
    }
  }, [recipeIdFromUrl, toast]);

  // Checks if the current recipe is in the user's favorites
  const checkFavoriteStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/favorites");
      if (response.ok) {
        const favoritesList = await response.json();
        setIsRecipeFavorited(favoritesList.some((fav: { recipeId: string }) => fav.recipeId === recipeIdFromUrl));
      } else {
        console.error("Failed to check favorite status:", response.statusText);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  }, [recipeIdFromUrl]);

  // Effect to run fetches on component mount and when recipeId changes
  useEffect(() => {
    fetchRecipeData();
    checkFavoriteStatus();
  }, [fetchRecipeData, checkFavoriteStatus]);

  // Helper function to extract ingredients and measures from the API response
  const extractIngredients = (meal: FullMealDetails) => {
    const ingredientsList: string[] = [];
    // TheMealDB API provides ingredients and measures in properties like strIngredient1, strMeasure1, etc.
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim() !== "") {
        ingredientsList.push(`${measure ? measure.trim() + " " : ""}${ingredient.trim()}`);
      }
    }
    return ingredientsList;
  };

  // Handler for adding/removing the recipe from favorites
  const handleToggleFavorite = async () => {
    if (!recipeDetails) return; // Can't favorite if no recipe details are loaded

    setIsUpdatingFavoriteStatus(true);
    try {
      if (isRecipeFavorited) {
        // If currently favorited, send a DELETE request to remove it
        const response = await fetch(`/api/favorites/${recipeDetails.idMeal}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setIsRecipeFavorited(false);
          toast({
            title: "Favorite Removed",
            description: `${recipeDetails.strMeal} has been taken out of your favorites.`,
          });
        } else {
          const errorData = await response.json();
          toast({
            title: "Removal Failed",
            description: errorData.message || "Couldn't remove recipe from favorites.",
            variant: "destructive",
          });
        }
      } else {
        // If not favorited, send a POST request to add it
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipeId: recipeDetails.idMeal,
            recipeName: recipeDetails.strMeal,
            imageUrl: recipeDetails.strMealThumb,
          }),
        });
        if (response.ok) {
          setIsRecipeFavorited(true);
          toast({
            title: "Favorite Added!",
            description: `${recipeDetails.strMeal} is now in your favorites. Enjoy!`,
          });
        } else {
          const errorData = await response.json();
          toast({
            title: "Add Failed",
            description: errorData.message || "Couldn't add recipe to favorites.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Client-side error toggling favorite status:", error);
      toast({
        title: "Network Issue",
        description: "Failed to update favorite status. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingFavoriteStatus(false);
    }
  };

  if (isLoadingDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-600">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl">Fetching recipe magic...</p>
        <span className="sr-only">Loading recipe details...</span>
      </div>
    );
  }

  if (!recipeDetails) {
    return (
      <div className="text-center text-2xl font-semibold text-muted-foreground py-10">
        Oops! This recipe couldn't be found.
      </div>
    );
  }

  const ingredientsForDisplay = extractIngredients(recipeDetails);
  const youtubeVideoId = recipeDetails.strYoutube ? recipeDetails.strYoutube.split("v=")[1] : null;

  return (
    <article className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start py-8">
      {/* Recipe Image Section */}
      <div className="relative w-full aspect-video md:aspect-[4/3] lg:aspect-[5/4] rounded-lg overflow-hidden shadow-lg">
        <Image
          src={recipeDetails.strMealThumb || "/placeholder.svg?height=400&width=600&query=tasty dish"}
          alt={recipeDetails.strMeal}
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      {/* Recipe Details Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-50">
            {recipeDetails.strMeal}
          </h1>
          <Button
            variant={isRecipeFavorited ? "secondary" : "outline"}
            size="lg"
            onClick={handleToggleFavorite}
            disabled={isUpdatingFavoriteStatus}
            className="flex items-center gap-2 min-w-[200px] justify-center"
          >
            {isUpdatingFavoriteStatus ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Heart className={isRecipeFavorited ? "h-5 w-5 fill-red-500 text-red-500" : "h-5 w-5"} />
            )}
            {isRecipeFavorited ? "Remove from Favorites" : "Add to Favorites"}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base text-muted-foreground">
          <div>
            <span className="font-semibold text-gray-700 dark:text-gray-300">Category:</span> {recipeDetails.strCategory}
          </div>
          <div>
            <span className="font-semibold text-gray-700 dark:text-gray-300">Origin:</span> {recipeDetails.strArea}
          </div>
        </div>

        {/* Ingredients List */}
        <div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100">Ingredients</h2>
          <ul className="list-disc list-inside space-y-1 text-lg text-gray-700 dark:text-gray-200">
            {ingredientsForDisplay.length > 0 ? (
              ingredientsForDisplay.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))
            ) : (
              <li>No ingredients listed for this recipe.</li>
            )}
          </ul>
        </div>

        {/* Cooking Instructions */}
        <div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100">Instructions</h2>
          <p className="text-lg leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-200">
            {recipeDetails.strInstructions || "No detailed instructions available for this recipe."}
          </p>
        </div>

        {/* YouTube Video (if available) */}
        {youtubeVideoId && (
          <div>
            <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100">Watch Video Instructions</h2>
            <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-md">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                title={`YouTube video for ${recipeDetails.strMeal}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              ></iframe>
            </div>
            <a
              href={recipeDetails.strYoutube!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:underline mt-2"
            >
              <Youtube className="h-5 w-5" />
              View on YouTube
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
