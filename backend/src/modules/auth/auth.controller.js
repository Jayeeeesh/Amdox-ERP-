const User = require('../../models/user.model');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../../utils/jwt');

// Cookie Options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError('Email already registered', 409);
  }

  // Create user
  const user = await User.create({ name, email, password, role });

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token without triggering password hash
  await User.findByIdAndUpdate(user._id, { refreshToken });

  // Set cookie
  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(201).json(
    new ApiResponse(201, 'User registered successfully', {
      user,
      accessToken,
    })
  );
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password and refreshToken
  const user = await User.findOne({ email })
    .select('+password +refreshToken');

  if (!user) {
    throw new ApiError('Invalid credentials', 401);
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError('Invalid credentials', 401);
  }

  // Check active
  if (!user.isActive) {
    throw new ApiError('Account is deactivated', 403);
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Update lastLogin and refreshToken
  await User.findByIdAndUpdate(user._id, {
    refreshToken,
    lastLogin: new Date(),
  });

  // Set cookie
  res.cookie('refreshToken', refreshToken, cookieOptions);
  res.cookie('accessToken', accessToken, cookieOptions);

  res.status(200).json(
    new ApiResponse(200, 'Login successful', {
      user,
      accessToken,
    })
  );
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  // Clear refresh token
  await User.findByIdAndUpdate(req.user?.id, {
    refreshToken: null,
  });

  // Clear cookie with same options
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json(
    new ApiResponse(200, 'Logout successful')
  );
});

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
// @access  Public
const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new ApiError('Refresh token not found', 401);
  }

  // Verify token safely
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new ApiError('Invalid or expired refresh token', 401);
  }

  // Find user
  const user = await User.findById(decoded.id)
    .select('+refreshToken');

  if (!user || user.refreshToken !== token) {
    throw new ApiError('Invalid refresh token', 401);
  }

  // Generate new tokens
  const accessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  // Update refresh token
  await User.findByIdAndUpdate(user._id, {
    refreshToken: newRefreshToken,
  });

  res.cookie('refreshToken', newRefreshToken, cookieOptions);
  res.cookie('accessToken', accessToken, cookieOptions);

  res.status(200).json(
    new ApiResponse(200, 'Token refreshed', {
      accessToken,
    })
  );
});

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
};