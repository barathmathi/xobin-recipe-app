import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for a Favorite Recipe document in MongoDB.
// This helps with type safety throughout the application.
export interface IFavoriteRecipe extends Document {
  recipeId: string;    // The unique ID from TheMealDB API
  recipeName: string;  // The name of the recipe
  imageUrl: string;    // URL to the recipe's thumbnail image
}

// Define the Mongoose schema for our favorite recipes collection.
const FavoriteRecipeSchema: Schema = new Schema({
  recipeId: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate recipes can be favorited by the same user (or globally, in this case)
  },
  recipeName: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
});

// Create or retrieve the Mongoose model.
// This check prevents Mongoose from trying to recompile the model
// if it's already been defined (common in Next.js development with hot-reloading).
const FavoriteRecipeModel = mongoose.models.FavoriteRecipe || mongoose.model<IFavoriteRecipe>('FavoriteRecipe', FavoriteRecipeSchema);

export default FavoriteRecipeModel;
