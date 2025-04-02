const { db, run } = require('./db');

async function initializeDatabase() {
    try {
        // Create users table with salt column
        await run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                first_name TEXT,
                last_name TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME
            )
        `);

        await run(`
            CREATE TABLE IF NOT EXISTS game_statistics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                game_type TEXT NOT NULL,
                wins INTEGER DEFAULT 0,
                losses INTEGER DEFAULT 0,
                draws INTEGER DEFAULT 0,
                games_played INTEGER DEFAULT 0,
                best_score INTEGER DEFAULT 0,
                total_score INTEGER DEFAULT 0,
                last_played DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE(user_id, game_type)
            )
        `);
        
        // Create leaderboard_view - A view to easily get leaderboard data
        await run(`
            CREATE VIEW IF NOT EXISTS leaderboard_view AS
            SELECT 
                g.game_type,
                u.username,
                u.first_name,
                u.last_name,
                g.wins,
                g.losses,
                g.draws,
                g.games_played,
                g.best_score,
                g.total_score,
                CASE 
                    WHEN g.games_played > 0 THEN ROUND((g.wins * 100.0) / g.games_played, 1)
                    ELSE 0
                END as win_percentage
            FROM game_statistics g
            JOIN users u ON g.user_id = u.id
            ORDER BY g.wins DESC, win_percentage DESC
        `);
        
        console.log('Game statistics tables initialized successfully');
        
        console.log('Database tables initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// Run the initialization
initializeDatabase();

module.exports = { initializeDatabase };