const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'DevDoc API is running...',
        version: '1.0.0'
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

app.listen(PORT, () => {
    console.log(`\x1b[32m[SERVER]\x1b[0m Running on port ${PORT}`);
    console.log(`\x1b[36m[URL]\x1b[0m http://localhost:${PORT}`);
});
