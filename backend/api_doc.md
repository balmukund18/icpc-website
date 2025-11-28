# ACM ICPC USICT Portal API Documentation

**Base URL**: `http://localhost:5000/api`  
**Version**: 1.0.0  
**Authentication**: JWT Bearer Token

---

## Table of Contents

1. [Authentication](#authentication)
2. [Profile Management](#profile-management)
3. [Task Management](#task-management)
4. [Contest Management](#contest-management)
5. [Judge0 Integration](#judge0-integration)
6. [Sessions & Workshops](#sessions--workshops)
7. [Blog Management](#blog-management)
8. [Announcements](#announcements)
9. [Alumni](#alumni)
10. [Gamification](#gamification)
11. [AI Chatbot](#ai-chatbot)
12. [Error Responses](#error-responses)

---

## Authentication

### Register User

**POST** `/auth/register`

Create a new user account.

**Request Body**:
```json
{
  "email": "student@example.com",
  "password": "securepassword123",
  "role": "STUDENT"
}
```

**Field Details**:
- `email` (string, required): Valid email address
- `password` (string, required): Minimum 8 characters
- `role` (string, optional): One of `STUDENT`, `ADMIN`, `ALUMNI` (default: `STUDENT`)

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "clx123abc456",
    "email": "student@example.com"
  }
}
```

**Note**: New accounts require admin approval before login.

---

### Login

**POST** `/auth/login`

Authenticate and receive JWT token.

**Request Body**:
```json
{
  "email": "student@example.com",
  "password": "securepassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clx123abc456",
      "email": "student@example.com",
      "role": "STUDENT"
    }
  }
}
```

**Token Usage**: Include in subsequent requests as:
```
Authorization: Bearer <token>
```

---

### Approve User (Admin Only)

**POST** `/auth/approve/:id`

Approve a pending user registration.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "clx123abc456",
    "approved": true
  }
}
```

---

## Profile Management

### Create/Update Profile

**POST** `/profile`

Create or update user profile information.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "John Doe",
  "branch": "CSE",
  "year": 3,
  "contact": "+91-9876543210",
  "handles": {
    "leetcode": "johndoe",
    "codeforces": "john_coder",
    "github": "johndoe"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "profile123",
    "userId": "clx123abc456",
    "name": "John Doe",
    "branch": "CSE",
    "year": 3,
    "contact": "+91-9876543210",
    "handles": {
      "leetcode": "johndoe",
      "codeforces": "john_coder",
      "github": "johndoe"
    }
  }
}
```

---

### Get Profile

**GET** `/profile`

Retrieve current user's profile.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "profile123",
    "userId": "clx123abc456",
    "name": "John Doe",
    "branch": "CSE",
    "year": 3,
    "contact": "+91-9876543210",
    "handles": {
      "leetcode": "johndoe",
      "codeforces": "john_coder"
    }
  }
}
```

---

## Task Management

### Create Task (Admin Only)

**POST** `/tasks`

Create a new DSA task/problem assignment.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Request Body**:
```json
{
  "title": "Two Sum Problem",
  "description": "Solve the Two Sum problem on LeetCode",
  "points": 10,
  "dueDate": "2025-12-31T23:59:59Z"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "task123",
    "title": "Two Sum Problem",
    "description": "Solve the Two Sum problem on LeetCode",
    "points": 10,
    "dueDate": "2025-12-31T23:59:59.000Z",
    "createdAt": "2025-11-28T10:00:00.000Z"
  }
}
```

---

### Assign Task (Admin Only)

**POST** `/tasks/:taskId/assign`

Assign a task to a specific user.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Request Body**:
```json
{
  "userId": "clx123abc456"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "task123",
    "assignedTo": "clx123abc456"
  }
}
```

---

### Submit Task

**POST** `/tasks/:taskId/submit`

Submit a task completion link.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "link": "https://leetcode.com/submissions/detail/123456/"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "submission123",
    "taskId": "task123",
    "userId": "clx123abc456",
    "link": "https://leetcode.com/submissions/detail/123456/",
    "verified": true,
    "points": 10,
    "createdAt": "2025-11-28T10:30:00.000Z"
  }
}
```

---

## Contest Management

### Create Contest (Admin Only)

**POST** `/contests`

Create a new programming contest.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Request Body**:
```json
{
  "title": "Weekly Contest #1",
  "timer": 7200,
  "problems": []
}
```

**Field Details**:
- `title` (string, required): Contest name
- `timer` (number, optional): Duration in seconds
- `problems` (array, optional): Array of problem objects

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "contest123",
    "title": "Weekly Contest #1",
    "timer": 7200,
    "problems": [],
    "createdAt": "2025-11-28T10:00:00.000Z"
  }
}
```

---

### Add Problem to Contest (Admin Only)

**POST** `/contests/:id/problems`

Add a problem to an existing contest.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Request Body**:
```json
{
  "name": "Problem A",
  "description": "Given an array...",
  "testCases": [
    {
      "input": "1 2 3",
      "output": "6"
    }
  ]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "contest123",
    "problems": [
      {
        "name": "Problem A",
        "description": "Given an array...",
        "testCases": [...]
      }
    ]
  }
}
```

---

### List Contests

**GET** `/contests`

Get all contests (public endpoint).

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "contest123",
      "title": "Weekly Contest #1",
      "timer": 7200,
      "createdAt": "2025-11-28T10:00:00.000Z"
    }
  ]
}
```

---

### Submit Contest Solution

**POST** `/contests/:id/submit`

Submit code for a contest problem.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "problemIdx": 0,
  "source": "#include <iostream>\nint main() { std::cout << \"Hello\"; }",
  "language_id": 53
}
```

**Field Details**:
- `problemIdx` (number, required): Problem index (0-based)
- `source` (string, required): Source code
- `language_id` (number, required): Judge0 language ID (e.g., 53 for C++, 71 for Python)

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "submission123",
    "contestId": "contest123",
    "problemIdx": 0,
    "userId": "clx123abc456",
    "token": "judge0-token-abc123",
    "status": "PENDING",
    "createdAt": "2025-11-28T10:30:00.000Z"
  }
}
```

---

### Get Contest Submissions (Admin Only)

**GET** `/contests/:id/submissions`

List all submissions for a contest.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "submission123",
      "contestId": "contest123",
      "problemIdx": 0,
      "userId": "clx123abc456",
      "status": "Accepted",
      "createdAt": "2025-11-28T10:30:00.000Z"
    }
  ]
}
```

