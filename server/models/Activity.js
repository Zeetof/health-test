const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Activity Type
  type: {
    type: String,
    required: true,
    enum: ['running', 'walking', 'cycling', 'swimming', 'gym', 'yoga', 'sports', 'other']
  },
  
  // Activity Details
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  // Duration and Distance
  duration: {
    type: Number, // in minutes
    required: true,
    min: 1
  },
  
  distance: {
    type: Number, // in kilometers
    min: 0
  },
  
  // Steps (for walking/running)
  steps: {
    type: Number,
    min: 0
  },
  
  // GPS Data (for outdoor activities)
  route: {
    coordinates: [{
      latitude: Number,
      longitude: Number,
      timestamp: Date
    }],
    startLocation: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    endLocation: {
      latitude: Number,
      longitude: Number,
      address: String
    }
  },
  
  // Performance Metrics
  caloriesBurned: {
    type: Number,
    min: 0
  },
  
  averageHeartRate: {
    type: Number,
    min: 0,
    max: 220
  },
  
  maxHeartRate: {
    type: Number,
    min: 0,
    max: 220
  },
  
  averagePace: {
    type: Number, // minutes per kilometer
    min: 0
  },
  
  // Workout Specific Data
  workout: {
    exercises: [{
      name: String,
      sets: Number,
      reps: Number,
      weight: Number, // in kg
      duration: Number, // in seconds
      restTime: Number // in seconds
    }],
    totalSets: Number,
    totalReps: Number,
    totalWeight: Number
  },
  
  // Intensity and Difficulty
  intensity: {
    type: String,
    enum: ['low', 'moderate', 'high', 'very-high'],
    default: 'moderate'
  },
  
  difficulty: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  
  // Weather Conditions (for outdoor activities)
  weather: {
    temperature: Number, // in Celsius
    humidity: Number, // percentage
    conditions: String, // sunny, rainy, cloudy, etc.
    windSpeed: Number // in km/h
  },
  
  // Personal Notes
  notes: {
    type: String,
    trim: true
  },
  
  // Mood and Energy
  mood: {
    type: String,
    enum: ['excellent', 'good', 'okay', 'poor', 'terrible']
  },
  
  energyLevel: {
    type: Number,
    min: 1,
    max: 10
  },
  
  // Social Features
  isPublic: {
    type: Boolean,
    default: false
  },
  
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Achievements and Milestones
  achievements: [{
    type: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Tags for categorization
  tags: [String],
  
  // Timestamps
  startTime: {
    type: Date,
    required: true
  },
  
  endTime: {
    type: Date,
    required: true
  },
  
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
activitySchema.index({ userId: 1, startTime: -1 });
activitySchema.index({ type: 1, startTime: -1 });
activitySchema.index({ 'route.coordinates': '2dsphere' });

// Virtual for activity duration in hours
activitySchema.virtual('durationHours').get(function() {
  return this.duration / 60;
});

// Virtual for average speed (km/h)
activitySchema.virtual('averageSpeed').get(function() {
  if (this.distance && this.duration) {
    return (this.distance / this.duration) * 60; // km/h
  }
  return null;
});

// Virtual for pace (min/km)
activitySchema.virtual('pace').get(function() {
  if (this.distance && this.duration) {
    return this.duration / this.distance; // min/km
  }
  return null;
});

// Method to calculate calories burned (basic calculation)
activitySchema.methods.calculateCalories = function(userWeight) {
  if (!userWeight || !this.duration) return null;
  
  const caloriesPerMinute = {
    running: 11.5,
    walking: 4.5,
    cycling: 8.0,
    swimming: 9.0,
    gym: 6.0,
    yoga: 3.0,
    sports: 8.5,
    other: 5.0
  };
  
  const baseCalories = caloriesPerMinute[this.type] || 5.0;
  return Math.round((baseCalories * userWeight * this.duration) / 60);
};

// Method to get activity summary
activitySchema.methods.getSummary = function() {
  return {
    id: this._id,
    type: this.type,
    title: this.title,
    duration: this.duration,
    distance: this.distance,
    caloriesBurned: this.caloriesBurned,
    startTime: this.startTime,
    endTime: this.endTime,
    intensity: this.intensity
  };
};

// Ensure virtual fields are serialized
activitySchema.set('toJSON', { virtuals: true });
activitySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Activity', activitySchema); 