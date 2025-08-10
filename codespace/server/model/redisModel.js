const redis = require('redis');

/**
 * Create a Redis client using the connection string provided in
 * `process.env.REDIS_URL`. If the environment variable is not set,
 * the default local Redis instance (localhost:6379) will be used.
 *
 * The client attempts to connect immediately. Any connection errors
 * are caught so that the rest of the application can continue to run
 * even if Redis is unavailable.
 */
const redisUrl = process.env.REDIS_URL;

// Allow configuration via REDIS_URL while falling back to default localhost
const redisClient = redisUrl
  ? redis.createClient({ url: redisUrl })
  : redis.createClient();

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
