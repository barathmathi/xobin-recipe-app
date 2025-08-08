# Recipe Explorer: Your Culinary Companion

Recipe Explorer is a full-stack web application built with **Next.js 14+**, **Tailwind CSS**, and **MongoDB Atlas**.  
It allows users to browse recipes from TheMealDB API, view detailed ingredients and instructions, and manage a favorites list with persistent storage.

🔗 **Live Demo:** [Vercel app](https://xobin-recipe-9j8mz4chy-barath-ss-projects-83a5e094.vercel.app/)

---

## ✨ Features

- **Browse Recipes** – Explore a variety of dishes fetched from TheMealDB API.
- **Recipe Details** – View full instructions, ingredients, and an image for each recipe.
- **Favorites Management**:
  - Add recipes to favorites from detail pages.
  - View all saved recipes on a dedicated "Favorites" page.
  - Remove recipes from the favorites list.
- **Responsive Design** – Works on mobile, tablet, and desktop.
- **Persistent Storage** – MongoDB Atlas ensures saved recipes remain available across sessions.

---

## 🚀 Tech Stack

**Frontend**
- [Next.js 14+](https://nextjs.org/) – React framework with App Router.
- [React](https://react.dev/) – UI rendering and state management.
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first styling.

**Backend**
- Next.js API Routes – Serverless backend logic.
- [Mongoose](https://mongoosejs.com/) – MongoDB ODM for schema management.

**Database**
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) – Cloud-hosted NoSQL database.

**External API**
- [TheMealDB API](https://www.themealdb.com/api.php) – Recipe data provider.

---

## 🛠️ Getting Started (Local)

### Prerequisites
- Node.js v18+
- npm or Yarn
- MongoDB Atlas cluster

### 1. Clone the Repository
```bash
git clone <your-github-repo-url>
cd recipe-explorer
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create `.env.local` in the project root:

```plaintext
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/recipe_viewer?retryWrites=true&w=majority
NEXT_PUBLIC_MEALDB_API=https://www.themealdb.com/api/json/v1/1
```

⚠️ URL-encode your password if it contains special characters.

### 4. Allow Network Access in MongoDB Atlas

1. Go to **Network Access** in Atlas.
2. Add your current IP for local dev.
3. For Vercel deployment, temporarily allow `0.0.0.0/0` during testing.
   (For production, allow only Vercel IP ranges.)

### 5. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## 📡 API Endpoints

**`GET /api/favorites`** – List all favorites.
**`POST /api/favorites`** – Add a recipe to favorites.
Body: `{ recipeId, recipeName, imageUrl }`
**`DELETE /api/favorites?id={recipeId}`** – Remove a favorite.

---

## 📄 Database Schema

```ts
interface IFavoriteRecipe {
  recipeId: string;    // Unique ID from TheMealDB
  recipeName: string;  // Name of recipe
  imageUrl: string;    // Thumbnail URL
  createdAt: Date;     // Added timestamp
}
```

---

## 🌐 Deployment (Vercel)

1. Push the project to GitHub.
2. Go to [Vercel](https://vercel.com/) → New Project → Import from GitHub.
3. Set environment variables in **Settings → Environment Variables**:

   * `MONGODB_URI`
   * `NEXT_PUBLIC_MEALDB_API`
4. Deploy. Vercel will auto-detect Next.js.
5. Test your live app
---

## 🚀 Future Enhancements

* Search with live suggestions
* Random recipe feature
* Pagination or infinite scroll
* Loading skeletons
* User authentication for personalized favorites
* Category/region filters
* Offline viewing with caching

---

## 📜 License

MIT License