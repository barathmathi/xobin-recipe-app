import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import FavoriteRecipeModel from '@/models/FavoriteRecipe';

/**
 * GET /api/favorites
 * Fetches all favorite recipes from the database.
 */
export async function GET() {
  try {
    await connectToDatabase(); // Ensure database connection is established
    const allFavorites = await FavoriteRecipeModel.find({});
    return NextResponse.json(allFavorites, { status: 200 });
  } catch (error) {
    console.error('API Error: Failed to retrieve favorite recipes:', error);
    // Return a generic 500 error to the client for security,
    // but log the specific error on the server.
    return NextResponse.json({ message: 'Something went wrong while fetching favorites.' }, { status: 500 });
  }
}

/**
 * POST /api/favorites
 * Adds a new recipe to the favorites list.
 */
export async function POST(request: Request) {
  try {
    await connectToDatabase(); // Ensure database connection is established
    const { recipeId, recipeName, imageUrl } = await request.json();

    // Basic validation for incoming data
    if (!recipeId || !recipeName || !imageUrl) {
      return NextResponse.json({ message: 'Missing required recipe details (ID, name, or image URL).' }, { status: 400 });
    }

    // Check if the recipe is already favorited to prevent duplicates
    const existingFavorite = await FavoriteRecipeModel.findOne({ recipeId });
    if (existingFavorite) {
      return NextResponse.json({ message: 'This recipe is already in your favorites!' }, { status: 409 }); // 409 Conflict
    }

    // Create and save the new favorite recipe
    const newFavoriteEntry = await FavoriteRecipeModel.create({ recipeId, recipeName, imageUrl });
    return NextResponse.json(newFavoriteEntry, { status: 201 }); // 201 Created
  } catch (error) {
    console.error('API Error: Failed to add recipe to favorites:', error);
    return NextResponse.json({ message: 'Could not add recipe to favorites. Please try again.' }, { status: 500 });
  }
}
