import { createClient } from 'redis';

let redisClient;
(async () => {
    redisClient = createClient();
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    await redisClient.connect();
})();

export function getRedisClient() {
    return redisClient;
}