---

### Get My Submissions

**GET** `/contests/submissions/me`

Get current user's contest submissions.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "submission123",
      "contestId": "contest123",
      "problemIdx": 0,
      "status": "Accepted",
      "result": {
        "status": {
          "id": 3,
          "description": "Accepted"
        },
        "stdout": "Hello",
        "time": "0.02",
        "memory": 1024
      }
    }
  ]
}
```

---

### Get Single Submission

**GET** `/contests/submissions/:submissionId`

Get details of a specific submission (owner or admin only).

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "submission123",
    "contestId": "contest123",
    "problemIdx": 0,
    "userId": "clx123abc456",
    "token": "judge0-token-abc123",
    "status": "Accepted",
    "result": {
      "status": {
        "id": 3,
        "description": "Accepted"
      },
      "stdout": "Hello World",
      "stderr": null,
      "time": "0.02",
      "memory": 1024
    },
    "createdAt": "2025-11-28T10:30:00.000Z"
  }
}
```

---

### Save Contest Results (Admin Only)

**POST** `/contests/:id/results`

Save final results for a contest.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Request Body**:
```json
[
  {
    "userId": "clx123abc456",
    "score": 100,
    "rank": 1
  }
]
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "contest123",
    "results": [...]
  }
}
```

---

### Get Contest History

**GET** `/contests/history/me`

Get user's contest participation history.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "contest123",
      "title": "Weekly Contest #1",
      "results": [
        {
          "userId": "clx123abc456",
          "score": 100,
          "rank": 1
        }
      ]
    }
  ]
}
```

---

## Judge0 Integration

### Submit Code

**POST** `/judge/submit`

Submit code directly to Judge0 for execution.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "source": "print('Hello World')",
  "language_id": 71,
  "stdin": ""
}
```

**Common Language IDs**:
- `50` - C (GCC)
- `53` - C++ (GCC)
- `62` - Java
- `71` - Python 3
- `63` - JavaScript (Node.js)
- `78` - Kotlin

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "token": "judge0-token-abc123",
    "raw": {
      "token": "judge0-token-abc123"
    }
  }
}
```

---

### Get Execution Result

**GET** `/judge/result/:token`

Get the result of a code execution.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "raw": {
      "status": {
        "id": 3,
        "description": "Accepted"
      },
      "stdout": "Hello World\n",
      "stderr": null,
      "time": "0.02",
      "memory": 1024
    },
    "status": {
      "id": 3,
      "description": "Accepted"
    },
    "stdout": "Hello World\n",
    "stderr": null,
    "time": "0.02",
    "memory": 1024
  }
}
```

