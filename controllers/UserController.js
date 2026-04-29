const { pool } = require("../connection/db");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// REGISTER
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

// LOGIN - JWT Token generate karta hai
const loginUser = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // JWT Token generate karte hain
    const token = jwt.sign(
      { id: user.id, email: user.email }, // Payload - user data
      JWT_SECRET,                          // Secret key
      { expiresIn: "1h" }                  // Token valid for 1 hour
    );

    res.json({
      message: "Login successful",
      token: token,  // Client ko token bhejte hain
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    res.status(500).json({
      error: "Login failed",
      details: err.message,
    });
  }
};

// PROTECTED ROUTE - Sirf valid token se access hoga
const getUserProfile = async (req, res) => {
  try {
    // req.user authenticateToken middleware se aaya hai
    const query = "SELECT id, email FROM users WHERE id = $1";
    const result = await pool.query(query, [req.user.id]);

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

module.exports = { registerUser, loginUser, getUserProfile }