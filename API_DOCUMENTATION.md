# Health Tracker API Documentation

## Overview

The Health Tracker API provides comprehensive endpoints for managing user health data, activities, nutrition, goals, and reminders. The API is built with Node.js, Express, and MongoDB.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the request header:

```
x-auth-token: <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John Doe"
  }
}
```

#### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John Doe",
    "fitnessLevel": "beginner",
    "primaryGoal": "general-fitness"
  }
}
```

#### GET /auth/me
Get current user profile.

**Headers:** `x-auth-token: <token>`

**Response:**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01T00:00:00.000Z",
  "gender": "male",
  "height": 175,
  "weight": 70,
  "bmi": 22.86,
  "fitnessLevel": "beginner",
  "primaryGoal": "general-fitness",
  "targetSteps": 10000,
  "notifications": {
    "mealReminders": true,
    "activityReminders": true
  }
}
```

#### PUT /auth/profile
Update user profile.

**Headers:** `x-auth-token: <token>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "height": 175,
  "weight": 70,
  "fitnessLevel": "intermediate",
  "primaryGoal": "weight-loss",
  "targetSteps": 12000,
  "targetCalories": 2000
}
```

### Activities

#### GET /activities
Get user's activities with pagination and filtering.

**Headers:** `x-auth-token: <token>`

**Query Parameters:**
- `type`: Activity type (running, walking, cycling, etc.)
- `startDate`: Start date filter (ISO string)
- `endDate`: End date filter (ISO string)
- `limit`: Number of items per page (default: 20)
- `page`: Page number (default: 1)
- `sortBy`: Sort field (default: startTime)
- `sortOrder`: Sort order (asc/desc, default: desc)

