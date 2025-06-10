import express, { Request, Response } from 'express';
import { connectDB } from './db';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import router from './router';
import path from 'path';

dotenv.config();

const app = express();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
    console.error('Invalid PORT in .env file');
    process.exit(1);
}

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use('/api/img', express.static(path.resolve(__dirname, '../public/img')));

app.use('/api', router);

const start = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

start();