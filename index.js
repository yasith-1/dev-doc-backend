const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables first
dotenv.config();

const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'https://yasith-1-dev-docorizer-production.up.railway.app',
    process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'DevDoc API is running...',
        version: '2.0.0',
        database: mongoose.connection.readyState === 1 ? 'MongoDB Connected' : 'MongoDB Disconnected'
    });
});

// 404 handler
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// Centralized Error Handler
app.use(errorHandler);

// ─── Connect to MongoDB then start server ────────────────────────────────────
const startServer = async () => {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        console.error('\x1b[31m[ERROR]\x1b[0m MONGO_URI is not defined in .env file');
        console.log('\x1b[33m[HINT]\x1b[0m Add MONGO_URI=mongodb+srv://... to your .env file');
        process.exit(1);
    }

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('\x1b[32m[MongoDB]\x1b[0m Connected successfully');

        app.listen(PORT, () => {
            console.log(`\x1b[32m[SERVER]\x1b[0m Running on port ${PORT}`);
            console.log(`\x1b[36m[URL]\x1b[0m http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('\x1b[31m[MongoDB]\x1b[0m Connection failed:', error.message);
        process.exit(1);
    }
};

startServer();
