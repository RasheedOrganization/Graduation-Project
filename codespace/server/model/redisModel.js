const redis = require('redis');

/**
 * Create a Redis client using the connection string provided in
 * `process.env.REDIS_URL`. When the variable is not supplied (for
 * example in local development) the client falls back to the Docker
 * service name `redis` so that the server can still communicate with
 * the Redis container.
 *
 * The client attempts to connect immediately. Any connection errors
 * are caught so that the rest of the application can continue to run
 * even if Redis is unavailable.
 */
const redisUrl = 'redis://redis:6379';

// Always create the client with an explicit URL so the default isn't localhost
const redisClient = redis.createClient({ url: redisUrl });

redisClient.on('ready', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis Error:', err);
});

async function connectRedis() {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (err) {
    // Log the error but don't throw to avoid crashing the server
    console.error('Redis connection failed:', err);
  }
}

// Initiate connection on module load
connectRedis();

module.exports = { redisClient };
