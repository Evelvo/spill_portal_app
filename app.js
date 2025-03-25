const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const app = express();
const dotenv = require("dotenv");
const SQLiteStore = require('connect-sqlite3')(session);

dotenv.config();

const port = process.env.PORT || 3000;
const express_secret_key = process.env.EXPRESS_SECRET_KEY;

app.set('trust proxy', 1);

app.use(session({
    store: new SQLiteStore({
        db: 'sessions.db',
        dir: './db', // The directory where the SQLite database file will be stored
        table: 'sessions',
        concurrentDB: true
    }),
    secret: express_secret_key,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.PRODUCTION === "PRODUCTION",  // Set to true in production with HTTPS
        maxAge: 72 * 60 * 60 * 1000, // 72 hours
        sameSite: 'lax'
    }
}));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

// Set up static files
app.use('/static', express.static(path.join(__dirname, 'public/static')));

// Set up view engine for HTML rendering
app.set('views', path.join(__dirname, 'public', 'templates'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// Ensure the db directory exists
const fs = require('fs');
const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
    console.log('Created db directory');
}

// Initialize database
require('./init-db');

// Import middleware
const { isAuthenticated, isNotAuthenticated } = require('./middleware/auth');

// Set up routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

// Initialize user session
app.use((req, res, next) => {
    if (!req.session.user) {
        req.session.user = { initialized: true, loggedIn: false };
    }
    next();
});

// Public routes
app.get('/', (req, res) => {
    if (req.session.user && req.session.user.loggedIn) {
        return res.redirect('/dashboard');
    }
    res.render('unauth/index.html');
});

// Protected routes
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard.html', { user: req.session.user });
});

// For the profile page - handled by profile routes
app.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile.html', { user: req.session.user });
});

// Placeholder for games page
app.get('/games', isAuthenticated, (req, res) => {
    res.render('games.html', { user: req.session.user });
});

// Catch-all route for 404s
app.use((req, res) => {
    res.status(404).render('404.html');
});

// Start the server
app.listen(port, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${port}`);
});