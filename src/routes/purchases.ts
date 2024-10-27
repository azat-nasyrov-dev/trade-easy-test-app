import express, { Request, Response } from 'express';
import { sql } from '../database/db';

const router = express.Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { userId, itemId } = req.body;

  try {
    const transaction = await sql.begin(async (client) => {
      const users = await client`SELECT * FROM users WHERE id = ${userId}`;
      const items = await client`SELECT * FROM items WHERE id = ${itemId}`;

      if (users.length === 0 || items.length === 0) {
        throw new Error('User or item not found');
      }

      const user = users[0];
      const item = items[0];

      if (user.balance < item.price_tradable) {
        throw new Error('Insufficient balance');
      }

      const newBalance = user.balance - item.price_tradable;

      await client`UPDATE users SET balance = ${newBalance} WHERE id = ${userId}`;
      await client`INSERT INTO purchases (user_id, item_id) VALUES (${userId}, ${itemId})`;

      return newBalance;
    });

    res.status(200).json({ newBalance: transaction });
  } catch (err: unknown) {
    console.error('Error during purchase transaction:', err);

    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'An unknown error occured' });
    }
  }
});

export default router;
