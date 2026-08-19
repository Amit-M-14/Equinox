import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import agentRoutes from './routes/agentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_agent_platform';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/agent', agentRoutes);

// Database connection & Server Boot
mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('✅ Successfully connected to MongoDB.');
        app.listen(PORT, () => {
            console.log(`🚀 Express server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('⚠️ MongoDB Connection Error (Continuing without DB):', err.message);
        app.listen(PORT, () => {
            console.log(`🚀 Express server running without DB on http://localhost:${PORT}`);
        });
    });