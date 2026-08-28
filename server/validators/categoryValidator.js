import mongoose from "mongoose";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const trimString = (value) =>
  typeof value === "string" ? value.trim() : value;

const makeError = (field, message) => ({ field, message });

const rejectUnexpectedFields = (payload, allowedFields) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return [makeError("body", "Request data must be an object")];
  }
  const allowed = new Set(allowedFields);
  return Object.keys(payload)
    .filter((key) => !allowed.has(key))
    .map((key) => makeError(key, `Unexpected field "${key}" is not allowed`));
};

// ─── Create ───────────────────────────────────────────────────────────────────

const createCategory = (data = {}) => {
  const unexpectedErrors = rejectUnexpectedFields(data, [
    "name", "slug", "description", "image", "parentCategory", "isActive",
  ]);
  if (unexpectedErrors.length > 0) return { errors: unexpectedErrors, value: undefined };

  const errors = [];

  // name
  const name = trimString(data.name);
  if (!name) {
    errors.push(makeError("name", "Category name is required"));
  } else if (name.length < 2) {
    errors.push(makeError("name", "Category name must be at least 2 characters"));
  } else if (name.length > 100) {
    errors.push(makeError("name", "Category name cannot exceed 100 characters"));
  }

  // slug
  const slug = typeof data.slug === "string" ? data.slug.trim().toLowerCase() : "";
  if (!slug) {
    errors.push(makeError("slug", "Category slug is required"));
  } else if (!SLUG_REGEX.test(slug)) {
    errors.push(makeError("slug", "Slug can only contain lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen"));
  }

  // description
  let description = "";
  if (data.description !== undefined && data.description !== null) {
    description = trimString(data.description) ?? "";
    if (typeof description !== "string") {
      errors.push(makeError("description", "Description must be a string"));
    } else if (description.length > 500) {
      errors.push(makeError("description", "Description cannot exceed 500 characters"));
    }
  }

  // image
  let image = { url: "", publicId: "" };
  if (data.image !== undefined && data.image !== null) {
    if (typeof data.image !== "object" || Array.isArray(data.image)) {
      errors.push(makeError("image", "Image must be an object with url and publicId"));
    } else {
      image = {
        url: trimString(data.image.url) || "",
        publicId: trimString(data.image.publicId) || "",
      };
    }
  }

  // parentCategory
  let parentCategory = null;
  if (data.parentCategory !== undefined && data.parentCategory !== null && data.parentCategory !== "") {
    if (!mongoose.Types.ObjectId.isValid(data.parentCategory)) {
      errors.push(makeError("parentCategory", "Parent category must be a valid ID"));
    } else {
      parentCategory = data.parentCategory;
    }
  }

  // isActive
  let isActive = true;
  if (data.isActive !== undefined) {
    if (typeof data.isActive !== "boolean") {
      errors.push(makeError("isActive", "isActive must be a boolean"));
    } else {
      isActive = data.isActive;
    }
  }

  if (errors.length > 0) return { errors, value: undefined };
  return { errors: null, value: { name, slug, description, image, parentCategory, isActive } };
};

// ─── Update ───────────────────────────────────────────────────────────────────

const updateCategory = (data = {}) => {
  const unexpectedErrors = rejectUnexpectedFields(data, [
    "name", "slug", "description", "image", "parentCategory", "isActive",
  ]);
  if (unexpectedErrors.length > 0) return { errors: unexpectedErrors, value: undefined };

  const errors = [];
  const sanitized = {};

  if (data.name !== undefined) {
    const name = trimString(data.name);
    if (!name) {
      errors.push(makeError("name", "Category name cannot be empty"));
    } else if (name.length < 2) {
      errors.push(makeError("name", "Category name must be at least 2 characters"));
    } else if (name.length > 100) {
      errors.push(makeError("name", "Category name cannot exceed 100 characters"));
    } else {
      sanitized.name = name;
    }
  }

  if (data.slug !== undefined) {
    const slug = typeof data.slug === "string" ? data.slug.trim().toLowerCase() : "";
    if (!slug) {
      errors.push(makeError("slug", "Slug cannot be empty"));
    } else if (!SLUG_REGEX.test(slug)) {
      errors.push(makeError("slug", "Slug can only contain lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen"));
    } else {
      sanitized.slug = slug;
    }
  }

  if (data.description !== undefined) {
    const description = trimString(data.description) ?? "";
    if (typeof description !== "string") {
      errors.push(makeError("description", "Description must be a string"));
    } else if (description.length > 500) {
      errors.push(makeError("description", "Description cannot exceed 500 characters"));
    } else {
      sanitized.description = description;
    }
  }

  if (data.image !== undefined) {
    if (data.image === null) {
      sanitized.image = { url: "", publicId: "" };
    } else if (typeof data.image !== "object" || Array.isArray(data.image)) {
      errors.push(makeError("image", "Image must be an object with url and publicId"));
    } else {
      sanitized.image = {
        url: trimString(data.image.url) || "",
        publicId: trimString(data.image.publicId) || "",
      };
    }
  }

  if (data.parentCategory !== undefined) {
    if (data.parentCategory === null || data.parentCategory === "") {
      sanitized.parentCategory = null;
    } else if (!mongoose.Types.ObjectId.isValid(data.parentCategory)) {
      errors.push(makeError("parentCategory", "Parent category must be a valid ID"));
    } else {
      sanitized.parentCategory = data.parentCategory;
    }
  }

  if (data.isActive !== undefined) {
    if (typeof data.isActive !== "boolean") {
      errors.push(makeError("isActive", "isActive must be a boolean"));
    } else {
      sanitized.isActive = data.isActive;
    }
  }

  if (errors.length === 0 && Object.keys(sanitized).length === 0) {
    errors.push(makeError("body", "At least one field must be provided to update"));
  }

  if (errors.length > 0) return { errors, value: undefined };
  return { errors: null, value: sanitized };
};

// ─── Params ───────────────────────────────────────────────────────────────────

const categoryIdParam = (data = {}) => {
  const { id } = data;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return { errors: [makeError("id", "Invalid category ID")], value: undefined };
  }
  return { errors: null, value: { id } };
};

export { createCategory, updateCategory, categoryIdParam };
