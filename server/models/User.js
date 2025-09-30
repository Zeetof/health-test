const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Personal Information
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say']
  },
  phoneNumber: {
    type: String
  },
  
  // Health Information
  height: {
    type: Number, // in cm
    min: 100,
    max: 250
  },
  weight: {
    type: Number, // in kg
    min: 30,
    max: 300
  },
  bmi: {
    type: Number
  },
  
  // Health History
  medicalConditions: [{
    condition: String,
    diagnosedDate: Date,
    isActive: Boolean,
    medications: [String]
  }],
  
  // Fitness Preferences
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  
  activityPreferences: [{
    type: String,
    enum: ['running', 'walking', 'cycling', 'swimming', 'gym', 'yoga', 'sports']
  }],
  
  // Nutrition Preferences
  dietaryRestrictions: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'none']
  }],
  
  allergies: [String],
  
  // Goals and Preferences
  primaryGoal: {
    type: String,
    enum: ['weight-loss', 'muscle-gain', 'maintenance', 'general-fitness', 'sports-performance'],
    default: 'general-fitness'
  },
  
  targetWeight: Number,
  targetSteps: {
    type: Number,
    default: 10000
  },
  targetCalories: Number,
  
  // Notification Preferences
  notifications: {
    mealReminders: { type: Boolean, default: true },
    activityReminders: { type: Boolean, default: true },
    hydrationReminders: { type: Boolean, default: true },
    sleepReminders: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true }
  },
  
  // Privacy Settings
  privacySettings: {
    profileVisibility: { type: String, enum: ['public', 'friends', 'private'], default: 'friends' },
    activitySharing: { type: Boolean, default: true },
    goalSharing: { type: Boolean, default: true }
  },
  
  // University Information
  university: {
    name: String,
    studentId: String,
    department: String,
    yearOfStudy: Number
  },
  
  // Roles & Classroom
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  classroom: {
    name: String,
    grade: String,
    section: String,
    homeroomTeacher: String
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  lastLogin: Date,
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

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to calculate BMI
userSchema.methods.calculateBMI = function() {
  if (this.height && this.weight) {
    const heightInMeters = this.height / 100;
    this.bmi = this.weight / (heightInMeters * heightInMeters);
    return this.bmi;
  }
  return null;
};

// Method to get user's full name
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Method to get user's age
userSchema.methods.getAge = function() {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  return null;
};

// Virtual for user's display name
userSchema.virtual('displayName').get(function() {
  return this.getFullName();
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema); 