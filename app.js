const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const app = express();
const dotenv = require("dotenv");
const SQLiteStore = require('connect-sqlite3')(session);

dotenv.config();

const port = process.env.PORT;
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

app.use(express.static(path.join(__dirname, 'public')));

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

const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(dbDir, 'spill_portal.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

app.use((req, res, next) => {
    if (!req.session.user) {
        req.session.user = { initialized: true };
    }
    next();
});

process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing SQLite database', err.message);
        } else {
            console.log('SQLite database connection closed');
        }
        process.exit(0);
    });
});

app.get('/', async (req, res) => {
    res.render('unauth/index.html');
});


app.use((req, res) => {
    res.status(404).render('404.html');
});

app.listen(port, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${port}`);
});