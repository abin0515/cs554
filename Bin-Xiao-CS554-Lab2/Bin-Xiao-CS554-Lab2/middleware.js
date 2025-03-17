
import redis from 'redis';


const redisClient = redis.createClient();

redisClient
  .connect()
  .then(() => console.log('Connected to Redis'))
  .catch((err) => console.error('Redis Client Error', err));



// Middleware for caching Pokémon list (/api/pokemon)
const cachePokemonList = async (req, res, next) => {
  try {
    const cachedData = await redisClient.get('pokemon:all');
    // if get the list, return it.
    if (cachedData) {
      console.log('Serving Pokémon list from cache');
      // Return with a success status code and JSON data.
      return res.status(200).json(JSON.parse(cachedData));
    }
    next();
  } catch (err) {
    console.error('Error in cachePokemonList middleware:', err);
    next();
  }
}



const  cachePokemonById = async (req, res, next) =>{
  try {
    const { id } = req.params;
    const cachedData = await redisClient.get(`pokemon:${id}`);
    if (cachedData) {
      console.log(`Serving Pokémon id=${id} from cache`);
      // Even though we have a cache hit, add this Pokémon data to the history list.
      await redisClient.lPush('pokemon:history', cachedData);
      return res.status(200).json(JSON.parse(cachedData));
    }
    next();
  } catch (err) {
    console.error('Error in cachePokemonById middleware:', err);
    next();
  }
}


const cacheMoveList = async (req, res, next) =>{
  try {
    const cachedData = await redisClient.get('move:all');
    if (cachedData) {
      console.log('Serving move list from cache');
      return res.status(200).json(JSON.parse(cachedData));
    }
    next();
  } catch (err) {
    console.error('Error in cacheMoveList middleware:', err);
    next();
  }
}


const cacheMoveById = async(req, res, next) =>{
  try {
    const { id } = req.params;
    const cachedData = await redisClient.get(`move:${id}`);
    if (cachedData) {
      console.log(`Serving move id=${id} from cache`);
      return res.status(200).json(JSON.parse(cachedData));
    }
    next();
  } catch (err) {
    console.error('Error in cacheMoveById middleware:', err);
    next();
  }
}


async function cacheItemList(req, res, next) {
  try {
    const cachedData = await redisClient.get('item:all');
    if (cachedData) {
      console.log('Serving item list from cache');
      return res.status(200).json(JSON.parse(cachedData));
    }
    next();
  } catch (err) {
    console.error('Error in cacheItemList middleware:', err);
    next();
  }
}


async function cacheItemById(req, res, next) {
  try {
    const { id } = req.params;
    const cachedData = await redisClient.get(`item:${id}`);
    if (cachedData) {
      console.log(`Serving item id=${id} from cache`);
      return res.status(200).json(JSON.parse(cachedData));
    }
    next();
  } catch (err) {
    console.error('Error in cacheItemById middleware:', err);
    next();
  }
}
export default {
  cachePokemonList,
  cachePokemonById,
  cacheMoveList,
  cacheMoveById,
  cacheItemList,
  cacheItemById
};
