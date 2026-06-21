const jwt = require('jsonwebtoken');

const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
} = require('../config/env');

// Generate Access Token
const generateAccessToken = (userId) =>
  jwt.sign(
    { id: userId },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );

// Generate Refresh Token
const generateRefreshToken = (userId) =>
  jwt.sign(
    { id: userId },
    JWT_REFRESH_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    }
  );

// Verify Access Token
const verifyAccessToken = (token) =>
  jwt.verify(token, JWT_SECRET);

// Verify Refresh Token
const verifyRefreshToken = (token) =>
  jwt.verify(token, JWT_REFRESH_SECRET);

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};