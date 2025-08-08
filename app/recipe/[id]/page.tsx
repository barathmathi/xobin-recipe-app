"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, Youtube } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface FullMealDetails {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions: string;
  strCategory: string;
  strArea: string;
  strYoutube: string | null;
  [key: string]: string | null;
}

export default function SingleRecipePage({ params }: { params: { id: string } }) {
  const { id: recipeIdFromUrl } = params;
  const [recipeDetails, setRecipeDetails] = useState<FullMealDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [isRecipeFavorited, setIsRecipeFavorited] = useState(false);
  const [isUpdatingFavoriteStatus, setIsUpdatingFavoriteStatus] = useState(false);
  const { toast } = useToast();

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
        setRecipeDetails(null);
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

  useEffect(() => {
    fetchRecipeData();
    checkFavoriteStatus();
  }, [fetchRecipeData, checkFavoriteStatus]);

  const extractIngredients = (meal: FullMealDetails) => {
    const ingredientsList: string[] = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim() !== "") {
        ingredientsList.push(`${measure ? measure.trim() + " " : ""}${ingredient.trim()}`);
      }
    }
    return ingredientsList;
  };

  const handleToggleFavorite = async () => {
    if (!recipeDetails) return;

    setIsUpdatingFavoriteStatus(true);
    try {
      if (isRecipeFavorited) {
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
      <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
        <Loader2 className="h-14 w-14 animate-spin text-primary mb-6" />
        <p className="text-2xl font-medium">Fetching recipe magic...</p>
        <span className="sr-only">Loading recipe details...</span>
      </div>
    );
  }

  if (!recipeDetails) {
    return (
      <div className="text-center text-3xl font-heading font-semibold text-muted-foreground py-20">
        Oops! This recipe couldn't be found.
      </div>
    );
  }

  const ingredientsForDisplay = extractIngredients(recipeDetails);
  const youtubeVideoId = recipeDetails.strYoutube ? recipeDetails.strYoutube.split("v=")[1] : null;

  return (
    <article className="space-y-10 py-8 animate-fade-in"> {/* Added fade-in animation */}
      {/* Large Banner Image Section */}
      <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden shadow-xl"> {/* Larger, more prominent image */}
        <Image
          src={recipeDetails.strMealThumb || "/placeholder.svg?height=600&width=900&query=tasty dish banner"}
          alt={recipeDetails.strMeal}
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        {/* Subtle gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold leading-tight drop-shadow-lg">
            {recipeDetails.strMeal}
          </h1>
          <span className="bg-primary text-primary-foreground text-sm sm:text-base font-semibold px-3 py-1 rounded-full shadow-md mt-2 inline-block">
            {recipeDetails.strCategory}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-10 items-start"> {/* Main content grid */}
        {/* Ingredients List - Two Columns */}
        <div className="md:col-span-1 bg-card p-6 rounded-xl shadow-md border border-border">
          <h2 className="text-3xl font-heading font-bold mb-6 text-foreground">Ingredients</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-lg text-foreground"> {/* Two columns for ingredients */}
            {ingredientsForDisplay.length > 0 ? (
              ingredientsForDisplay.map((ingredient, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-primary">•</span> {ingredient}
                </li>
              ))
            ) : (
              <li>No ingredients listed for this recipe.</li>
            )}
          </ul>
        </div>

        {/* Cooking Instructions */}
        <div className="md:col-span-2 bg-card p-6 rounded-xl shadow-md border border-border">
          <h2 className="text-3xl font-heading font-bold mb-6 text-foreground">Instructions</h2>
          <p className="text-lg leading-relaxed whitespace-pre-line text-foreground space-y-4"> {/* Increased line height and paragraph spacing */}
            {recipeDetails.strInstructions || "No detailed instructions available for this recipe."}
          </p>
        </div>
      </div>

      {/* Action Buttons and YouTube Video */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-10">
        <Button
          variant={isRecipeFavorited ? "secondary" : "default"}
          size="lg"
          onClick={handleToggleFavorite}
          disabled={isUpdatingFavoriteStatus}
          className="flex items-center gap-2 px-8 py-3 rounded-full text-lg font-semibold shadow-md hover:shadow-lg transition-all"
        >
          {isUpdatingFavoriteStatus ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Heart className={isRecipeFavorited ? "h-6 w-6 fill-red-500 text-red-500" : "h-6 w-6"} />
          )}
          {isRecipeFavorited ? "Remove from Favorites" : "Add to Favorites"}
        </Button>

        {youtubeVideoId && (
          <a
            href={recipeDetails.strYoutube!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-lg font-semibold text-primary hover:underline hover:text-primary-dark transition-colors"
          >
            <Youtube className="h-6 w-6" />
            Watch Video Instructions
          </a>
        )}
      </div>
    </article>
  );
}
