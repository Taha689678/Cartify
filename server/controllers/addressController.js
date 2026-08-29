import mongoose from "mongoose";
import Address from "../models/Address.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

/** Fields callers are allowed to supply on create/update. */
const ALLOWED_FIELDS = [
  "fullName",
  "phone",
  "addressLine1",
  "addressLine2",
  "city",
  "state",
  "postalCode",
  "country",
  "isDefault",
];

/**
 * Pick only the allowed fields from a plain object.
 * Silently drops anything not in the allowlist (e.g. user, _id).
 */
const pickAllowed = (body) =>
  ALLOWED_FIELDS.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      acc[key] = body[key];
    }
    return acc;
  }, {});

/**
 * Centralised error handler.
 * - mongoose CastError (bad ObjectId) -> 400
 * - mongoose ValidationError          -> 400 with field details
 * - everything else                   -> 500
 * Never leaks a stack trace.
 */
const handleError = (res, error) => {
  if (error.name === "CastError") {
    return errorResponse(res, 400, "Invalid address ID format");
  }
  if (error.name === "ValidationError") {
    const details = Object.values(error.errors).map((e) => e.message);
    return errorResponse(res, 400, "Validation failed", details);
  }
  console.error("[addressController]", error.message);
  return errorResponse(res, 500, "An unexpected error occurred");
};

// ---------------------------------------------------------------------------
// GET /api/addresses
// ---------------------------------------------------------------------------
export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return successResponse(res, 200, "Addresses retrieved", { addresses });
  } catch (error) {
    return handleError(res, error);
  }
};

// ---------------------------------------------------------------------------
// POST /api/addresses
// ---------------------------------------------------------------------------
export const createAddress = async (req, res) => {
  try {
    const fields = pickAllowed(req.body);

    // If this new address is being marked as default, clear all existing defaults first.
    if (fields.isDefault === true) {
      await Address.updateMany(
        { user: req.user.id },
        { $set: { isDefault: false } }
      );
    }

    const address = await Address.create({
      ...fields,
      user: req.user.id, // Always set from authenticated session
    });

    return successResponse(res, 201, "Address created", { address });
  } catch (error) {
    return handleError(res, error);
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/addresses/:id
// ---------------------------------------------------------------------------
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format early to give a clean 400
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, "Invalid address ID format");
    }

    const fields = pickAllowed(req.body);

    // If updating isDefault to true, clear other defaults first.
    if (fields.isDefault === true) {
      await Address.updateMany(
        { user: req.user.id, _id: { $ne: id } },
        { $set: { isDefault: false } }
      );
    }

    // Filter by both _id AND user to prevent IDOR.
    const address = await Address.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { $set: fields },
      { returnDocument: "after", runValidators: true }
    );

    if (!address) {
      return errorResponse(res, 404, "Address not found");
    }

    return successResponse(res, 200, "Address updated", { address });
  } catch (error) {
    return handleError(res, error);
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/addresses/:id
// ---------------------------------------------------------------------------
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, "Invalid address ID format");
    }

    // Filter by both _id AND user to prevent IDOR.
    const address = await Address.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!address) {
      return errorResponse(res, 404, "Address not found");
    }

    return successResponse(res, 200, "Address deleted", { address });
  } catch (error) {
    return handleError(res, error);
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/addresses/:id/default
// ---------------------------------------------------------------------------
export const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, "Invalid address ID format");
    }

    // Verify the address exists and belongs to this user before touching anything.
    const exists = await Address.exists({ _id: id, user: req.user.id });
    if (!exists) {
      return errorResponse(res, 404, "Address not found");
    }

    // Atomically clear all other defaults for this user.
    await Address.updateMany(
      { user: req.user.id, _id: { $ne: id } },
      { $set: { isDefault: false } }
    );

    const address = await Address.findByIdAndUpdate(
      id,
      { $set: { isDefault: true } },
      { returnDocument: "after" }
    );

    return successResponse(res, 200, "Default address updated", { address });
  } catch (error) {
    return handleError(res, error);
  }
};
