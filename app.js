const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const authRoutes = require("./routes/auth");

const app = express();

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Basic middleware
app.use(bodyParser.json());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);

// Basic error handling
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!' 
    });
});

// Export app for testing
module.exports = app;

// Start the server only when not in test mode
if (process.env.NODE_ENV !== "test") {
    const PORT = 3000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
} 