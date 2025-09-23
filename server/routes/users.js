const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update allowed fields
    const allowedFields = [
      'firstName', 'lastName', 'dateOfBirth', 'gender', 'phoneNumber',
      'height', 'weight', 'fitnessLevel', 'activityPreferences',
      'dietaryRestrictions', 'allergies', 'primaryGoal', 'targetWeight',
      'targetSteps', 'targetCalories', 'notifications', 'privacySettings',
      'university'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // Calculate BMI if height and weight are provided
    if (user.height && user.weight) {
      user.calculateBMI();
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.getFullName(),
        fitnessLevel: user.fitnessLevel,
        primaryGoal: user.primaryGoal,
        bmi: user.bmi,
        age: user.getAge()
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/search
// @desc    Search users (for community features)
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.id } }, // Exclude current user
        {
          $or: [
            { firstName: { $regex: q, $options: 'i' } },
            { lastName: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
          ]
        },
        { privacySettings: { $ne: { profileVisibility: 'private' } } }
      ]
    })
    .select('firstName lastName email fitnessLevel primaryGoal')
    .limit(parseInt(limit));

    res.json({ users });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (for public profiles)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('firstName lastName fitnessLevel primaryGoal privacySettings');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check privacy settings
    if (user.privacySettings.profileVisibility === 'private') {
      return res.status(403).json({ error: 'Profile is private' });
    }

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.getFullName(),
      fitnessLevel: user.fitnessLevel,
      primaryGoal: user.primaryGoal
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 