**Status IDs**:
- `1` - In Queue
- `2` - Processing
- `3` - Accepted
- `4` - Wrong Answer
- `5` - Time Limit Exceeded
- `6` - Compilation Error
- `11` - Runtime Error

---

## Sessions & Workshops

### Create Session (Admin Only)

**POST** `/sessions`

Create a new workshop or session.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Request Body**:
```json
{
  "title": "DSA Workshop",
  "details": "Introduction to Dynamic Programming",
  "date": "2025-12-01T18:00:00Z"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "session123",
    "title": "DSA Workshop",
    "details": "Introduction to Dynamic Programming",
    "date": "2025-12-01T18:00:00.000Z",
    "attendees": [],
    "createdAt": "2025-11-28T10:00:00.000Z"
  }
}
```

---

### Update Session (Admin Only)

**PUT** `/sessions/:id`

Update session details.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Request Body**:
```json
{
  "summary": "Covered DP basics and solved 5 problems"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "session123",
    "summary": "Covered DP basics and solved 5 problems"
  }
}
```

---

### Delete Session (Admin Only)

**DELETE** `/sessions/:id`

Delete a session.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "session123"
  }
}
```

---

### List Sessions

**GET** `/sessions`

Get all sessions (public endpoint).

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "session123",
      "title": "DSA Workshop",
      "date": "2025-12-01T18:00:00.000Z",
      "attendees": ["clx123abc456"]
    }
  ]
}
```

---

### Register for Session

**POST** `/sessions/:id/register`

Register for a session.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "session123",
    "attendees": ["clx123abc456"]
  }
}
```

---

### Mark Attendance (Admin Only)

**POST** `/sessions/:id/attendance`

Mark attendance for a session.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Request Body**:
```json
{
  "userId": "clx123abc456",
  "present": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "session123",
    "attendees": [
      {
        "userId": "clx123abc456",
        "present": true
      }
    ]
  }
}
```

---

## Blog Management

### Create Blog

**POST** `/blogs`

Submit a blog post for approval.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "title": "My ICPC Journey",
  "content": "This is my experience participating in ICPC..."
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "blog123",
    "authorId": "clx123abc456",
    "title": "My ICPC Journey",
    "content": "This is my experience...",
    "approved": false,
    "comments": [],
    "createdAt": "2025-11-28T10:00:00.000Z"
  }
}
```

---

### List Pending Blogs (Admin Only)

**GET** `/blogs/pending`

Get all pending blog posts.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "blog123",
      "authorId": "clx123abc456",
      "title": "My ICPC Journey",
      "approved": false
    }
  ]
}
```

---

### Approve Blog (Admin Only)

**POST** `/blogs/approve/:id`

Approve a pending blog post.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "blog123",
    "approved": true
  }
}
```

---

### Add Comment

**POST** `/blogs/:id/comments`

Add a comment to a blog post.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "comment": "Great post! Very helpful."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "blog123",
    "comments": [
      {
        "id": "c_1234567890",
        "userId": "clx123abc456",
        "comment": "Great post! Very helpful.",
        "approved": false,
        "createdAt": "2025-11-28T10:30:00.000Z"
      }
    ]
  }
}
```

---

### Approve Comment (Admin Only)

**POST** `/blogs/:id/comments/approve/:commentId`

Approve a pending comment.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "blog123",
    "comments": [
      {
        "id": "c_1234567890",
        "approved": true
      }
    ]
  }
}
```

---

## Announcements

### Create Announcement (Admin Only)

**POST** `/announcements`

Post a new announcement.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Request Body**:
```json
{
  "title": "Contest Tomorrow!",
  "details": "Don't forget to register for tomorrow's contest"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "announcement123",
    "title": "Contest Tomorrow!",
    "details": "Don't forget to register...",
    "createdAt": "2025-11-28T10:00:00.000Z"
  }
}
```

---

### List Announcements

**GET** `/announcements`

