const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Reminder Type
  type: {
    type: String,
    required: true,
    enum: ['meal', 'activity', 'hydration', 'sleep', 'medication', 'custom']
  },
  
  // Reminder Details
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  // Scheduling
  schedule: {
    type: {
      type: String,
      required: true,
      enum: ['once', 'daily', 'weekly', 'monthly', 'custom']
    },
    
    // For one-time reminders
    dateTime: {
      type: Date
    },
    
    // For recurring reminders
    time: {
      type: String, // HH:MM format
      required: true
    },
    
    daysOfWeek: [{
      type: Number, // 0-6 (Sunday-Saturday)
      min: 0,
      max: 6
    }],
    
    daysOfMonth: [{
      type: Number,
      min: 1,
      max: 31
    }],
    
    // Custom cron expression
    cronExpression: {
      type: String
    }
  },
  
  // Meal-specific settings
  mealSettings: {
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack']
    },
    
    eatingWindow: {
      start: String, // HH:MM
      end: String // HH:MM
    },
    
    stopEatingTime: {
      type: String, // HH:MM - when to stop eating
      default: '20:00'
    }
  },
  
  // Activity-specific settings
  activitySettings: {
    activityType: {
      type: String,
      enum: ['running', 'workout', 'walking', 'cycling', 'swimming', 'gym']
    },
    
    duration: {
      type: Number, // in minutes
      min: 1
    },
    
    location: String,
    
    preparationTime: {
      type: Number, // in minutes
      default: 15
    }
  },
  
  // Hydration settings
  hydrationSettings: {
    targetAmount: {
      type: Number, // in ml
      default: 2000
    },
    
    interval: {
      type: Number, // in minutes
      default: 60
    },
    
    amountPerReminder: {
      type: Number, // in ml
      default: 250
    }
  },
  
  // Sleep settings
  sleepSettings: {
    bedtime: {
      type: String, // HH:MM
      default: '22:00'
    },
    
    wakeTime: {
      type: String, // HH:MM
      default: '07:00'
    },
    
    preparationTime: {
      type: Number, // in minutes
      default: 30
    }
  },
  
  // Notification Settings
  notifications: {
    push: {
      type: Boolean,
      default: true
    },
    
    email: {
      type: Boolean,
      default: false
    },
    
    sms: {
      type: Boolean,
      default: false
    },
    
    inApp: {
      type: Boolean,
      default: true
    }
  },
  
  // Alert Settings
  alertSettings: {
    sound: {
      type: String,
      default: 'default'
    },
    
    vibration: {
      type: Boolean,
      default: true
    },
    
    repeat: {
      type: Number, // number of times to repeat
      default: 3
    },
    
    snooze: {
      type: Number, // minutes to snooze
      default: 5
    }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isCompleted: {
    type: Boolean,
    default: false
  },
  
  // Completion tracking
  completions: [{
    completedAt: {
      type: Date,
      default: Date.now
    },
    
    response: {
      type: String,
      enum: ['completed', 'snoozed', 'dismissed', 'skipped']
    },
    
    notes: String
  }],
  
  // Statistics
  stats: {
    totalTriggered: {
      type: Number,
      default: 0
    },
    
    totalCompleted: {
      type: Number,
      default: 0
    },
    
    totalSnoozed: {
      type: Number,
      default: 0
    },
    
    totalDismissed: {
      type: Number,
      default: 0
    },
    
    lastTriggered: Date,
    
    lastCompleted: Date
  },
  
  // Tags for organization
  tags: [String],
  
  // Priority level
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
reminderSchema.index({ userId: 1, 'schedule.dateTime': 1 });
reminderSchema.index({ userId: 1, isActive: 1 });
reminderSchema.index({ type: 1, isActive: 1 });

// Virtual for next occurrence
reminderSchema.virtual('nextOccurrence').get(function() {
  if (this.schedule.type === 'once') {
    return this.schedule.dateTime;
  }
  
  // For recurring reminders, calculate next occurrence
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [hours, minutes] = this.schedule.time.split(':').map(Number);
  
  let nextDate = new Date(today);
  nextDate.setHours(hours, minutes, 0, 0);
  
  if (nextDate <= now) {
    nextDate.setDate(nextDate.getDate() + 1);
  }
  
  return nextDate;
});

// Method to check if reminder should trigger now
reminderSchema.methods.shouldTrigger = function() {
  if (!this.isActive || this.isCompleted) return false;
  
  const now = new Date();
  
  if (this.schedule.type === 'once') {
    return this.schedule.dateTime <= now;
  }
  
  // For recurring reminders
  const [hours, minutes] = this.schedule.time.split(':').map(Number);
  const reminderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  
  // Check if it's the right time and day
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const isRightTime = currentHour === hours && Math.abs(currentMinute - minutes) <= 5;
  
  if (this.schedule.daysOfWeek && this.schedule.daysOfWeek.length > 0) {
    return isRightTime && this.schedule.daysOfWeek.includes(now.getDay());
  }
  
  return isRightTime;
};

// Method to mark as completed
reminderSchema.methods.markCompleted = function(response = 'completed', notes = '') {
  this.completions.push({
    completedAt: new Date(),
    response,
    notes
  });
  
  this.stats.totalTriggered++;
  
  if (response === 'completed') {
    this.stats.totalCompleted++;
    this.stats.lastCompleted = new Date();
  } else if (response === 'snoozed') {
    this.stats.totalSnoozed++;
  } else if (response === 'dismissed') {
    this.stats.totalDismissed++;
  }
  
  this.stats.lastTriggered = new Date();
  
  if (this.schedule.type === 'once') {
    this.isCompleted = true;
  }
  
  return this.save();
};

// Method to get completion rate
reminderSchema.methods.getCompletionRate = function() {
  if (this.stats.totalTriggered === 0) return 0;
  return (this.stats.totalCompleted / this.stats.totalTriggered) * 100;
};

// Ensure virtual fields are serialized
reminderSchema.set('toJSON', { virtuals: true });
reminderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Reminder', reminderSchema); 