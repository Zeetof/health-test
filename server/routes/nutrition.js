const express = require('express');
const { body, validationResult } = require('express-validator');
const Nutrition = require('../models/Nutrition');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/nutrition
// @desc    Log a new meal
// @access  Private
router.post('/', auth, [
  body('mealType', 'Meal type is required').notEmpty(),
  body('mealName', 'Meal name is required').notEmpty(),
  body('calories', 'Calories must be a positive number').isFloat({ min: 0 }),
  body('consumedAt', 'Consumption time is required').notEmpty()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      mealType,
      mealName,
      description,
      calories,
      macronutrients,
      micronutrients,
      foodItems,
      portionSize,
      portionUnit,
      satisfaction,
      hungerLevel,
      fullnessLevel,
      dietaryCompliance,
      preparationTime,
      cookingMethod,
      location,
      eatenWith,
      notes,
      tags,
      photos
    } = req.body;

    // Create new nutrition entry
    const nutrition = new Nutrition({
      userId: req.user.id,
      mealType,
      mealName,
      description,
      calories,
      macronutrients,
      micronutrients,
      foodItems,
      portionSize,
      portionUnit,
      satisfaction,
      hungerLevel,
      fullnessLevel,
      dietaryCompliance,
      preparationTime,
      cookingMethod,
      location,
      eatenWith,
      notes,
      tags,
      photos,
      consumedAt: new Date(req.body.consumedAt)
    });

    // Calculate total calories from food items if not provided
    if (!calories && foodItems && foodItems.length > 0) {
      nutrition.calories = nutrition.calculateTotalCalories();
    }

    // Calculate total macronutrients from food items if not provided
    if (!macronutrients && foodItems && foodItems.length > 0) {
      nutrition.macronutrients = nutrition.calculateTotalMacros();
    }

    await nutrition.save();

    res.json({
      message: 'Meal logged successfully',
      nutrition: nutrition.getSummary()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/nutrition
// @desc    Get all nutrition entries for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      mealType,
      startDate,
      endDate,
      limit = 20,
      page = 1,
      sortBy = 'consumedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { userId: req.user.id };
    
    if (mealType) query.mealType = mealType;
    if (startDate || endDate) {
      query.consumedAt = {};
      if (startDate) query.consumedAt.$gte = new Date(startDate);
      if (endDate) query.consumedAt.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const nutrition = await Nutrition.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count
    const total = await Nutrition.countDocuments(query);

    res.json({
      nutrition,
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

// @route   GET /api/nutrition/:id
// @desc    Get nutrition entry by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const nutrition = await Nutrition.findById(req.params.id);

    if (!nutrition) {
      return res.status(404).json({ error: 'Nutrition entry not found' });
    }

    // Check if user owns the entry
    if (nutrition.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(nutrition);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Nutrition entry not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/nutrition/:id
// @desc    Update nutrition entry
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const nutrition = await Nutrition.findById(req.params.id);

    if (!nutrition) {
      return res.status(404).json({ error: 'Nutrition entry not found' });
    }

    // Check if user owns the entry
    if (nutrition.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update fields
    const updateFields = [
      'mealType', 'mealName', 'description', 'calories', 'macronutrients',
      'micronutrients', 'foodItems', 'portionSize', 'portionUnit',
      'satisfaction', 'hungerLevel', 'fullnessLevel', 'dietaryCompliance',
      'preparationTime', 'cookingMethod', 'location', 'eatenWith',
      'notes', 'tags', 'photos'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        nutrition[field] = req.body[field];
      }
    });

    if (req.body.consumedAt) nutrition.consumedAt = new Date(req.body.consumedAt);

    // Recalculate totals if food items changed
    if (req.body.foodItems) {
      nutrition.calories = nutrition.calculateTotalCalories();
      nutrition.macronutrients = nutrition.calculateTotalMacros();
    }

    await nutrition.save();

    res.json({
      message: 'Nutrition entry updated successfully',
      nutrition: nutrition.getSummary()
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Nutrition entry not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/nutrition/:id
// @desc    Delete nutrition entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const nutrition = await Nutrition.findById(req.params.id);

    if (!nutrition) {
      return res.status(404).json({ error: 'Nutrition entry not found' });
    }

    // Check if user owns the entry
    if (nutrition.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await nutrition.remove();

    res.json({ message: 'Nutrition entry deleted successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Nutrition entry not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/nutrition/stats/summary
// @desc    Get nutrition summary statistics
// @access  Private
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = { userId: req.user.id };
    if (startDate || endDate) {
      query.consumedAt = {};
      if (startDate) query.consumedAt.$gte = new Date(startDate);
      if (endDate) query.consumedAt.$lte = new Date(endDate);
    }

    const nutrition = await Nutrition.find(query);

    const stats = {
      totalMeals: nutrition.length,
      totalCalories: nutrition.reduce((sum, meal) => sum + meal.calories, 0),
      averageCalories: nutrition.length > 0 ? 
        nutrition.reduce((sum, meal) => sum + meal.calories, 0) / nutrition.length : 0,
      totalMacros: {
        protein: nutrition.reduce((sum, meal) => sum + (meal.macronutrients.protein || 0), 0),
        carbohydrates: nutrition.reduce((sum, meal) => sum + (meal.macronutrients.carbohydrates || 0), 0),
        fat: nutrition.reduce((sum, meal) => sum + (meal.macronutrients.fat || 0), 0),
        fiber: nutrition.reduce((sum, meal) => sum + (meal.macronutrients.fiber || 0), 0),
        sugar: nutrition.reduce((sum, meal) => sum + (meal.macronutrients.sugar || 0), 0)
      },
      byMealType: {},
      averageSatisfaction: nutrition.length > 0 ? 
        nutrition.reduce((sum, meal) => sum + (meal.satisfaction || 5), 0) / nutrition.length : 0
    };

    // Group by meal type
    nutrition.forEach(meal => {
      if (!stats.byMealType[meal.mealType]) {
        stats.byMealType[meal.mealType] = {
          count: 0,
          totalCalories: 0,
          averageCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0
        };
      }
      stats.byMealType[meal.mealType].count++;
      stats.byMealType[meal.mealType].totalCalories += meal.calories;
      stats.byMealType[meal.mealType].totalProtein += meal.macronutrients.protein || 0;
      stats.byMealType[meal.mealType].totalCarbs += meal.macronutrients.carbohydrates || 0;
      stats.byMealType[meal.mealType].totalFat += meal.macronutrients.fat || 0;
    });

    // Calculate averages for each meal type
    Object.keys(stats.byMealType).forEach(mealType => {
      const mealStats = stats.byMealType[mealType];
      mealStats.averageCalories = mealStats.totalCalories / mealStats.count;
    });

    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/nutrition/stats/trends
// @desc    Get nutrition trends over time
// @access  Private
router.get('/stats/trends', auth, async (req, res) => {
  try {
    const { period = 'week', mealType } = req.query;
    
    const query = { userId: req.user.id };
    if (mealType) query.mealType = mealType;

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

    query.consumedAt = { $gte: startDate };

    const nutrition = await Nutrition.find(query).sort({ consumedAt: 1 });

    // Group nutrition by date
    const trends = {};
    nutrition.forEach(meal => {
      const date = meal.consumedAt.toISOString().split('T')[0];
      if (!trends[date]) {
        trends[date] = {
          date,
          meals: 0,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          satisfaction: 0
        };
      }
      trends[date].meals++;
      trends[date].calories += meal.calories;
      trends[date].protein += meal.macronutrients.protein || 0;
      trends[date].carbs += meal.macronutrients.carbohydrates || 0;
      trends[date].fat += meal.macronutrients.fat || 0;
      trends[date].satisfaction += meal.satisfaction || 5;
    });

    // Calculate averages
    Object.keys(trends).forEach(date => {
      const dayStats = trends[date];
      dayStats.averageCalories = dayStats.calories / dayStats.meals;
      dayStats.averageSatisfaction = dayStats.satisfaction / dayStats.meals;
    });

    res.json(Object.values(trends));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/nutrition/stats/daily
// @desc    Get daily nutrition summary
// @access  Private
router.get('/stats/daily', auth, async (req, res) => {
  try {
    const { date } = req.query;
    
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const nutrition = await Nutrition.find({
      userId: req.user.id,
      consumedAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    const dailyStats = {
      date: startOfDay.toISOString().split('T')[0],
      meals: nutrition.length,
      totalCalories: nutrition.reduce((sum, meal) => sum + meal.calories, 0),
      totalProtein: nutrition.reduce((sum, meal) => sum + (meal.macronutrients.protein || 0), 0),
      totalCarbs: nutrition.reduce((sum, meal) => sum + (meal.macronutrients.carbohydrates || 0), 0),
      totalFat: nutrition.reduce((sum, meal) => sum + (meal.macronutrients.fat || 0), 0),
      totalFiber: nutrition.reduce((sum, meal) => sum + (meal.macronutrients.fiber || 0), 0),
      totalSugar: nutrition.reduce((sum, meal) => sum + (meal.macronutrients.sugar || 0), 0),
      averageSatisfaction: nutrition.length > 0 ? 
        nutrition.reduce((sum, meal) => sum + (meal.satisfaction || 5), 0) / nutrition.length : 0,
      byMealType: {}
    };

    // Group by meal type
    nutrition.forEach(meal => {
      if (!dailyStats.byMealType[meal.mealType]) {
        dailyStats.byMealType[meal.mealType] = {
          count: 0,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        };
      }
      dailyStats.byMealType[meal.mealType].count++;
      dailyStats.byMealType[meal.mealType].calories += meal.calories;
      dailyStats.byMealType[meal.mealType].protein += meal.macronutrients.protein || 0;
      dailyStats.byMealType[meal.mealType].carbs += meal.macronutrients.carbohydrates || 0;
      dailyStats.byMealType[meal.mealType].fat += meal.macronutrients.fat || 0;
    });

    res.json(dailyStats);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 