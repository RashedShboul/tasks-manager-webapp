const User = require("../models/User");
const bcrypt = require("bcrypt");
const validatePassword = require("../utils/validatePassword");
const jwt = require("jsonwebtoken");

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
    const addedUser = user.toJSON(); 
	delete addedUser.password; 
    //access token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1m" }
    );
    //refresh token
    const refreshToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "1d" }
    );

    //set access token
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV,
      sameSite: "Strict",
      maxAge: 60 * 1000,
    });
    //set refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV,
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
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

exports.logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    message: "Logged out successfully",
  });
};

exports.getCurrentUser = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      error: "Not authenticated",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.id;
    const user = await User.findOne({ where: { id: user_id } });
    if (user) {
      const { password, ...safeUser } = user.toJSON();
      res.status(200).json({ safeUser });
    }
  } catch {
    res.status(404).json({
      message: "User Not Found",
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      error: "Email and password required",
    });
  }
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    const userData = user.toJSON();
    delete userData.password;
    if (isMatch) {
      return res.status(200).json({
        message: "Loged in successfully",
        user: userData,
      });
    } else {
      return res.status(401).json({
        message: "Unauthorized, worng password",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Failed to create user",
      message: error.message,
    });
  }
};

/* 
On receiving 401 Unauthorized :
The frontend automatically sends a request to /refresh with the refresh token.
If the refresh token is valid:
Server returns a new access token (and a new refresh token).
Then the frontend retries the original request with the new token.
*/
exports.refresh = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "No token" });
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        dateOfBirth: payload.dateOfBirth,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1m" }
    );
    const newRefreshToken = jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        dateOfBirth: payload.dateOfBirth,
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "1d" }
    );
    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV,
      sameSite: "Strict",
      maxAge: 60 * 1000,
    });
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV,
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: "Token refreshed" });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token", error: error });
  }
};
