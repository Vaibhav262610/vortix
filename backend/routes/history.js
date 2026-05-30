const express = require('express');
const router = express.Router();
const {
    getCommandHistory,
    searchCommandHistory,
    getCommandStats,
} = require('../lib/db-helpers');

// Get command history
router.get('/', async (req, res) => {
    try {
        const { userId, deviceId, search, limit = 50, offset = 0 } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const result = await getCommandHistory(userId, {
            deviceId,
            search,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching command history:', error);
        res.status(500).json({ error: 'Failed to fetch command history' });
    }
});

// Search command history
router.get('/search', async (req, res) => {
    try {
        const { userId, q, limit = 20 } = req.query;

        if (!userId || !q) {
            return res.status(400).json({ error: 'userId and q are required' });
        }

        const commands = await searchCommandHistory(userId, q, parseInt(limit));
        res.json({ commands });
    } catch (error) {
        console.error('Error searching command history:', error);
        res.status(500).json({ error: 'Failed to search command history' });
    }
});

module.exports = router;
