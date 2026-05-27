require('dotenv').config();

const express = require('express');

const cors = require('cors');

const path = require('path');

const connectDB = require('./db');

const authRoutes = require('./authRoutes');

const issueRoutes = require('./issueRoutes');

const app = express();

const PORT = process.env.PORT || 5000;


// ===============================
// DATABASE
// ===============================
connectDB();


// ===============================
// MIDDLEWARE
// ===============================
app.use(express.json());

app.use(cors());


// ===============================
// STATIC UPLOADS FOLDER
// ===============================
app.use(
    '/uploads',
    express.static(
        path.join(__dirname, 'uploads')
    )
);


// ===============================
// ROUTES
// ===============================
app.use('/api/auth', authRoutes);

app.use('/api/issues', issueRoutes);


// ===============================
// TEST ROUTE
// ===============================
app.get('/', (req, res) => {

    res.send('API Running 🚀');

});


// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});