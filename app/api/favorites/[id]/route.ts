import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import FavoriteRecipeModel from '@/models/FavoriteRecipe';

/**
 * DELETE /api/favorites/[id]
 * Removes a recipe from the favorites list by its TheMealDB ID.
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase(); // Ensure database connection is established
    const recipeToDeleteId = params.id;

    // Attempt to delete the recipe using its `recipeId` (from TheMealDB)
    const deletionResult = await FavoriteRecipeModel.deleteOne({ recipeId: recipeToDeleteId });

    if (deletionResult.deletedCount === 0) {
      // If no document was deleted, it means the recipe wasn't found in favorites.
      return NextResponse.json({ message: 'Recipe not found in your favorites.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Recipe successfully removed from favorites.' }, { status: 200 });
  } catch (error) {
    console.error(`API Error: Failed to delete favorite recipe with ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Failed to remove recipe from favorites. Please try again.' }, { status: 500 });
  }
}
