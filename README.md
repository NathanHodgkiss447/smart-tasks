# Smart Tasks

A modern, intelligent task management application with drag-and-drop functionality, smart reminders, and a beautiful dark theme UI. Built with React, Node.js, and MongoDB.

## ✨ Features

- **Task Management**: Create, edit, delete, and organize your tasks
- **Smart Filtering**: Filter tasks by status (all, overdue, today, upcoming, completed)
- **Drag & Drop**: Intuitive task reordering with `@dnd-kit`
- **Smart Reminders**: AI-powered suggestions for task due dates
- **Priority Levels**: Low, medium, and high priority tasks with visual indicators
- **Due Date Management**: Track overdue tasks and upcoming deadlines
- **Responsive Design**: Mobile-first responsive UI with CSS modules
- **User Authentication**: Secure JWT-based authentication
- **Real-time Updates**: Dynamic task status updates

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router Dom** - Client-side routing
- **Vite** - Fast build tool and dev server
- **CSS Modules** - Scoped and maintainable styling
- **@dnd-kit** - Modern drag and drop library
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Zod** - Schema validation
- **CORS** - Cross-origin resource sharing

## 📦 Project Structure

```
smart-tasks/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── AppBar.module.css
│   │   │   ├── SmartReminder.jsx
│   │   │   ├── SplashScreen.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskCard.module.css
│   │   │   └── Toolbar.module.css
│   │   ├── pages/          # Page components
│   │   │   ├── App.jsx
│   │   │   ├── Auth.module.css
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── TaskEdit.jsx
│   │   ├── api/
│   │   │   └── http.js     # Axios configuration
│   │   ├── main.jsx        # App entry point
│   │   └── styles.css      # Global styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend API
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   │   ├── Task.js
│   │   │   └── User.js
│   │   ├── routes/         # API routes
│   │   │   ├── auth.routes.js
│   │   │   ├── reminders.routes.js
│   │   │   └── tasks.routes.js
│   │   ├── middleware/
│   │   │   └── requireAuth.js
│   │   ├── validators.js   # Zod validation schemas
│   │   └── index.js        # Server entry point
│   ├── package.json
│   └── docker-compose.yml  # MongoDB container setup
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (or Docker for containerized MongoDB)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd smart-tasks
```

### 2. Backend Setup
```bash
cd server
npm install

# Create environment file
cp .env.example .env
# Edit .env with your MongoDB connection string and JWT secret
```

#### Environment Variables (.env)
```env
MONGO_URI=mongodb://localhost:27017/smart-tasks
JWT_SECRET=your-super-secret-jwt-key
CLIENT_ORIGIN=http://localhost:5173
PORT=4000
```

#### Start MongoDB (using Docker)
```bash
docker-compose up -d
```

#### Start the Backend Server
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```

## 🚀 Running the Application

1. **Start MongoDB**: `docker-compose up -d` (in server directory)
2. **Start Backend**: `npm run dev` (in server directory) - runs on http://localhost:4000
3. **Start Frontend**: `npm run dev` (in client directory) - runs on http://localhost:5173

The application will be available at `http://localhost:5173`

## 📱 Usage

### Getting Started
1. **Sign Up**: Create a new account or login with existing credentials
2. **Dashboard**: View your tasks organized by status filters
3. **Create Tasks**: Click "New Task" to create tasks with title, description, due date, and priority
4. **Manage Tasks**: 
   - Check off completed tasks
   - Drag and drop to reorder tasks
   - Edit or delete tasks as needed
5. **Smart Reminders**: Get intelligent suggestions for task due dates
6. **Filter Tasks**: Use the toolbar to filter by all, overdue, today, upcoming, or completed tasks

### Task Filters
- **All**: View all tasks regardless of status
- **Overdue**: Tasks past their due date
- **Today**: Tasks due today
- **Upcoming**: Tasks scheduled for future dates
- **Completed**: Finished tasks

### Priority Levels
- **High**: Red indicator, urgent tasks
- **Medium**: Yellow indicator, normal priority (default)
- **Low**: Green indicator, low priority tasks

## 🎨 Design Features

- **Dark Theme**: Modern dark UI with gradient backgrounds
- **CSS Modules**: Scoped styling for maintainable code
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Smooth Animations**: Hover effects, transitions, and micro-interactions
- **Accessibility**: Focus indicators, high contrast mode support, reduced motion options

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:
- Tokens are stored in localStorage
- Protected routes redirect to login if not authenticated
- Tokens are included in API requests via Axios interceptors

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Input validation with Zod schemas
- CORS protection
- Secure HTTP headers

## 📊 API Endpoints

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - User login

### Tasks
- `GET /tasks` - Get user's tasks (with optional status filter)
- `POST /tasks` - Create new task
- `GET /tasks/:id` - Get specific task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### Reminders
- `GET /reminders/summary` - Get task summary with smart suggestions

## 🏗️ Development

### Building for Production
```bash
# Frontend
cd client
npm run build

# Backend
cd server
npm start
```

### Code Style
- ES6+ JavaScript/JSX
- CSS Modules for component styling
- Functional components with React hooks
- RESTful API design
- MongoDB with Mongoose ODM

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **Frontend Build Issues**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

3. **CORS Errors**
   - Verify CLIENT_ORIGIN in server `.env` matches frontend URL
   - Check CORS middleware configuration

4. **Authentication Issues**
   - Clear localStorage and re-login
   - Verify JWT_SECRET is set in server environment

### Performance Tips
- Use production builds for deployment
- Consider implementing pagination for large task lists
- Add database indexing for better query performance
- Implement caching strategies for frequently accessed data

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed information about the problem

---

**Happy Task Managing! ✅**