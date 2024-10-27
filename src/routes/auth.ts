import express, { Request, Response } from 'express';
import { sql } from '../database/db';
import bcrypt from 'bcrypt';

const router = express.Router();

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  try {
    const users = await sql`SELECT * FROM users WHERE username = ${username}`;

    if (users.length > 0) {
      const user = users[0];

      if (await bcrypt.compare(password, user.password)) {
        res.status(200).send({
          message: 'Authenticated',
          userId: user.id,
          username: user.username,
        });
      } else {
        res.status(401).send({ error: 'Invalid credentials' });
      }
    } else {
      res.status(401).send({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

router.put('/change-password', async (req: Request, res: Response): Promise<void> => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    const users = await sql`SELECT * FROM users WHERE id = ${userId}`;

    if (users.length > 0) {
      const user = users[0];

      if (await bcrypt.compare(oldPassword, user.password)) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await sql`UPDATE users SET password = ${hashedPassword} WHERE id = ${userId}`;
        res.status(200).send({ message: 'Password updated' });
      } else {
        res.status(400).send({ error: 'Invalid old password' });
      }
    } else {
      res.status(401).send({ error: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

export default router;
