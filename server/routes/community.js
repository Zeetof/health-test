const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const router = express.Router();

// Placeholder for community features
// In a real application, you would have models for forums, challenges, etc.

// @route   GET /api/community/forums
// @desc    Get community forums
// @access  Public
router.get('/forums', async (req, res) => {
  try {
    // Placeholder data
    const forums = [
      {
        id: 1,
        title: 'Running Tips & Advice',
        description: 'Share your running experiences and get advice from fellow runners',
        topics: 45,
        posts: 234,
        lastActivity: new Date()
      },
      {
        id: 2,
        title: 'Nutrition & Meal Prep',
        description: 'Healthy eating tips, recipes, and meal preparation ideas',
        topics: 32,
        posts: 189,
        lastActivity: new Date()
      },
      {
        id: 3,
        title: 'Workout Motivation',
        description: 'Stay motivated and share your fitness journey',
        topics: 28,
        posts: 156,
        lastActivity: new Date()
      }
    ];

    res.json({ forums });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/community/challenges
// @desc    Get active challenges
// @access  Public
router.get('/challenges', async (req, res) => {
  try {
    // Placeholder data
    const challenges = [
      {
        id: 1,
        title: '30-Day Running Challenge',
        description: 'Run at least 1 mile every day for 30 days',
        participants: 156,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        type: 'running',
        reward: 'Achievement Badge'
      },
      {
        id: 2,
        title: 'Healthy Eating Week',
        description: 'Log all your meals for 7 days and maintain a balanced diet',
        participants: 89,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        type: 'nutrition',
        reward: 'Nutrition Expert Badge'
      }
    ];

    res.json({ challenges });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/community/leaderboard
// @desc    Get community leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    // Placeholder data
    const leaderboard = [
      {
        rank: 1,
        user: {
          id: 1,
          name: 'John Doe',
          avatar: 'https://via.placeholder.com/40'
        },
        points: 1250,
        activities: 45,
        streak: 12
      },
      {
        rank: 2,
        user: {
          id: 2,
          name: 'Jane Smith',
          avatar: 'https://via.placeholder.com/40'
        },
        points: 1180,
        activities: 42,
        streak: 10
      }
    ];

    res.json({ leaderboard });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 