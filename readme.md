# 🚀 LeetCode Platform - Problem Solving & Learning Hub

## 📚 Description

LeetCode Platform is a comprehensive coding challenge platform that provides users with an interactive environment to solve algorithmic problems, track their progress, and enhance their coding skills. This platform combines the best features of coding platforms with AI-powered assistance and video tutorial integration.

**Key Benefits:**

- 🎯 Structured coding challenges with multiple difficulty levels
- 🤖 AI-powered doubt resolution and learning assistance
- 📹 Integrated video tutorial system for better learning
- 📊 Comprehensive progress tracking and user statistics
- 🔐 Secure authentication with role-based access control
- ⚡ High-performance caching with Redis for optimal user experience

## 🛠️ Tech Stack

### Backend Technologies

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Cache:** Redis
- **Authentication:** JWT + Express Sessions
- **File Storage:** Cloudinary (for video content)
- **Rate Limiting:** Express Rate Limit + Redis
- **AI Integration:** Google Generative AI (@google/genai)

### Development Tools

- **Script Runner:** Nodemon (development)
- **Environment Management:** dotenv
- **Input Validation:** validator.js
- **Security:** bcrypt, cors, cookie-parser

## ✨ Features

### 👥 User Management

- ✅ **User Registration & Login:** Secure authentication system
- 👤 **Profile Management:** Complete user profile CRUD operations
- 🔐 **Role-based Access:** Admin and regular user roles
- 📊 **User Statistics:** Track solved problems and performance metrics

### 🧩 Problem Management

- 📝 **Problem Creation:** Admin can create coding challenges
- 🏷️ **Categorized Problems:** Easy, Medium, Hard difficulty levels
- 🏷️ **Tagged Content:** Array, LinkedList, DP, Graph, String, Stack, Queue, Heap, Tree
- 🧪 **Test Cases:** Visible and hidden test cases for comprehensive evaluation
- 💻 **Multi-language Support:** Initial code templates and reference solutions

### 🔄 Code Execution & Submission

- ▶️ **Code Running:** Test your code against visible test cases
- ✍️ **Code Submission:** Submit solutions for evaluation
- 📈 **Execution Results:** Detailed feedback on submission performance
- ⚡ **Rate Limiting:** Prevents abuse with intelligent submission throttling

### 🤖 AI-Powered Learning

- 🧠 **Doubt Resolution:** AI chatbot for instant problem-solving assistance
- 💡 **Learning Guidance:** Contextual help for algorithmic challenges
- 🔍 **Smart Responses:** Google Generative AI integration for accurate solutions

### 🎥 Video Tutorial System

- 📹 **Video Content:** Upload and manage educational video content
- 🔗 **Problem Integration:** Link videos to specific coding problems
- ☁️ **Cloud Storage:** Secure video hosting with Cloudinary
- 🗑️ **Content Management:** Admin controls for video content lifecycle

### 🔒 Security & Performance

- 🛡️ **JWT Authentication:** Secure token-based authentication
- 🍪 **Session Management:** Express sessions with secure cookie handling
- 🚫 **CORS Protection:** Cross-origin request security
- ⚡ **Redis Caching:** Enhanced performance with intelligent caching
- 🚦 **Rate Limiting:** Prevents API abuse and ensures fair usage

## 🚀 Installation Guide

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Redis server
- npm or yarn package manager

### Step-by-Step Setup

1. **Clone the Repository**

   ```bash
   git clone <your-repository-url>
   cd Leetcode✅
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:

   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/leetcode-platform
   REDIS_URL=redis://localhost:6379

   # Server Configuration
   PORT=5000
   SESSION_SECRET=your-super-secret-session-key

   # JWT Configuration
   JWT_SECRET=your-jwt-secret-key

   # AI Configuration
   GOOGLE_AI_API_KEY=your-google-ai-api-key

   # Cloudinary Configuration (for video uploads)
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret
   ```

4. **Start Development Server**

   ```bash
   npm run dev
   ```

5. **Verify Installation**
   Visit `http://localhost:5000/test` to confirm the backend is running successfully.

## 📖 Usage

### Starting the Application

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### Basic API Usage

1. **Register a new user:**

   ```bash
   curl -X POST http://localhost:5000/user/register \
     -H "Content-Type: application/json" \
     -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"password123"}'
   ```

2. **Login:**

   ```bash
   curl -X POST http://localhost:5000/user/login \
     -H "Content-Type: application/json" \
     -d '{"email":"john@example.com","password":"password123"}'
   ```

