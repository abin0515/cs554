
import { Router } from 'express';
import middleware from '../middleware.js';
import redis from 'redis';


const redisClient = redis.createClient();

redisClient
    .connect()
    .then(() => console.log('Connected to Redis'))
    .catch((err) => console.error('Redis Client Error', err));

const router = Router();

router.get('/api/pokemon/history', async (req, res) => {
    try {
        
        const historyList = await redisClient.lRange('pokemon:history', 0, 24);

        const history = historyList.map((entry) => JSON.parse(entry));
        res.status(200).json(history);
    } catch (err) {
        console.error('Error fetching Pokémon history:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/api/pokemon', middleware.cachePokemonList, async (req, res) => {
    try {
        const fetchRes = await fetch('https://pokeapi.co/api/v2/pokemon/');
        // Check if the response is ok
        if (!fetchRes.ok) {
            return res.status(fetchRes.status).json({ error: `Error fetching Pokémon list from API` });
        }

        // if get data, cache data
        const data = await fetchRes.json();
        await redisClient.set('pokemon:all', JSON.stringify(data));
        res.status(200).json(data);
    } catch (err) {
        console.error('Error fetching Pokémon list:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
})


router.get('/api/pokemon/:id', middleware.cachePokemonById, async (req, res) => {
    try {
        const {id} = req.params;
        const fetchRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
        // check if the response is ok
        if (!fetchRes.ok) {
            return res.status(fetchRes.status).json({ error: `Error fetching move list from API` });
        }
        // cache the individual data
        const data = await fetchRes.json();
        await redisClient.set(`pokemon: ${id}`, JSON.stringify(data));
        // add the pokemon data to recently viewed list
        await redisClient.lPush(`pokemon:history`, JSON.stringify(data));
        res.status(200).json(data);
    } catch (error) {
        onsole.error(`Error fetching Pokémon id=${req.params.id}:`, err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
);


router.get('/api/move', middleware.cacheMoveList, async (req, res) => {
    try {
        const apiRes = await fetch('https://pokeapi.co/api/v2/move/');
        if (!apiRes.ok) {
            return res
                .status(apiRes.status)
                .json({ error: 'Error fetching move list from API' });
        }
        const data = await apiRes.json();
        await redisClient.set('move:all', JSON.stringify(data));
        res.status(200).json(data);
    } catch (err) {
        console.error('Error fetching move list:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/api/move/:id', middleware.cacheMoveById, async (req, res) => {
    try {
        const { id } = req.params;
        const apiRes = await fetch(`https://pokeapi.co/api/v2/move/${id}/`);
        if (!apiRes.ok) {
            return res
                .status(apiRes.status)
                .json({ error: `Move with id ${id} not found` });
        }
        const data = await apiRes.json();
        await redisClient.set(`move:${id}`, JSON.stringify(data));
        res.status(200).json(data);
    } catch (err) {
        console.error(`Error fetching move id=${req.params.id}:`, err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/api/item', middleware.cacheItemList, async (req, res) => {
    try {
        const apiRes = await fetch('https://pokeapi.co/api/v2/item/');
        if (!apiRes.ok) {
            return res
                .status(apiRes.status)
                .json({ error: 'Error fetching item list from API' });
        }
        const data = await apiRes.json();
        await redisClient.set('item:all', JSON.stringify(data));
        res.status(200).json(data);
    } catch (err) {
        console.error('Error fetching item list:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/api/item/:id', middleware.cacheItemById, async (req, res) => {
    try {
        const { id } = req.params;
        const apiRes = await fetch(`https://pokeapi.co/api/v2/item/${id}/`);
        if (!apiRes.ok) {
            return res
                .status(apiRes.status)
                .json({ error: `Item with id ${id} not found` });
        }
        const data = await apiRes.json();
        await redisClient.set(`item:${id}`, JSON.stringify(data));
        res.status(200).json(data);
    } catch (err) {
        console.error(`Error fetching item id=${req.params.id}:`, err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
