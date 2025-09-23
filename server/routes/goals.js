const express = require('express');
const { body, validationResult } = require('express-validator');
const Goal = require('../models/Goal');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/goals
// @desc    Create a new goal
// @access  Private
router.post('/', auth, [
  body('title', 'Title is required').notEmpty(),
  body('category', 'Category is required').notEmpty(),
  body('type', 'Type is required').notEmpty(),
  body('direction', 'Direction is required').notEmpty(),
  body('target.value', 'Target value is required').isFloat({ min: 0 }),
  body('target.unit', 'Target unit is required').notEmpty(),
  body('target.timeframe', 'Target timeframe is required').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      category,
      type,
      direction,
      target,
      weightGoal,
      fitnessGoal,
      nutritionGoal,
      sleepGoal,
      habitGoal,
      milestones,
      isPublic,
      sharedWith,
      accountabilityPartner,
      notes,
      tags,
      priority,
      endDate
    } = req.body;

    const goal = new Goal({
      userId: req.user.id,
      title,
      description,
      category,
      type,
      direction,
      target,
      weightGoal,
      fitnessGoal,
      nutritionGoal,
      sleepGoal,
      habitGoal,
      milestones,
      isPublic,
      sharedWith,
      accountabilityPartner,
      notes,
      tags,
      priority,
      endDate: endDate ? new Date(endDate) : null
    });

    await goal.save();

    res.json({
      message: 'Goal created successfully',
      goal: goal.getSummary()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/goals
// @desc    Get all goals for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { category, status, limit = 20, page = 1 } = req.query;

    const query = { userId: req.user.id };
    if (category) query.category = category;
    if (status) query.status = status;

    const goals = await Goal.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('sharedWith', 'firstName lastName email')
      .populate('accountabilityPartner', 'firstName lastName email');

    const total = await Goal.countDocuments(query);

    res.json({
      goals,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/goals/:id/progress
// @desc    Update goal progress
// @access  Private
router.put('/:id/progress', auth, async (req, res) => {
  try {
    const { value, notes = '' } = req.body;
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    if (goal.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await goal.updateProgress(value, notes);

    res.json({
      message: 'Progress updated successfully',
      goal: goal.getSummary()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/goals/:id
// @desc    Update goal
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    if (goal.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        goal[key] = req.body[key];
      }
    });

    await goal.save();

    res.json({
      message: 'Goal updated successfully',
      goal: goal.getSummary()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/goals/:id
// @desc    Delete goal
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    if (goal.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await goal.remove();

    res.json({ message: 'Goal deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 