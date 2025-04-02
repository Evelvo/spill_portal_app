// services/game-service.js
const { run, get, all } = require('../db');

/**
 * Updates game statistics for a user
 * @param {number} userId - User ID
 * @param {string} gameType - Game type (e.g., 'hangman', 'blackjack', 'tic-tac-toe', 'stein-saks-papir')
 * @param {Object} stats - Statistics to update { wins, losses, draws, score }
 * @returns {Promise<Object>} - Result of the operation
 */
async function updateGameStats(userId, gameType, stats) {
    try {
        // Get existing stats for this user and game
        const existingStats = await get(
            'SELECT * FROM game_statistics WHERE user_id = ? AND game_type = ?',
            [userId, gameType]
        );

        if (existingStats) {
            // Update existing stats
            return await run(
                `UPDATE game_statistics SET 
                wins = wins + ?, 
                losses = losses + ?, 
                draws = draws + ?,
                games_played = games_played + 1,
                best_score = CASE WHEN ? > best_score THEN ? ELSE best_score END,
                total_score = total_score + ?,
                last_played = CURRENT_TIMESTAMP
                WHERE user_id = ? AND game_type = ?`,
                [
                    stats.wins || 0,
                    stats.losses || 0,
                    stats.draws || 0,
                    stats.score || 0,
                    stats.score || 0,
                    stats.score || 0,
                    userId,
                    gameType
                ]
            );
        } else {
            // Create new stats entry
            return await run(
                `INSERT INTO game_statistics (
                    user_id, game_type, wins, losses, draws, 
                    games_played, best_score, total_score
                ) VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
                [
                    userId,
                    gameType,
                    stats.wins || 0,
                    stats.losses || 0,
                    stats.draws || 0,
                    stats.score || 0,
                    stats.score || 0
                ]
            );
        }
    } catch (error) {
        console.error('Error updating game stats:', error);
        throw error;
    }
}

/**
 * Gets game statistics for a user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} - User's game statistics
 */
async function getUserStats(userId) {
    try {
        return await all(
            `SELECT 
                gs.game_type, 
                gs.wins, 
                gs.losses, 
                gs.draws, 
                gs.games_played, 
                gs.best_score,
                gs.total_score,
                CASE 
                    WHEN gs.games_played > 0 THEN ROUND((gs.wins * 100.0) / gs.games_played, 1)
                    ELSE 0
                END as win_percentage
            FROM game_statistics gs
            WHERE gs.user_id = ?
            ORDER BY gs.last_played DESC`,
            [userId]
        );
    } catch (error) {
        console.error('Error getting user stats:', error);
        throw error;
    }
}

/**
 * Gets leaderboard for a specific game or all games
 * @param {string} gameType - Game type (optional, if not provided returns all games)
 * @param {number} limit - Limit number of results (optional, default 10)
 * @returns {Promise<Array>} - Leaderboard data
 */
async function getLeaderboard(gameType, limit = 10) {
    try {
        let query = `SELECT * FROM leaderboard_view`;
        const params = [];

        if (gameType) {
            query += ` WHERE game_type = ?`;
            params.push(gameType);
        }

        query += ` ORDER BY wins DESC, win_percentage DESC LIMIT ?`;
        params.push(limit);

        return await all(query, params);
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        throw error;
    }
}

/**
 * Gets game statistics to display on dashboard
 * @returns {Promise<Object>} - Game statistics
 */
async function getGameStats() {
    try {
        // Get total number of games played
        const totalGames = await get(
            'SELECT SUM(games_played) as total FROM game_statistics'
        );
        
        // Get top players by wins
        const topPlayers = await all(
            `SELECT 
                u.username, 
                SUM(gs.wins) as total_wins 
            FROM game_statistics gs
            JOIN users u ON gs.user_id = u.id
            GROUP BY gs.user_id
            ORDER BY total_wins DESC
            LIMIT 5`
        );
        
        // Get most popular games
        const popularGames = await all(
            `SELECT 
                game_type, 
                SUM(games_played) as total_plays 
            FROM game_statistics
            GROUP BY game_type
            ORDER BY total_plays DESC`
        );
        
        return {
            totalGames: totalGames?.total || 0,
            topPlayers,
            popularGames
        };
    } catch (error) {
        console.error('Error getting game stats:', error);
        throw error;
    }
}

module.exports = {
    updateGameStats,
    getUserStats,
    getLeaderboard,
    getGameStats
};