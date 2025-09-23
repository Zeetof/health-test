const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/resources/articles
// @desc    Get educational articles
// @access  Public
router.get('/articles', async (req, res) => {
  try {
    const { category, limit = 10, page = 1 } = req.query;

    // Placeholder data
    const articles = [
      {
        id: 1,
        title: 'The Benefits of Regular Exercise for Students',
        excerpt: 'Learn how regular physical activity can improve your academic performance and overall well-being.',
        category: 'fitness',
        author: 'Dr. Sarah Johnson',
        publishDate: new Date('2024-01-15'),
        readTime: '5 min',
        image: 'https://via.placeholder.com/300x200',
        tags: ['exercise', 'students', 'health', 'academic-performance']
      },
      {
        id: 2,
        title: 'Nutrition Tips for Busy College Students',
        excerpt: 'Simple and healthy meal ideas that fit into your busy schedule.',
        category: 'nutrition',
        author: 'Nutritionist Mike Chen',
        publishDate: new Date('2024-01-10'),
        readTime: '7 min',
        image: 'https://via.placeholder.com/300x200',
        tags: ['nutrition', 'college', 'meal-prep', 'healthy-eating']
      },
      {
        id: 3,
        title: 'Building Healthy Sleep Habits',
        excerpt: 'How to establish a consistent sleep schedule that supports your academic and fitness goals.',
        category: 'wellness',
        author: 'Sleep Specialist Dr. Emily Brown',
        publishDate: new Date('2024-01-05'),
        readTime: '6 min',
        image: 'https://via.placeholder.com/300x200',
        tags: ['sleep', 'habits', 'wellness', 'recovery']
      }
    ];

    // Filter by category if provided
    const filteredArticles = category ? 
      articles.filter(article => article.category === category) : 
      articles;

    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

    res.json({
      articles: paginatedArticles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredArticles.length / parseInt(limit)),
        totalItems: filteredArticles.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/resources/tips
// @desc    Get daily health tips
// @access  Public
router.get('/tips', async (req, res) => {
  try {
    // Placeholder data
    const tips = [
      {
        id: 1,
        title: 'Stay Hydrated',
        content: 'Drink at least 8 glasses of water daily to maintain optimal health and performance.',
        category: 'hydration',
        difficulty: 'easy'
      },
      {
        id: 2,
        title: 'Take Regular Breaks',
        content: 'Take a 5-minute break every hour during study sessions to improve focus and reduce stress.',
        category: 'wellness',
        difficulty: 'easy'
      },
      {
        id: 3,
        title: 'Plan Your Meals',
        content: 'Plan your meals for the week to ensure you eat healthy and save money.',
        category: 'nutrition',
        difficulty: 'medium'
      }
    ];

    res.json({ tips });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/resources/recipes
// @desc    Get healthy recipes
// @access  Public
router.get('/recipes', async (req, res) => {
  try {
    const { category, difficulty, limit = 10, page = 1 } = req.query;

    // Placeholder data
    const recipes = [
      {
        id: 1,
        title: 'Quick Overnight Oats',
        description: 'A healthy breakfast that you can prepare the night before.',
        category: 'breakfast',
        difficulty: 'easy',
        prepTime: '5 min',
        cookTime: '0 min',
        servings: 1,
        calories: 320,
        protein: 12,
        carbs: 45,
        fat: 8,
        ingredients: [
          '1/2 cup rolled oats',
          '1/2 cup almond milk',
          '1 tbsp honey',
          '1/4 cup berries'
        ],
        instructions: [
          'Mix oats and almond milk in a jar',
          'Add honey and stir well',
          'Refrigerate overnight',
          'Top with berries before serving'
        ],
        image: 'https://via.placeholder.com/300x200',
        tags: ['breakfast', 'vegetarian', 'quick', 'healthy']
      },
      {
        id: 2,
        title: 'Grilled Chicken Salad',
        description: 'A protein-rich lunch option that\'s easy to prepare.',
        category: 'lunch',
        difficulty: 'medium',
        prepTime: '10 min',
        cookTime: '15 min',
        servings: 2,
        calories: 280,
        protein: 35,
        carbs: 8,
        fat: 12,
        ingredients: [
          '2 chicken breasts',
          'Mixed greens',
          'Cherry tomatoes',
          'Cucumber',
          'Olive oil',
          'Balsamic vinegar'
        ],
        instructions: [
          'Season chicken with salt and pepper',
          'Grill for 6-8 minutes per side',
          'Chop vegetables',
          'Combine with grilled chicken',
          'Drizzle with olive oil and balsamic'
        ],
        image: 'https://via.placeholder.com/300x200',
        tags: ['lunch', 'protein', 'salad', 'grilled']
      }
    ];

    // Filter recipes
    let filteredRecipes = recipes;
    if (category) {
      filteredRecipes = filteredRecipes.filter(recipe => recipe.category === category);
    }
    if (difficulty) {
      filteredRecipes = filteredRecipes.filter(recipe => recipe.difficulty === difficulty);
    }

    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedRecipes = filteredRecipes.slice(startIndex, endIndex);

    res.json({
      recipes: paginatedRecipes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredRecipes.length / parseInt(limit)),
        totalItems: filteredRecipes.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/resources/university
// @desc    Get university health and wellness resources
// @access  Public
router.get('/university', async (req, res) => {
  try {
    // Placeholder data for university resources
    const resources = [
      {
        id: 1,
        title: 'Campus Health Center',
        description: 'Free health services for all enrolled students',
        type: 'health-service',
        location: 'Student Union Building, Room 101',
        phone: '(555) 123-4567',
        hours: 'Monday-Friday: 8AM-6PM',
        services: ['Physical exams', 'Mental health counseling', 'Nutrition consultation']
      },
      {
        id: 2,
        title: 'Campus Recreation Center',
        description: 'State-of-the-art fitness facilities and group classes',
        type: 'fitness',
        location: 'Recreation Center',
        phone: '(555) 123-4568',
        hours: 'Monday-Sunday: 6AM-11PM',
        services: ['Gym equipment', 'Group fitness classes', 'Indoor pool', 'Basketball courts']
      },
      {
        id: 3,
        title: 'Nutrition Counseling',
        description: 'Free nutrition consultation with registered dietitians',
        type: 'nutrition',
        location: 'Health Center, Room 205',
        phone: '(555) 123-4569',
        hours: 'By appointment',
        services: ['Personalized meal plans', 'Dietary restrictions support', 'Weight management']
      },
      {
        id: 4,
        title: 'Mental Health Services',
        description: 'Professional counseling and mental health support',
        type: 'mental-health',
        location: 'Student Services Building',
        phone: '(555) 123-4570',
        hours: 'Monday-Friday: 9AM-5PM',
        services: ['Individual counseling', 'Group therapy', 'Stress management workshops']
      }
    ];

    res.json({ resources });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/resources/workouts
// @desc    Get workout plans and exercises
// @access  Public
router.get('/workouts', async (req, res) => {
  try {
    const { level, type, limit = 10, page = 1 } = req.query;

    // Placeholder data
    const workouts = [
      {
        id: 1,
        title: 'Beginner Full Body Workout',
        description: 'A complete workout for beginners that targets all major muscle groups',
        level: 'beginner',
        type: 'strength',
        duration: '45 min',
        equipment: ['dumbbells', 'resistance bands'],
        exercises: [
          {
            name: 'Squats',
            sets: 3,
            reps: 12,
            rest: '60 sec'
          },
          {
            name: 'Push-ups',
            sets: 3,
            reps: '10-15',
            rest: '60 sec'
          },
          {
            name: 'Dumbbell Rows',
            sets: 3,
            reps: 12,
            rest: '60 sec'
          }
        ],
        calories: 250,
        tags: ['beginner', 'full-body', 'strength']
      },
      {
        id: 2,
        title: 'Cardio HIIT Workout',
        description: 'High-intensity interval training for maximum calorie burn',
        level: 'intermediate',
        type: 'cardio',
        duration: '30 min',
        equipment: ['none'],
        exercises: [
          {
            name: 'Jumping Jacks',
            duration: '30 sec',
            rest: '15 sec'
          },
          {
            name: 'Burpees',
            duration: '30 sec',
            rest: '15 sec'
          },
          {
            name: 'Mountain Climbers',
            duration: '30 sec',
            rest: '15 sec'
          }
        ],
        calories: 400,
        tags: ['intermediate', 'cardio', 'hiit']
      }
    ];

    // Filter workouts
    let filteredWorkouts = workouts;
    if (level) {
      filteredWorkouts = filteredWorkouts.filter(workout => workout.level === level);
    }
    if (type) {
      filteredWorkouts = filteredWorkouts.filter(workout => workout.type === type);
    }

    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedWorkouts = filteredWorkouts.slice(startIndex, endIndex);

    res.json({
      workouts: paginatedWorkouts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredWorkouts.length / parseInt(limit)),
        totalItems: filteredWorkouts.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 