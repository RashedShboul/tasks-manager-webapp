require("dotenv").config();
const express = require("express");
const morgan = require('morgan'); 
const cookieParser = require('cookie-parser'); 
const sequelize = require('./config/db');

// import routes
// const authRoutes = require('./routes/authRoutes'); 
 const tasksRoutes = require('./routes/tasksRoutes'); 

const app = express();

// Connect to database
const connectDB = async () => {
  try {
    await sequelize.sync();
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1); // Exit with failure
  }
};

// Initialize database connection
connectDB();

app.use(morgan('short')); 

app.use(express.static('public')); // This line serves static files (like HTML, CSS, images) from a directory named 'public'.
app.use(express.json()); 
app.use(cookieParser()); 

// Temporary root route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Task Manager API is running!' });
});

// Routes will be uncommented once we create them
// app.use('/api/v0/auth', authRoutes);
 app.use('/api/v0/tasks', tasksRoutes);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});