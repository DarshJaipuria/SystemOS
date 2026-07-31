# SystemOS API Documentation

All API endpoints are versioned under the `/api/v1/` prefix.

---

## 🔒 Authentication Routes

### 1. Register User
* **Endpoint**: `POST /api/v1/auth/register`
* **Description**: Create a new account and establish session cookie.
* **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "name": "Alex Watson"
  }
  ```
* **Success Response (200)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "name": "Alex Watson"
    }
  }
  ```

### 2. Login User
* **Endpoint**: `POST /api/v1/auth/login`
* **Description**: Validate credentials and set session cookie.
* **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "rememberMe": true
  }
  ```
* **Success Response (200)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "name": "Alex Watson"
    }
  }
  ```

### 3. Logout User
* **Endpoint**: `POST /api/v1/auth/logout`
* **Description**: Clear the authentication cookie.
* **Success Response (200)**:
  ```json
  {
    "success": true
  }
  ```

### 4. Verify Session (Me)
* **Endpoint**: `GET /api/v1/auth/me`
* **Description**: Return user details for the active session cookie.
* **Success Response (200)**:
  ```json
  {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "name": "Alex Watson"
    }
  }
  ```

---

## 📅 Daily Habits & Rollovers

### 5. Get Monthly Habits View
* **Endpoint**: `GET /api/v1/habits`
* **Description**: Fetch all daily, weekly, monthly habits, reflections, and rollover availability.
* **Query Parameters**:
  * `month` (1-12)
  * `year` (YYYY)
* **Success Response (200)**:
  ```json
  {
    "habits": [
      {
        "id": "uuid",
        "name": "Read Book",
        "goalDays": 20,
        "completions": [{ "date": "2026-06-25" }]
      }
    ],
    "weeklyHabits": [],
    "monthlyHabits": [],
    "reflection": null,
    "hasPrevMonthHabits": false,
    "prevMonthDetails": { "month": 5, "year": 2026 }
  }
  ```

### 6. Create Daily Habit
* **Endpoint**: `POST /api/v1/habits`
* **Description**: Create a new daily tracker habit.
* **Request Body**:
  ```json
  {
    "name": "Workout",
    "goalDays": 30,
    "month": 6,
    "year": 2026
  }
  ```
* **Success Response (200)**: Habit object.

### 7. Update Daily Habit
* **Endpoint**: `PUT /api/v1/habits/:id`
* **Description**: Rename or adjust goal days for a habit.
* **Request Body**:
  ```json
  {
    "name": "Gym Routine",
    "goalDays": 25
  }
  ```

### 8. Delete Daily Habit
* **Endpoint**: `DELETE /api/v1/habits/:id`
* **Description**: Delete habit and all completions history cascade.

### 9. Import Previous Habits (Rollover)
* **Endpoint**: `POST /api/v1/habits/import`
* **Request Body**:
  ```json
  {
    "month": 6,
    "year": 2026,
    "prevMonth": 5,
    "prevYear": 2026
  }
  ```

---

## ✅ Checklists & Reflections

### 10. Toggle Daily Completion Checkmark
* **Endpoint**: `POST /api/v1/completions/toggle`
* **Request Body**:
  ```json
  {
    "habitId": "uuid",
    "date": "2026-06-28",
    "completed": true
  }
  ```

### 11. Create/Update Reflections
* **Endpoint**: `POST /api/v1/reflection`
* **Request Body**:
  ```json
  {
    "month": 6,
    "year": 2026,
    "text": "Great month",
    "affirmation": "I am persistent",
    "polaroidUrl": "https://images.unsplash.com/..."
  }
  ```

---

## 🎁 Gamified Rewards

### 12. Get Reward Templates
* **Endpoint**: `GET /api/v1/rewards`
* **Query Parameters**: `month`, `year`
* **Response (200)**: `{ rewards: [], claimedRewards: [] }`

### 13. Set Reward Options
* **Endpoint**: `POST /api/v1/rewards`
* **Request Body**:
  ```json
  {
    "month": 6,
    "year": 2026,
    "rewards": ["Treat Meal", "Buy book"]
  }
  ```

### 14. Claim Rewards
* **Endpoint**: `POST /api/v1/rewards/claim`
* **Request Body**:
  ```json
  {
    "date": "2026-06-28",
    "claimedRewardIds": ["reward-uuid-1"]
  }
  ```
