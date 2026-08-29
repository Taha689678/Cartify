import User from "../models/User.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    // User is already authenticated and attached to req.user.
    // Fetch fresh details from DB just in case, but exclude sensitive fields.
    const user = await User.findById(userId).select(
      "name username email phone avatar role isVerified createdAt"
    );

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    return successResponse(res, 200, "Profile retrieved successfully", { user });
  } catch (error) {
    return errorResponse(res, 500, "Error retrieving profile", error.message);
  }
};

/**
 * @route   PATCH /api/users/me
 * @desc    Update current user profile (name, username, phone, avatar)
 * @access  Private
 */
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // Destructure only permitted fields from req.body
    const { name, username, phone, avatar } = req.body;

    // Build update object
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (username !== undefined) updateFields.username = username;
    if (phone !== undefined) updateFields.phone = phone;
    
    if (avatar && typeof avatar === 'object') {
      updateFields.avatar = {};
      if (avatar.url !== undefined) updateFields.avatar.url = avatar.url;
      if (avatar.publicId !== undefined) updateFields.avatar.publicId = avatar.publicId;
    }

    // Notice we do NOT include email, password, role, isVerified, tokens, or isBlocked.
    // They are explicitly excluded by not plucking them from req.body.

    // If username is being changed, check if it's already taken by another user
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return errorResponse(res, 400, "Username is already taken");
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("name username email phone avatar role isVerified createdAt");

    if (!updatedUser) {
      return errorResponse(res, 404, "User not found");
    }

    return successResponse(res, 200, "Profile updated successfully", { user: updatedUser });
  } catch (error) {
    // Handle Mongoose validation errors nicely
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return errorResponse(res, 400, "Validation failed", messages);
    }
    // Handle MongoDB duplicate key errors (e.g. username unique constraint)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return errorResponse(res, 400, `${field} is already in use`);
    }

    return errorResponse(res, 500, "Error updating profile", error.message);
  }
};
