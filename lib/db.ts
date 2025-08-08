import mongoose from 'mongoose';

// Retrieve the MongoDB connection string from environment variables.
// In a real app, this would be set in .env.local for local dev
// and on Vercel for deployment.
const MONGODB_CONNECTION_STRING = process.env.MONGODB_URI;

// Crucial check: if the URI isn't set, we can't proceed.
// This error will be caught during server startup if missing.
if (!MONGODB_CONNECTION_STRING) {
  throw new Error('Heads up! The MONGODB_URI environment variable is missing. Please define it in your .env.local file or Vercel settings.');
}

// We use a global cache to prevent multiple Mongoose connections
// during hot-reloading in development, which can cause issues.
// This pattern ensures a single, persistent connection.
let globalMongooseCache = global as typeof global & {
  mongooseConnection: typeof mongoose | null;
  mongooseConnectionPromise: Promise<typeof mongoose> | null;
};

if (!globalMongooseCache.mongooseConnection) {
  globalMongooseCache.mongooseConnection = null;
}
if (!globalMongooseCache.mongooseConnectionPromise) {
  globalMongooseCache.mongooseConnectionPromise = null;
}

/**
 * Establishes and returns a singleton Mongoose connection.
 * This function ensures that we only ever create one connection to MongoDB,
 * reusing it across all API routes and server components.
 */
async function connectToDatabase() {
  // If we already have a connection, just return it.
  if (globalMongooseCache.mongooseConnection) {
    console.log('Using existing MongoDB connection.');
    return globalMongooseCache.mongooseConnection;
  }

  // If there's no connection but a connection attempt is already in progress,
  // wait for that promise to resolve.
  if (globalMongooseCache.mongooseConnectionPromise) {
    console.log('Waiting for in-progress MongoDB connection...');
    return await globalMongooseCache.mongooseConnectionPromise;
  }

  // No connection and no pending connection, so let's create a new one.
  const connectionOptions = {
    // `bufferCommands` set to false means Mongoose won't buffer operations
    // if the connection isn't ready. This makes errors more immediate
    // and easier to debug if the connection fails.
    bufferCommands: false,
  };

  console.log('Attempting to establish new MongoDB connection...');
  globalMongooseCache.mongooseConnectionPromise = mongoose.connect(MONGODB_CONNECTION_STRING!, connectionOptions)
    .then((m) => {
      console.log('MongoDB connection established successfully!');
      return m;
    })
    .catch((error) => {
      console.error('Failed to connect to MongoDB:', error);
      // Reset the promise on failure so subsequent calls can retry.
      globalMongooseCache.mongooseConnectionPromise = null;
      throw error; // Re-throw to propagate the error up the call stack.
    });

  // Await the newly created connection promise and store the connection.
  globalMongooseCache.mongooseConnection = await globalMongooseCache.mongooseConnectionPromise;
  return globalMongooseCache.mongooseConnection;
}

export default connectToDatabase;