**Response:**
```json
{
  "activities": [
    {
      "id": "activity-id",
      "type": "running",
      "title": "Morning Run",
      "duration": 45,
      "distance": 5.2,
      "caloriesBurned": 320,
      "startTime": "2024-01-15T06:00:00.000Z",
      "endTime": "2024-01-15T06:45:00.000Z",
      "intensity": "moderate"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

#### POST /activities
Create a new activity.

**Headers:** `x-auth-token: <token>`

**Request Body:**
```json
{
  "type": "running",
  "title": "Morning Run",
  "description": "Great run in the park",
  "duration": 45,
  "distance": 5.2,
  "startTime": "2024-01-15T06:00:00.000Z",
  "endTime": "2024-01-15T06:45:00.000Z",
  "intensity": "moderate",
  "mood": "good",
  "notes": "Felt strong today"
}
```

#### GET /activities/stats/summary
Get activity statistics.

**Headers:** `x-auth-token: <token>`

**Query Parameters:**
- `startDate`: Start date filter
- `endDate`: End date filter

**Response:**
```json
{
  "totalActivities": 25,
  "totalDuration": 1200,
  "totalDistance": 85.5,
  "totalCalories": 4500,
  "averageDuration": 48,
  "byType": {
    "running": {
      "count": 15,
      "totalDuration": 720,
      "totalDistance": 65.2,
      "totalCalories": 2700
    }
  }
}
```

### Nutrition

#### GET /nutrition
Get user's nutrition entries.

**Headers:** `x-auth-token: <token>`

**Query Parameters:**
- `mealType`: Meal type (breakfast, lunch, dinner, snack)
- `startDate`: Start date filter
- `endDate`: End date filter
- `limit`: Items per page
- `page`: Page number

**Response:**
```json
{
  "nutrition": [
    {
      "id": "nutrition-id",
      "mealType": "breakfast",
      "mealName": "Oatmeal with Berries",
      "calories": 320,
      "macronutrients": {
        "protein": 12,
        "carbohydrates": 45,
        "fat": 8
      },
      "consumedAt": "2024-01-15T08:00:00.000Z",
      "satisfaction": 8
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 60,
    "itemsPerPage": 20
  }
}
```

#### POST /nutrition
Log a new meal.

**Headers:** `x-auth-token: <token>`

**Request Body:**
```json
{
  "mealType": "breakfast",
  "mealName": "Oatmeal with Berries",
  "calories": 320,
  "macronutrients": {
    "protein": 12,
    "carbohydrates": 45,
    "fat": 8,
    "fiber": 6,
    "sugar": 15
  },
  "consumedAt": "2024-01-15T08:00:00.000Z",
  "satisfaction": 8,
  "hungerLevel": 7,
  "fullnessLevel": 8
}
```

#### GET /nutrition/stats/daily
Get daily nutrition summary.

**Headers:** `x-auth-token: <token>`

**Query Parameters:**
- `date`: Date in YYYY-MM-DD format (default: today)

**Response:**
```json
{
  "date": "2024-01-15",
  "meals": 3,
  "totalCalories": 1850,
  "totalProtein": 85,
  "totalCarbs": 220,
  "totalFat": 65,
  "averageSatisfaction": 7.5,
  "byMealType": {
    "breakfast": {
      "count": 1,
      "calories": 320,
      "protein": 12,
      "carbs": 45,
      "fat": 8
    }
  }
}
```

### Goals

#### GET /goals
Get user's goals.

**Headers:** `x-auth-token: <token>`

**Query Parameters:**
- `category`: Goal category (weight, fitness, nutrition, etc.)
- `status`: Goal status (active, completed, paused)
- `limit`: Items per page
- `page`: Page number

**Response:**
```json
{
  "goals": [
    {
      "id": "goal-id",
      "title": "Run 5K",
      "category": "fitness",
      "type": "target",
      "direction": "achieve",
      "target": {
        "value": 5,
        "unit": "km",
        "timeframe": "monthly"
      },
      "current": {
        "value": 3.2,
        "lastUpdated": "2024-01-15T10:00:00.000Z"
      },
      "status": "active",
      "progressPercentage": 64
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 8,
    "itemsPerPage": 20
  }
}
```

#### POST /goals
Create a new goal.

**Headers:** `x-auth-token: <token>`

**Request Body:**
```json
{
  "title": "Run 5K",
  "description": "Complete a 5K run",
  "category": "fitness",
  "type": "target",
  "direction": "achieve",
  "target": {
    "value": 5,
    "unit": "km",
    "timeframe": "monthly"
  },
  "fitnessGoal": {
    "activityType": "running",
    "targetDistance": 5,
    "targetDuration": 30
  }
}
```

#### PUT /goals/:id/progress
Update goal progress.

**Headers:** `x-auth-token: <token>`

**Request Body:**
```json
{
  "value": 3.2,
  "notes": "Great progress today!"
}
```

### Reminders

#### GET /reminders
Get user's reminders.

**Headers:** `x-auth-token: <token>`

**Query Parameters:**
- `type`: Reminder type (meal, activity, hydration, sleep)
- `isActive`: Filter by active status (true/false)
- `limit`: Items per page
- `page`: Page number

**Response:**
```json
{
  "reminders": [
    {
      "id": "reminder-id",
      "type": "meal",
      "title": "Lunch Reminder",
      "schedule": {
        "type": "daily",
        "time": "12:00",
        "daysOfWeek": [1, 2, 3, 4, 5]
      },
      "isActive": true,
      "notifications": {
        "push": true,
        "email": false
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 5,
    "itemsPerPage": 20
  }
}
```

#### POST /reminders
Create a new reminder.

**Headers:** `x-auth-token: <token>`

**Request Body:**
```json
{
  "type": "meal",
  "title": "Lunch Reminder",
  "description": "Time to eat lunch",
  "schedule": {
    "type": "daily",
    "time": "12:00",
    "daysOfWeek": [1, 2, 3, 4, 5]
  },
  "mealSettings": {
    "mealType": "lunch",
    "eatingWindow": {
      "start": "12:00",
      "end": "13:00"
    }
  },
  "notifications": {
    "push": true,
    "email": false
  }
}
```

### Community

#### GET /community/forums
Get community forums.

**Response:**
```json
{
  "forums": [
    {
      "id": 1,
      "title": "Running Tips & Advice",
      "description": "Share your running experiences",
      "topics": 45,
      "posts": 234,
      "lastActivity": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

#### GET /community/challenges
Get active challenges.

**Response:**
```json
{
  "challenges": [
    {
      "id": 1,
      "title": "30-Day Running Challenge",
      "description": "Run at least 1 mile every day",
      "participants": 156,
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.000Z",
      "type": "running",
      "reward": "Achievement Badge"
    }
  ]
}
```

### Resources

#### GET /resources/articles
Get educational articles.

**Query Parameters:**
- `category`: Article category (fitness, nutrition, wellness)
- `limit`: Items per page
- `page`: Page number

**Response:**
```json
{
  "articles": [
    {
      "id": 1,
      "title": "The Benefits of Regular Exercise",
      "excerpt": "Learn how regular physical activity...",
      "category": "fitness",
      "author": "Dr. Sarah Johnson",
      "publishDate": "2024-01-15T00:00:00.000Z",
      "readTime": "5 min",
      "image": "https://via.placeholder.com/300x200"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10
  }
}
```

#### GET /resources/recipes
Get healthy recipes.

**Query Parameters:**
- `category`: Recipe category (breakfast, lunch, dinner, snack)
- `difficulty`: Recipe difficulty (easy, medium, hard)
- `limit`: Items per page
- `page`: Page number

**Response:**
```json
{
  "recipes": [
    {
      "id": 1,
      "title": "Quick Overnight Oats",
      "description": "A healthy breakfast option",
      "category": "breakfast",
      "difficulty": "easy",
      "prepTime": "5 min",
      "cookTime": "0 min",
      "servings": 1,
      "calories": 320,
      "protein": 12,
      "carbs": 45,
      "fat": 8,
      "ingredients": [
        "1/2 cup rolled oats",
        "1/2 cup almond milk"
      ],
      "instructions": [
        "Mix oats and almond milk in a jar",
        "Refrigerate overnight"
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 15,
    "itemsPerPage": 10
  }
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per 15 minutes per IP address
- Rate limit headers are included in responses

## Data Validation

All endpoints validate input data and return appropriate error messages for invalid data.

## Security

- JWT tokens for authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Rate limiting

## Development

To run the API in development mode:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

## Testing

Test the API health endpoint:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Health Tracker API is running",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
``` 