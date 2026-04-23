require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./db');

const authRoutes = require('./authRoutes');
const issueRoutes = require('./issueRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// DB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// 🔥 ADD THIS
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);

app.get('/', (req, res) => {
    res.send('API Running 🚀');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));