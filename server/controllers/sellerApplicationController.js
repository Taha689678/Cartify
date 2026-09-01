import Seller from "../models/seller.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import slugify from "slugify";

/**
 * @route   POST /api/seller-applications
 * @desc    Submit a new seller application
 * @access  Private (Customer)
 */
export const submitApplication = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    // A user shouldn't submit if they are already a seller
    if (req.user.role === "seller" || req.user.role === "admin") {
      return errorResponse(res, 400, "You already have a seller or admin role.");
    }

    // Check if an application already exists (pending, approved, rejected, suspended)
    const existingSeller = await Seller.findOne({ user: userId });
    
    if (existingSeller) {
      if (existingSeller.status === "pending") {
        return errorResponse(res, 400, "You already have a pending application.");
      }
      if (existingSeller.status === "approved") {
        return errorResponse(res, 400, "You are already an approved seller.");
      }
      if (existingSeller.status === "rejected") {
        // Option to allow re-applying: update the existing doc
        const { storeName, storeDescription } = req.body;
        if (!storeName) return errorResponse(res, 400, "Store name is required.");

        existingSeller.storeName = storeName;
        if (storeDescription) existingSeller.storeDescription = storeDescription;
        existingSeller.storeSlug = slugify(storeName, { lower: true, strict: true });
        existingSeller.status = "pending";
        existingSeller.rejectionReason = "";
        existingSeller.reviewedBy = null;
        existingSeller.reviewedAt = null;
        
        await existingSeller.save();
        return successResponse(res, 200, "Seller application resubmitted successfully", { application: existingSeller });
      }
      if (existingSeller.status === "suspended") {
        return errorResponse(res, 400, "Your seller account is suspended.");
      }
    }

    // Extract only permitted fields
    const { storeName, storeDescription } = req.body;

    if (!storeName) {
      return errorResponse(res, 400, "Store name is required");
    }

    const storeSlug = slugify(storeName, { lower: true, strict: true });

    // Check if storeSlug is taken by someone else
    const slugExists = await Seller.findOne({ storeSlug });
    if (slugExists) {
      return errorResponse(res, 400, "Store name is already taken. Please choose another one.");
    }

    // Create new seller profile with pending status
    // Status is hardcoded so frontend cannot override it
    const newApplication = await Seller.create({
      user: userId,
      storeName,
      storeSlug,
      storeDescription: storeDescription || "",
      status: "pending"
    });

    return successResponse(res, 201, "Seller application submitted successfully", { application: newApplication });

  } catch (error) {
    if (error.code === 11000) {
       return errorResponse(res, 400, "Store name or user application already exists.");
    }
    next(error);
  }
};

/**
 * @route   GET /api/seller-applications/me
 * @desc    Get current user's seller application status
 * @access  Private (Customer)
 */
export const getMyApplication = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const application = await Seller.findOne({ user: userId }).select("-__v");

    if (!application) {
      return errorResponse(res, 404, "No application found.");
    }

    // Return the application safely without exposing others
    return successResponse(res, 200, "Application fetched", { application });

  } catch (error) {
    next(error);
  }
};
