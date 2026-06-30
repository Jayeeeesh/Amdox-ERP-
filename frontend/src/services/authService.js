import api from "./api";

/**
 * =============================================================================
 * Authentication Service
 * -----------------------------------------------------------------------------
 * Centralizes all authentication-related API operations.
 *
 * Responsibilities:
 * - User registration
 * - User authentication
 * - Session termination
 * - Access token renewal
 * - Authenticated user profile retrieval
 * =============================================================================
 */
const authService = Object.freeze({
  /**
   * Creates a new user account.
   * @param {Object} payload - Registration data { name, email, password, role }.
   * @returns {Promise} API response with user and accessToken
   */
  register: (payload) => api.post("/auth/register", payload),

  /**
   * Authenticates a user and returns access credentials.
   * @param {Object} payload - User login credentials { email, password }.
   * @returns {Promise} API response with user and accessToken
   */
  login: (payload) => api.post("/auth/login", payload),

  /**
   * Terminates the current authenticated session.
   * @returns {Promise} API response confirming logout
   */
  logout: () => api.post("/auth/logout"),

  /**
   * Requests a new access token using the refresh token.
   * @returns {Promise} API response with new accessToken
   */
  refreshToken: () => api.post("/auth/refresh"),

  /**
   * Retrieves the authenticated user's profile.
   * @returns {Promise} API response with user data
   */
  getProfile: () => api.get("/users/me"),

  /**
   * Updates the authenticated user's profile.
   * @param {Object} payload - Fields to update { name, email }.
   * @returns {Promise} API response with updated user
   */
  updateProfile: (payload) => api.patch("/users/me", payload),

  /**
   * Changes the authenticated user's password.
   * @param {Object} payload - { currentPassword, newPassword }.
   * @returns {Promise} API response confirming password change
   */
  changePassword: (payload) =>
    api.patch("/users/me/change-password", payload),
});

export default authService;