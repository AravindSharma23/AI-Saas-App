import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './src/config/config.js';
import { clerkMiddleware, requireAuth } from '@clerk/express'
import aiRouter from './src/routes/aiRoutes.js';
import connectCloudinary from './src/config/cloudinary.js';
import userRouter from './src/routes/userRoutes.js';


const app = express();
await connectCloudinary();
const PORT = process.env.PORT || 5000;
app.use(express.json());

app.use(clerkMiddleware());
connectDB(process.env.MONGO_URI);

app.use(cors({
    origin: process.env.FRONTEND_URI,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true 
}));

app.use(requireAuth())
app.use('/api/ai', aiRouter)
app.use('/api/user', userRouter);

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));