// routes/leaderboard.js
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { getLeaderboard, getUserStats } = require('../services/game-service');

// Apply authentication middleware to all leaderboard routes
router.use(isAuthenticated);

// Main leaderboard page
// Main leaderboard page in routes/leaderboard.js
router.get('/', async (req, res) => {
    try {
        // Get leaderboard data for all games
        const leaderboardData = await getLeaderboard(null, 50);
        
        // Get user's personal stats
        const userStats = await getUserStats(req.session.user.id);
        
        // Define available games for the filter
        const games = [
            { id: 'hangman', name: 'Hangman' },
            { id: 'tic-tac-toe', name: 'Tic-Tac-Toe' },
            { id: 'stein-saks-papir', name: 'Stein-Saks-Papir' },
            { id: 'blackjack', name: 'Blackjack' }
        ];
        
        res.render('leaderboard.html', { 
            user: req.session.user,
            leaderboardData,
            userStats,
            games,
            selectedGame: 'all'
        });
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        res.status(500).send('Det oppstod en feil ved lasting av leaderboard');
    }
});

// Game-specific leaderboard
router.get('/:gameType', async (req, res) => {
    try {
        const gameType = req.params.gameType;
        
        // Get leaderboard data for specific game
        const leaderboardData = await getLeaderboard(gameType, 50);
        
        // Get user's personal stats
        const userStats = await getUserStats(req.session.user.id);
        
        // Define available games for the filter
        const games = [
            { id: 'hangman', name: 'Hangman' },
            { id: 'tic-tac-toe', name: 'Tic-Tac-Toe' },
            { id: 'stein-saks-papir', name: 'Stein-Saks-Papir' },
            { id: 'blackjack', name: 'Blackjack' }
        ];
        
        res.render('leaderboard.html', { 
            user: req.session.user,
            leaderboardData,
            userStats,
            games,
            selectedGame: gameType
        });
    } catch (error) {
        console.error('Error loading game leaderboard:', error);
        res.status(500).send('Det oppstod en feil ved lasting av leaderboard');
    }
});

module.exports = router;