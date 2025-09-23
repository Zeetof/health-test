const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Meal Information
  mealType: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'pre-workout', 'post-workout']
  },
  
  mealName: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  // Nutritional Information
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  
  macronutrients: {
    protein: {
      type: Number,
      min: 0,
      default: 0
    },
    carbohydrates: {
      type: Number,
      min: 0,
      default: 0
    },
    fat: {
      type: Number,
      min: 0,
      default: 0
    },
    fiber: {
      type: Number,
      min: 0,
      default: 0
    },
    sugar: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  
  // Micronutrients
  micronutrients: {
    vitaminA: { type: Number, min: 0, default: 0 },
    vitaminC: { type: Number, min: 0, default: 0 },
    vitaminD: { type: Number, min: 0, default: 0 },
    vitaminE: { type: Number, min: 0, default: 0 },
    vitaminK: { type: Number, min: 0, default: 0 },
    vitaminB1: { type: Number, min: 0, default: 0 },
    vitaminB2: { type: Number, min: 0, default: 0 },
    vitaminB3: { type: Number, min: 0, default: 0 },
    vitaminB6: { type: Number, min: 0, default: 0 },
    vitaminB12: { type: Number, min: 0, default: 0 },
    folate: { type: Number, min: 0, default: 0 },
    calcium: { type: Number, min: 0, default: 0 },
    iron: { type: Number, min: 0, default: 0 },
    magnesium: { type: Number, min: 0, default: 0 },
    phosphorus: { type: Number, min: 0, default: 0 },
    potassium: { type: Number, min: 0, default: 0 },
    sodium: { type: Number, min: 0, default: 0 },
    zinc: { type: Number, min: 0, default: 0 }
  },
  
  // Food Items
  foodItems: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      enum: ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'serving']
    },
    calories: {
      type: Number,
      min: 0
    },
    protein: { type: Number, min: 0, default: 0 },
    carbohydrates: { type: Number, min: 0, default: 0 },
    fat: { type: Number, min: 0, default: 0 },
    fiber: { type: Number, min: 0, default: 0 },
    sugar: { type: Number, min: 0, default: 0 }
  }],
  
  // Portion Information
  portionSize: {
    type: Number,
    min: 0
  },
  
  portionUnit: {
    type: String,
    enum: ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'serving']
  },
  
  // Meal Quality and Satisfaction
  satisfaction: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  
  hungerLevel: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  
  fullnessLevel: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  
  // Dietary Compliance
  dietaryCompliance: {
    isVegetarian: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    isGlutenFree: { type: Boolean, default: false },
    isDairyFree: { type: Boolean, default: false },
    isKeto: { type: Boolean, default: false },
    isPaleo: { type: Boolean, default: false }
  },
  
  // Meal Preparation
  preparationTime: {
    type: Number, // in minutes
    min: 0
  },
  
  cookingMethod: {
    type: String,
    enum: ['raw', 'boiled', 'steamed', 'grilled', 'baked', 'fried', 'roasted', 'other']
  },
  
  // Location and Context
  location: {
    type: String,
    enum: ['home', 'restaurant', 'cafeteria', 'office', 'gym', 'other']
  },
  
  // Social Context
  eatenWith: {
    type: String,
    enum: ['alone', 'family', 'friends', 'colleagues', 'partner']
  },
  
  // Notes and Tags
  notes: {
    type: String,
    trim: true
  },
  
  tags: [String],
  
  // Photos
  photos: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Timestamps
  consumedAt: {
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
nutritionSchema.index({ userId: 1, consumedAt: -1 });
nutritionSchema.index({ mealType: 1, consumedAt: -1 });
nutritionSchema.index({ calories: 1 });

// Virtual for total macronutrient calories
nutritionSchema.virtual('totalMacroCalories').get(function() {
  const { protein, carbohydrates, fat } = this.macronutrients;
  return (protein * 4) + (carbohydrates * 4) + (fat * 9);
});

// Virtual for protein percentage
nutritionSchema.virtual('proteinPercentage').get(function() {
  if (this.calories > 0) {
    return ((this.macronutrients.protein * 4) / this.calories) * 100;
  }
  return 0;
});

// Virtual for carbohydrate percentage
nutritionSchema.virtual('carbPercentage').get(function() {
  if (this.calories > 0) {
    return ((this.macronutrients.carbohydrates * 4) / this.calories) * 100;
  }
  return 0;
});

// Virtual for fat percentage
nutritionSchema.virtual('fatPercentage').get(function() {
  if (this.calories > 0) {
    return ((this.macronutrients.fat * 9) / this.calories) * 100;
  }
  return 0;
});

// Method to calculate total calories from food items
nutritionSchema.methods.calculateTotalCalories = function() {
  return this.foodItems.reduce((total, item) => total + (item.calories || 0), 0);
};

// Method to calculate total macronutrients from food items
nutritionSchema.methods.calculateTotalMacros = function() {
  return this.foodItems.reduce((totals, item) => {
    totals.protein += item.protein || 0;
    totals.carbohydrates += item.carbohydrates || 0;
    totals.fat += item.fat || 0;
    totals.fiber += item.fiber || 0;
    totals.sugar += item.sugar || 0;
    return totals;
  }, { protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0 });
};

// Method to get nutrition summary
nutritionSchema.methods.getSummary = function() {
  return {
    id: this._id,
    mealType: this.mealType,
    mealName: this.mealName,
    calories: this.calories,
    macronutrients: this.macronutrients,
    consumedAt: this.consumedAt,
    satisfaction: this.satisfaction
  };
};

// Ensure virtual fields are serialized
nutritionSchema.set('toJSON', { virtuals: true });
nutritionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Nutrition', nutritionSchema); 