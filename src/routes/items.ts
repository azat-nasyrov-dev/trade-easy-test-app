import express, { Request, Response } from 'express';
import { createClient } from 'redis';
import axios from 'axios';

const router = express.Router();
const redisClient = createClient();

redisClient
  .connect()
  .then(() => console.log('Connected to Redis'))
  .catch((err) => console.error('Redis connection error:', err));

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const cachedItems = await redisClient.get('items');

    if (cachedItems) {
      console.log('Returning data from cache');
      res.status(200).send(JSON.parse(cachedItems));
      return;
    }

    const fetchItems = async (tradable: boolean) => {
      const response = await axios.get('https://api.skinport.com/v1/items', {
        params: { app_id: 730, currency: 'EUR', tradable },
      });
      return response.data;
    };

    const [tradableItems, nonTradableItems] = await Promise.all([
      fetchItems(true),
      fetchItems(false),
    ]);

    const minimalPrices = tradableItems.map((item: any) => {
      const nonTradableItem = nonTradableItems.find(
        (nonTradable: any) => nonTradable.market_hash_name === item.market_hash_name,
      );

      return {
        id: item.id,
        name: item.market_hash_name,
        price_tradable: item.min_price || null,
        price_non_tradable: nonTradableItem ? nonTradableItem.min_price : null,
      };
    });

    await redisClient.setEx('items', 600, JSON.stringify(minimalPrices));
    res.status(200).send(minimalPrices);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

export default router;
