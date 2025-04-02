const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const app = express();
const dotenv = require("dotenv");
const SQLiteStore = require('connect-sqlite3')(session);
const helpers = require('./helpers');


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

app.use((req, res, next) => {
    res.locals.getGameName = helpers.getGameName;
    // Add any other helper functions here
    next();
});

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
const leaderboardRoutes = require('./routes/leaderboard');
const apiRoutes = require('./routes/api');

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/api', apiRoutes);

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
app.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const gameService = require('./services/game-service');
        const gameStats = await gameService.getGameStats();
        const userStats = await gameService.getUserStats(req.session.user.id);
        
        // Add helper function for templates
        const getGameName = (gameType) => {
            const gameNames = {
                'hangman': 'Hangman',
                'tic-tac-toe': 'Tic-Tac-Toe',
                'stein-saks-papir': 'Stein-Saks-Papir',
                'blackjack': 'Blackjack'
            };
            return gameNames[gameType] || gameType;
        };
        
        res.render('dashboard.html', { 
            user: req.session.user,
            gameStats,
            userStats,
            getGameName // Pass the function to the template
        });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        res.render('dashboard.html', { user: req.session.user });
    }
});

// For the profile page - handled by profile routes
app.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile.html', { user: req.session.user });
});

// Placeholder for games page
app.get('/games', isAuthenticated, (req, res) => {
    res.render('games.html', { user: req.session.user });
});

app.get('/games/hangman', isAuthenticated, (req, res) => {
    res.render('games/hangman.html', { user: req.session.user });
});

app.get('/games/stein-saks-papir', isAuthenticated, (req, res) => {
    res.render('games/stein-saks-papir.html', { user: req.session.user });
});

app.get('/games/tic-tac-toe', isAuthenticated, (req, res) => {
    res.render('games/tic-tac-toe.html', { user: req.session.user });
});

app.get('/games/blackjack', isAuthenticated, (req, res) => {
    res.render('games/blackjack.html', { user: req.session.user });
});

// Catch-all route for 404s
app.use((req, res) => {
    res.status(404).render('404.html');
});

// Start the server
app.listen(port, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${port}`);
});