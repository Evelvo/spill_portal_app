// routes/api.js
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { updateGameStats, getUserStats, getLeaderboard } = require('../services/game-service');

// Apply authentication middleware to all API routes
router.use(isAuthenticated);

// Save game statistics
router.post('/stats', async (req, res) => {
    try {
        const { gameType, wins, losses, draws, score } = req.body;
        const userId = req.session.user.id;
        
        // Validate input
        if (!gameType) {
            return res.status(400).json({ success: false, message: 'Game type is required' });
        }
        
        // Update game stats
        await updateGameStats(userId, gameType, {
            wins: wins || 0,
            losses: losses || 0,
            draws: draws || 0,
            score: score || 0
        });
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving game stats:', error);
        res.status(500).json({ success: false, message: 'Error saving game statistics' });
    }
});

// Get user statistics
router.get('/stats', async (req, res) => {
    try {
        const userId = req.session.user.id;
        const stats = await getUserStats(userId);
        
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Error getting user stats:', error);
        res.status(500).json({ success: false, message: 'Error retrieving user statistics' });
    }
});

// Get leaderboard data
router.get('/leaderboard/:gameType?', async (req, res) => {
    try {
        const gameType = req.params.gameType;
        const limit = req.query.limit || 10;
        
        const leaderboard = await getLeaderboard(gameType, limit);
        
        res.json({ success: true, leaderboard });
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        res.status(500).json({ success: false, message: 'Error retrieving leaderboard data' });
    }
});

module.exports = router;