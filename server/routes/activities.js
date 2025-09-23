const express = require('express');
const { body, validationResult } = require('express-validator');
const Activity = require('../models/Activity');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/activities
// @desc    Create a new activity
// @access  Private
router.post('/', auth, [
  body('type', 'Activity type is required').notEmpty(),
  body('title', 'Title is required').notEmpty(),
  body('duration', 'Duration must be a positive number').isFloat({ min: 1 }),
  body('startTime', 'Start time is required').notEmpty(),
  body('endTime', 'End time is required').notEmpty()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      type,
      title,
      description,
      duration,
      distance,
      steps,
      route,
      caloriesBurned,
      averageHeartRate,
      maxHeartRate,
      averagePace,
      workout,
      intensity,
      difficulty,
      weather,
      notes,
      mood,
      energyLevel,
      isPublic,
      sharedWith,
      tags
    } = req.body;

    // Create new activity
    const activity = new Activity({
      userId: req.user.id,
      type,
      title,
      description,
      duration,
      distance,
      steps,
      route,
      caloriesBurned,
      averageHeartRate,
      maxHeartRate,
      averagePace,
      workout,
      intensity,
      difficulty,
      weather,
      notes,
      mood,
      energyLevel,
      isPublic,
      sharedWith,
      tags,
      startTime: new Date(req.body.startTime),
      endTime: new Date(req.body.endTime)
    });

    // Calculate calories burned if not provided
    if (!caloriesBurned) {
      const user = await User.findById(req.user.id);
      if (user && user.weight) {
        activity.caloriesBurned = activity.calculateCalories(user.weight);
      }
    }

    await activity.save();

    res.json({
      message: 'Activity created successfully',
      activity: activity.getSummary()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/activities
// @desc    Get all activities for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      type,
      startDate,
      endDate,
      limit = 20,
      page = 1,
      sortBy = 'startTime',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { userId: req.user.id };
    
    if (type) query.type = type;
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const activities = await Activity.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('sharedWith', 'firstName lastName email');

    // Get total count
    const total = await Activity.countDocuments(query);

    res.json({
      activities,
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

// @route   GET /api/activities/:id
// @desc    Get activity by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('sharedWith', 'firstName lastName email');

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Check if user owns the activity or it's shared with them
    if (activity.userId.toString() !== req.user.id && 
        !activity.isPublic && 
        !activity.sharedWith.some(user => user._id.toString() === req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(activity);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/activities/:id
// @desc    Update activity
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Check if user owns the activity
    if (activity.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update fields
    const updateFields = [
      'type', 'title', 'description', 'duration', 'distance', 'steps',
      'route', 'caloriesBurned', 'averageHeartRate', 'maxHeartRate',
      'averagePace', 'workout', 'intensity', 'difficulty', 'weather',
      'notes', 'mood', 'energyLevel', 'isPublic', 'sharedWith', 'tags'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        activity[field] = req.body[field];
      }
    });

    if (req.body.startTime) activity.startTime = new Date(req.body.startTime);
    if (req.body.endTime) activity.endTime = new Date(req.body.endTime);

    await activity.save();

    res.json({
      message: 'Activity updated successfully',
      activity: activity.getSummary()
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/activities/:id
// @desc    Delete activity
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Check if user owns the activity
    if (activity.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await activity.remove();

    res.json({ message: 'Activity deleted successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/activities/stats/summary
// @desc    Get activity summary statistics
// @access  Private
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = { userId: req.user.id };
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    const activities = await Activity.find(query);

    const stats = {
      totalActivities: activities.length,
      totalDuration: activities.reduce((sum, activity) => sum + activity.duration, 0),
      totalDistance: activities.reduce((sum, activity) => sum + (activity.distance || 0), 0),
      totalSteps: activities.reduce((sum, activity) => sum + (activity.steps || 0), 0),
      totalCalories: activities.reduce((sum, activity) => sum + (activity.caloriesBurned || 0), 0),
      averageDuration: activities.length > 0 ? 
        activities.reduce((sum, activity) => sum + activity.duration, 0) / activities.length : 0,
      averageDistance: activities.length > 0 ? 
        activities.reduce((sum, activity) => sum + (activity.distance || 0), 0) / activities.length : 0,
      averageCalories: activities.length > 0 ? 
        activities.reduce((sum, activity) => sum + (activity.caloriesBurned || 0), 0) / activities.length : 0,
      byType: {},
      byIntensity: {}
    };

    // Group by activity type
    activities.forEach(activity => {
      if (!stats.byType[activity.type]) {
        stats.byType[activity.type] = {
          count: 0,
          totalDuration: 0,
          totalDistance: 0,
          totalCalories: 0
        };
      }
      stats.byType[activity.type].count++;
      stats.byType[activity.type].totalDuration += activity.duration;
      stats.byType[activity.type].totalDistance += activity.distance || 0;
      stats.byType[activity.type].totalCalories += activity.caloriesBurned || 0;
    });

    // Group by intensity
    activities.forEach(activity => {
      if (!stats.byIntensity[activity.intensity]) {
        stats.byIntensity[activity.intensity] = {
          count: 0,
          totalDuration: 0,
          totalCalories: 0
        };
      }
      stats.byIntensity[activity.intensity].count++;
      stats.byIntensity[activity.intensity].totalDuration += activity.duration;
      stats.byIntensity[activity.intensity].totalCalories += activity.caloriesBurned || 0;
    });

    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/activities/stats/trends
// @desc    Get activity trends over time
// @access  Private
router.get('/stats/trends', auth, async (req, res) => {
  try {
    const { period = 'week', type } = req.query;
    
    const query = { userId: req.user.id };
    if (type) query.type = type;

    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    query.startTime = { $gte: startDate };

    const activities = await Activity.find(query).sort({ startTime: 1 });

    // Group activities by date
    const trends = {};
    activities.forEach(activity => {
      const date = activity.startTime.toISOString().split('T')[0];
      if (!trends[date]) {
        trends[date] = {
          date,
          activities: 0,
          duration: 0,
          distance: 0,
          calories: 0,
          steps: 0
        };
      }
      trends[date].activities++;
      trends[date].duration += activity.duration;
      trends[date].distance += activity.distance || 0;
      trends[date].calories += activity.caloriesBurned || 0;
      trends[date].steps += activity.steps || 0;
    });

    res.json(Object.values(trends));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/activities/public
// @desc    Get public activities
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;

    const activities = await Activity.find({ isPublic: true })
      .sort({ startTime: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('userId', 'firstName lastName');

    const total = await Activity.countDocuments({ isPublic: true });

    res.json({
      activities,
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

module.exports = router; 