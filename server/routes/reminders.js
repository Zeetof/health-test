const express = require('express');
const { body, validationResult } = require('express-validator');
const Reminder = require('../models/Reminder');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/reminders
// @desc    Create a new reminder
// @access  Private
router.post('/', auth, [
  body('type', 'Reminder type is required').notEmpty(),
  body('title', 'Title is required').notEmpty(),
  body('schedule.time', 'Schedule time is required').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      type,
      title,
      description,
      schedule,
      mealSettings,
      activitySettings,
      hydrationSettings,
      sleepSettings,
      notifications,
      alertSettings,
      tags,
      priority
    } = req.body;

    const reminder = new Reminder({
      userId: req.user.id,
      type,
      title,
      description,
      schedule,
      mealSettings,
      activitySettings,
      hydrationSettings,
      sleepSettings,
      notifications,
      alertSettings,
      tags,
      priority
    });

    await reminder.save();

    res.json({
      message: 'Reminder created successfully',
      reminder
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/reminders
// @desc    Get all reminders for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { type, isActive, limit = 20, page = 1 } = req.query;

    const query = { userId: req.user.id };
    if (type) query.type = type;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const reminders = await Reminder.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Reminder.countDocuments(query);

    res.json({
      reminders,
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

// @route   PUT /api/reminders/:id
// @desc    Update reminder
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    if (reminder.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        reminder[key] = req.body[key];
      }
    });

    await reminder.save();

    res.json({
      message: 'Reminder updated successfully',
      reminder
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/reminders/:id
// @desc    Delete reminder
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    if (reminder.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await reminder.remove();

    res.json({ message: 'Reminder deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/reminders/:id/complete
// @desc    Mark reminder as completed
// @access  Private
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const { response = 'completed', notes = '' } = req.body;
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    if (reminder.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await reminder.markCompleted(response, notes);

    res.json({
      message: 'Reminder marked as completed',
      reminder
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 