3. **Get all problems:**
   ```bash
   curl -X GET http://localhost:5000/problem/getAllProblem \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

**📸 Screenshot Placeholder:** _Add application screenshots here_

## 📁 Folder Structure

```
Leetcode✅/
├── src/                          # Source code
│   ├── controller/               # Route controllers
│   │   ├── ai.controller.js      # AI chatbot functionality
│   │   ├── problem.controller.js # Problem management
│   │   ├── submission.controller.js # Code execution & submission
│   │   ├── user.controller.js    # User authentication & management
│   │   └── video.controller.js   # Video content management
│   ├── middleware/               # Custom middleware
│   │   ├── adminMiddleware.js    # Admin role verification
│   │   ├── redisRateLimiter.js   # Request rate limiting
│   │   └── userMiddleware.js     # User authentication
│   ├── model/                    # Database models
│   │   ├── problem.js           # Problem schema
│   │   ├── solutionVideo.js      # Video metadata schema
│   │   ├── submission.js         # Submission schema
│   │   └── user.js              # User schema
│   ├── routes/                   # API route definitions
│   │   ├── ai.js                # AI chatbot routes
│   │   ├── problemCreator.js     # Problem CRUD routes
│   │   ├── submission.js         # Code execution routes
│   │   ├── userAuth.js           # Authentication routes
│   │   └── videoCreator.js      # Video management routes
│   ├── config/                   # Configuration files
│   │   ├── db.js                # MongoDB connection
│   │   └── redis.js             # Redis connection
│   ├── utils/                    # Utility functions
│   │   ├── problemUtility.js     # Problem-specific utilities
│   │   └── validator.js          # Input validation utilities
│   └── index.js                  # Application entry point
├── node_modules/                 # Dependencies
├── package.json                  # Project configuration
├── package-lock.json            # Dependency lock file
└── README.md                    # Project documentation
```

## 🔗 API Endpoints

### Authentication (`/user`)

| Method | Endpoint               | Description         | Auth Required |
| ------ | ---------------------- | ------------------- | ------------- |
| POST   | `/user/register`       | Register a new user | No            |
| POST   | `/user/login`          | User login          | No            |
| POST   | `/user/logout`         | User logout         | Yes           |
| GET    | `/user/check`          | Verify user session | Yes           |
| GET    | `/user/getProfile`     | Get user profile    | Yes           |
| PUT    | `/user/updateProfile`  | Update user profile | Yes           |
| DELETE | `/user/deleteProfile`  | Delete user account | Yes           |
| POST   | `/user/admin/register` | Admin registration  | Admin         |

### Problem Management (`/problem`)

| Method | Endpoint                         | Description                | Auth Required |
| ------ | -------------------------------- | -------------------------- | ------------- |
| POST   | `/problem/create`                | Create new problem         | Admin         |
| PUT    | `/problem/update/:id`            | Update problem             | Admin         |
| DELETE | `/problem/delete/:id`            | Delete problem             | Admin         |
| GET    | `/problem/getProblem/:id`        | Get problem by ID          | Yes           |
| GET    | `/problem/getAllProblem`         | Get all problems           | Yes           |
| GET    | `/problem/userProblem`           | Get user's solved problems | Yes           |
| GET    | `/problem/submittedProblem/:pid` | Get submission history     | Yes           |
| GET    | `/problem/userStats`             | Get user statistics        | Yes           |

### Code Submission (`/submission`)

| Method | Endpoint                 | Description                         | Auth Required |
| ------ | ------------------------ | ----------------------------------- | ------------- |
| POST   | `/submission/run/:id`    | Run code against visible test cases | Yes           |
| POST   | `/submission/submit/:id` | Submit code for evaluation          | Yes           |

### AI Assistant (`/ai`)

| Method | Endpoint   | Description                       | Auth Required |
| ------ | ---------- | --------------------------------- | ------------- |
| POST   | `/ai/chat` | Chat with AI for doubt resolution | Yes           |

### Video Management (`/video`)

| Method | Endpoint                 | Description               | Auth Required |
| ------ | ------------------------ | ------------------------- | ------------- |
| GET    | `/video/create/:id`      | Generate upload signature | Admin         |
| POST   | `/video/save`            | Save video metadata       | Admin         |
| DELETE | `/video/delete/:videoId` | Delete video content      | Admin         |

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with descriptive messages: `git commit -m 'Add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Development Guidelines

- 📝 Follow existing code style and conventions
- 🧪 Write tests for new features
- 📚 Update documentation for API changes
- 🔍 Test your changes locally before submitting
- 💡 Ensure backward compatibility for existing APIs

### Code Standards

- Use ESLint for code formatting
- Write descriptive commit messages
- Add JSDoc comments for new functions
- Follow RESTful API design principles

## 👨‍💻 Contact / Author

**Developer:** Vipul Kumar  
**Email:** vipulvipul65845@gmail.com

### Connect with me:

- 🐙 **GitHub:** [@vipulkumar](https://github.com/vipul752)
- 💼 **LinkedIn:** [linkedin.com/in/vipulkumar](https://www.linkedin.com/in/vipul-kumar-990904282/)
- 🌐 **Portfolio:** [vipulkumar.dev](https://vipul752.github.io/portfolio/)
- 📧 **Email:** vipulvipul65845@gmail.com

---

⭐ **Star this repository if you found it helpful!**

---

_Built with ❤️ for the coding community_
