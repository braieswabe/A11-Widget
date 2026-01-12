import { neon } from '@neondatabase/serverless';

// Singleton Neon connection instance
let dbConnection = null;
let connectionError = null;

/**
 * Get or create the shared Neon database connection
 * @returns {Promise<Neon>} Neon database connection instance
 */
export function getDb() {
  // Return existing connection if available
  if (dbConnection) {
    return dbConnection;
  }

  // Check if database URL is configured
  if (!process.env.NEON_DATABASE_URL) {
    throw new Error('NEON_DATABASE_URL environment variable is not set');
  }

  try {
    // Create new connection instance
    dbConnection = neon(process.env.NEON_DATABASE_URL);
    connectionError = null;
    return dbConnection;
  } catch (error) {
    connectionError = error;
    console.error('Failed to create database connection:', error);
    throw error;
  }
}

/**
 * Check database connection health
 * @returns {Promise<{healthy: boolean, error?: string}>}
 */
export async function checkDbHealth() {
  try {
    const sql = getDb();
    await sql`SELECT 1`;
    return { healthy: true };
  } catch (error) {
    return { 
      healthy: false, 
      error: error.message 
    };
  }
}

/**
 * Reset the database connection (useful for testing or reconnection)
 */
export function resetDbConnection() {
  dbConnection = null;
  connectionError = null;
}