Get all announcements (public endpoint).

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "announcement123",
      "title": "Contest Tomorrow!",
      "details": "Don't forget to register...",
      "createdAt": "2025-11-28T10:00:00.000Z"
    }
  ]
}
```

---

## Alumni

### Register Alumni

**POST** `/alumni/register`

Register as an alumni user.

**Request Body**:
```json
{
  "email": "alumni@example.com",
  "password": "securepassword123",
  "name": "Jane Doe",
  "batch": "2020",
  "company": "Google"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "alum123",
    "email": "alumni@example.com",
    "role": "ALUMNI",
    "approved": false
  }
}
```

---

### List Alumni

**GET** `/alumni`

Get all approved alumni.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "alum123",
      "email": "alumni@example.com",
      "role": "ALUMNI",
      "approved": true
    }
  ]
}
```

---

## Gamification

### Get Leaderboard

**GET** `/gamification/leaderboard`

Get the points leaderboard.

**Query Parameters**:
- `period` (optional): `month`, `semester`, or `all` (default: `all`)

**Example**: `/gamification/leaderboard?period=month`

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "position": 1,
      "userId": "clx123abc456",
      "email": "student@example.com",
      "name": "John Doe",
      "points": 150
    },
    {
      "position": 2,
      "userId": "clx789def012",
      "email": "student2@example.com",
      "name": "Jane Smith",
      "points": 120
    }
  ]
}
```

---

### List Badges

**GET** `/gamification/badges`

Get all available badges and their requirements.

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "first_submit",
      "title": "First Submission",
      "description": "Awarded for making your first verified submission",
      "rule": {
        "type": "submission_count",
        "min": 1
      }
    },
    {
      "id": "consistent_week",
      "title": "1-Week Streak",
      "description": "Complete at least one verified submission each day for 7 consecutive days",
      "rule": {
        "type": "streak_days",
        "days": 7
      }
    }
  ]
}
```

---

### Get My Badges

**GET** `/gamification/my-badges`

Get badges earned by current user.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "first_submit",
      "title": "First Submission",
      "description": "Awarded for making your first verified submission"
    }
  ]
}
```

---

## AI Chatbot

### Chat with AI

**POST** `/ai/chat`

Ask the AI assistant for help.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "prompt": "Explain dynamic programming in simple terms"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "reply": "Dynamic programming is a method for solving complex problems..."
  }
}
```

**Note**: Requires `OPENAI_API_KEY` to be configured.

---

## Error Responses

### Standard Error Format

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Error Examples

**Validation Error (422)**:
```json
{
  "success": false,
  "error": {
    "errors": [
      {
        "msg": "Valid email required",
        "param": "email",
        "location": "body"
      }
    ]
  }
}
```

**Unauthorized (401)**:
```json
{
  "success": false,
  "error": "No token provided"
}
```

**Forbidden (403)**:
```json
{
  "success": false,
  "error": "Admin only"
}
```

**Rate Limit (429)**:
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later."
}
```

---

## Rate Limits

| Endpoint Type | Requests | Window |
|---------------|----------|--------|
| General API | 200 | 15 minutes |
| Authentication | 10 | 15 minutes |

---

## Health & Status Endpoints

### Health Check

**GET** `/health`

Check API health status.

**Response** (200 OK):
```json
{
  "status": "OK",
  "timestamp": "2025-11-28T10:00:00.000Z"
}
```

---

### Readiness Check

**GET** `/ready`

Check if API and database are ready.

**Response** (200 OK):
```json
{
  "ready": true,
  "checks": {
    "database": true,
    "timestamp": "2025-11-28T10:00:00.000Z"
  }
}
```

**Unhealthy Response** (503 Service Unavailable):
```json
{
  "ready": false,
  "checks": {
    "database": false,
    "timestamp": "2025-11-28T10:00:00.000Z"
  },
  "error": "Database unavailable"
}
```

---

## Swagger UI

Interactive API documentation is available at:

**URL**: `http://localhost:5000/api/docs/ui`

---

## Testing with cURL

### Example: Register and Login Flow

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 2. Admin approves (replace USER_ID and ADMIN_TOKEN)
curl -X POST http://localhost:5000/api/auth/approve/USER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 3. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 4. Create profile (replace TOKEN)
curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","branch":"CSE","year":3,"contact":"1234567890"}'
```

---

## Postman Collection

Import the provided `postman_collection.json` file located in the backend directory for ready-to-use API requests.

---

## Support

For issues or questions:
- Check the [README.md](../README.md)
- Review the [STRUCTURE.md](../STRUCTURE.md) for codebase navigation
- Open an issue in the repository

**Version**: 1.0.0  
**Last Updated**: November 28, 2025