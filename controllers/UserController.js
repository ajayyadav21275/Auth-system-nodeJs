const { pool } = require("../connection/db");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

// ================= REGISTER =================
const registerUser = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query =
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email";

    const result = await pool.query(query, [email, hashedPassword]);

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }

    res.status(500).json({
      error: "Registration failed",
      details: err.message,
    });
  }
};

// ================= LOGIN =================
const loginUser = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ACCESS TOKEN
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    // REFRESH TOKEN
    const refreshToken = jwt.sign(
      { id: user.id },
      REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // STORE REFRESH TOKEN IN DB
    await pool.query(
      "UPDATE users SET refresh_token = $1 WHERE id = $2",
      [refreshToken, user.id]
    );

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email },
    });

  } catch (err) {
    res.status(500).json({
      error: "Login failed",
      details: err.message,
    });
  }
};

// ================= REFRESH TOKEN =================
const refreshTokenHandler = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND refresh_token = $2",
      [decoded.id, refreshToken]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });

  } catch (err) {
    res.status(403).json({
      error: "Token expired or invalid",
      details: err.message,
    });
  }
};

// ================= PROFILE =================
const getUserProfile = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: result.rows[0] });

  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch profile",
      details: err.message,
    });
  }
};

// ================= LOGOUT =================
const logoutUser = async (req, res) => {
  const { userId } = req.body;

  await pool.query(
    "UPDATE users SET refresh_token = NULL WHERE id = $1",
    [userId]
  );

  res.json({ message: "Logged out successfully" });
};

module.exports = {registerUser,loginUser,refreshTokenHandler,
  getUserProfile,logoutUser,};