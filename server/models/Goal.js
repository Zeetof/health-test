const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Goal Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  // Goal Category
  category: {
    type: String,
    required: true,
    enum: ['weight', 'fitness', 'nutrition', 'activity', 'sleep', 'hydration', 'custom']
  },
  
  // Goal Type
  type: {
    type: String,
    required: true,
    enum: ['target', 'maintenance', 'improvement', 'habit']
  },
  
  // Goal Direction
  direction: {
    type: String,
    required: true,
    enum: ['increase', 'decrease', 'maintain', 'achieve']
  },
  
  // Target Values
  target: {
    value: {
      type: Number,
      required: true
    },
    
    unit: {
      type: String,
      required: true
    },
    
    timeframe: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      required: true
    }
  },
  
  // Current Progress
  current: {
    value: {
      type: Number,
      default: 0
    },
    
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Progress History
  progress: [{
    date: {
      type: Date,
      required: true
    },
    
    value: {
      type: Number,
      required: true
    },
    
    notes: String
  }],
  
  // Goal Status
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  
  // Completion
  completedAt: Date,
  
  // Time Period
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  endDate: {
    type: Date
  },
  
  // Specific Goal Types
  
  // Weight Goals
  weightGoal: {
    targetWeight: Number,
    currentWeight: Number,
    weeklyTarget: Number, // kg per week
    measurementFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    }
  },
  
  // Fitness Goals
  fitnessGoal: {
    activityType: {
      type: String,
      enum: ['running', 'walking', 'cycling', 'swimming', 'gym', 'yoga', 'sports']
    },
    
    targetDistance: Number, // km
    targetDuration: Number, // minutes
    targetFrequency: Number, // times per week
    targetCalories: Number, // calories burned
    targetSteps: Number
  },
  
  // Nutrition Goals
  nutritionGoal: {
    targetCalories: Number,
    targetProtein: Number, // grams
    targetCarbs: Number, // grams
    targetFat: Number, // grams
    targetFiber: Number, // grams
    targetWater: Number, // ml
    mealFrequency: Number // meals per day
  },
  
  // Sleep Goals
  sleepGoal: {
    targetHours: Number,
    targetBedtime: String, // HH:MM
    targetWakeTime: String, // HH:MM
    qualityTarget: {
      type: Number,
      min: 1,
      max: 10
    }
  },
  
  // Habit Goals
  habitGoal: {
    habitName: String,
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    },
    streakTarget: Number,
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    }
  },
  
  // Milestones
  milestones: [{
    title: String,
    targetValue: Number,
    achievedAt: Date,
    reward: String
  }],
  
  // Reminders
  reminders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reminder'
  }],
  
  // Social Features
  isPublic: {
    type: Boolean,
    default: false
  },
  
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Support and Accountability
  accountabilityPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Notes and Tags
  notes: String,
  
  tags: [String],
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ category: 1, status: 1 });
goalSchema.index({ endDate: 1, status: 1 });

// Virtual for progress percentage
goalSchema.virtual('progressPercentage').get(function() {
  if (this.target.value === 0) return 0;
  
  const progress = (this.current.value / this.target.value) * 100;
  return Math.min(Math.max(progress, 0), 100);
});

// Virtual for days remaining
goalSchema.virtual('daysRemaining').get(function() {
  if (!this.endDate) return null;
  
  const now = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(diffDays, 0);
});

// Virtual for days since start
goalSchema.virtual('daysSinceStart').get(function() {
  const now = new Date();
  const start = new Date(this.startDate);
  const diffTime = now - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(diffDays, 0);
});

// Virtual for average daily progress
goalSchema.virtual('averageDailyProgress').get(function() {
  const daysSinceStart = this.daysSinceStart;
  if (daysSinceStart === 0) return 0;
  
  return this.current.value / daysSinceStart;
});

// Method to update progress
goalSchema.methods.updateProgress = function(value, notes = '') {
  this.current.value = value;
  this.current.lastUpdated = new Date();
  
  this.progress.push({
    date: new Date(),
    value: value,
    notes: notes
  });
  
  // Check if goal is completed
  if (this.direction === 'increase' && value >= this.target.value) {
    this.markCompleted();
  } else if (this.direction === 'decrease' && value <= this.target.value) {
    this.markCompleted();
  } else if (this.direction === 'maintain' && Math.abs(value - this.target.value) <= 5) {
    this.markCompleted();
  }
  
  return this.save();
};

// Method to mark goal as completed
goalSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Method to calculate streak for habit goals
goalSchema.methods.updateStreak = function(completed) {
  if (this.category !== 'custom' || !this.habitGoal) return;
  
  if (completed) {
    this.habitGoal.currentStreak++;
    if (this.habitGoal.currentStreak > this.habitGoal.longestStreak) {
      this.habitGoal.longestStreak = this.habitGoal.currentStreak;
    }
  } else {
    this.habitGoal.currentStreak = 0;
  }
  
  return this.save();
};

// Method to get goal summary
goalSchema.methods.getSummary = function() {
  return {
    id: this._id,
    title: this.title,
    category: this.category,
    status: this.status,
    progressPercentage: this.progressPercentage,
    currentValue: this.current.value,
    targetValue: this.target.value,
    daysRemaining: this.daysRemaining,
    daysSinceStart: this.daysSinceStart
  };
};

// Ensure virtual fields are serialized
goalSchema.set('toJSON', { virtuals: true });
goalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Goal', goalSchema); 