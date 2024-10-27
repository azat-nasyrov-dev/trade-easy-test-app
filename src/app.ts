import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth';
import purchaseRoutes from './routes/purchases';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use('/auth', authRoutes);
app.use('/purchase', purchaseRoutes);

app.listen(PORT, () => console.log(`App is running on port: ${PORT}`));
