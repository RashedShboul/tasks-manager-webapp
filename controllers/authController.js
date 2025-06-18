const User = require("../models/User");
const bcrypt = require("bcrypt");
const validatePassword = require("../utils/validatePassword");
const generateToken = require("../utils/generateToken");
const jwt = require('jsonwebtoken'); 

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, dateOfBirth } = req.body;

    // Validate required fields
    if (!name || !email || !password || !dateOfBirth) {
      return res.status(400).json({
        error: "Name, email, password, and date of birth are required",
      });
    }

    // Check if user exists
    const userExist = await User.findOne({ where: { email } });
    if (userExist) {
      return res.status(409).json({
        error: "User with this email already exists",
      });
    }

    // Validate password
    const passwordErrors = await validatePassword(password);
    if (passwordErrors) {
      return res.status(400).json({
        error: "Password validation failed",
        details: passwordErrors,
      });
    }

    // Hash password and create user
    const hashRounds = 12;
    const hashedPassword = await bcrypt.hash(password, hashRounds);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      dateOfBirth,
    });

    // Prepare response without sensitive data
    const addedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      dateOfBirth: user.dateOfBirth,
      createdAt: user.createdAt,
    };

    const token = generateToken({
      id: user.id,
      email: user.email,
      dateOfBirth: user.dateOfBirth,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV,
      sameSite: "Strict",
      maxAge: 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: addedUser,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Failed to create user",
      message: error.message,
    });
  }
};

exports.logout = async(req, res) => {
    res.clearCookie('token'); 
    res.status(200).json({
        message: 'Logged out successfully'
    }); 
}; 

exports.getCurrentUser = async (req, res) => {
    const token = req.cookies.token; 
    if (!token) {
        return res.status(401).json({
            error: 'Not authenticated'
        }); 
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        const user_id = decoded.id; 
        const user = await User.findOne({where : {id: user_id}}); 
        if (user) {
            const {password, ...safeUser} = user.toJSON(); 
             res.status(200).json({safeUser}); 
        }
    } catch {
         res.status(404).json({
            message: 'User Not Found'
        })
    }
}

