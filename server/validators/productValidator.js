import mongoose from "mongoose";

// ─── Shared helpers ───────────────────────────────────────────────────────────

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const trimString = (v) => (typeof v === "string" ? v.trim() : v);
const makeError  = (field, message) => ({ field, message });

const rejectUnexpectedFields = (payload, allowedFields) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return [makeError("body", "Request data must be an object")];
  }
  const allowed = new Set(allowedFields);
  return Object.keys(payload)
    .filter((k) => !allowed.has(k))
    .map((k) => makeError(k, `Unexpected field "${k}" is not allowed`));
};

// ─── ALLOWED CREATE FIELDS ────────────────────────────────────────────────────
// "seller" is intentionally absent — always taken from req.seller in controller
const CREATE_FIELDS = [
  "name", "slug", "description", "categories", "brand",
  "images", "price", "compareAtPrice", "stock", "sku",
  "isActive", "isFeatured", "isBestSelling",
];

// ─── createProduct ────────────────────────────────────────────────────────────

const createProduct = (data = {}) => {
  const unexpectedErrors = rejectUnexpectedFields(data, CREATE_FIELDS);
  if (unexpectedErrors.length > 0) return { errors: unexpectedErrors, value: undefined };

  const errors = [];

  // name
  const name = trimString(data.name);
  if (!name) {
    errors.push(makeError("name", "Product name is required"));
  } else if (name.length < 2) {
    errors.push(makeError("name", "Product name must be at least 2 characters"));
  } else if (name.length > 150) {
    errors.push(makeError("name", "Product name cannot exceed 150 characters"));
  }

  // slug
  const slug = typeof data.slug === "string" ? data.slug.trim().toLowerCase() : "";
  if (!slug) {
    errors.push(makeError("slug", "Product slug is required"));
  } else if (!SLUG_REGEX.test(slug)) {
    errors.push(makeError("slug", "Slug can only contain lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen"));
  }

  // description
  const description = trimString(data.description) ?? "";
  if (!description) {
    errors.push(makeError("description", "Product description is required"));
  } else if (description.length > 5000) {
    errors.push(makeError("description", "Description cannot exceed 5000 characters"));
  }

  // categories — array of ObjectIds
  let categories = [];
  if (!data.categories || !Array.isArray(data.categories) || data.categories.length === 0) {
    errors.push(makeError("categories", "At least one category is required"));
  } else {
    for (const catId of data.categories) {
      if (!mongoose.Types.ObjectId.isValid(catId)) {
        errors.push(makeError("categories", `Invalid category ID: ${catId}`));
        break;
      }
    }
    categories = data.categories;
  }

  // price
  const price = Number(data.price);
  if (data.price === undefined || data.price === null || data.price === "") {
    errors.push(makeError("price", "Price is required"));
  } else if (isNaN(price) || price < 0) {
    errors.push(makeError("price", "Price must be a non-negative number"));
  }

  // compareAtPrice (optional)
  let compareAtPrice = null;
  if (data.compareAtPrice !== undefined && data.compareAtPrice !== null && data.compareAtPrice !== "") {
    const cap = Number(data.compareAtPrice);
    if (isNaN(cap) || cap < 0) {
      errors.push(makeError("compareAtPrice", "Compare-at price must be a non-negative number"));
    } else {
      compareAtPrice = cap;
    }
  }

  // stock
  let stock = 0;
  if (data.stock !== undefined && data.stock !== null && data.stock !== "") {
    const s = Number(data.stock);
    if (isNaN(s) || s < 0 || !Number.isInteger(s)) {
      errors.push(makeError("stock", "Stock must be a non-negative integer"));
    } else {
      stock = s;
    }
  }

  // brand (optional)
  let brand = "";
  if (data.brand !== undefined && data.brand !== null) {
    brand = trimString(data.brand) ?? "";
    if (brand.length > 100) {
      errors.push(makeError("brand", "Brand cannot exceed 100 characters"));
    }
  }

  // images (optional array)
  let images = [];
  if (data.images !== undefined) {
    if (!Array.isArray(data.images)) {
      errors.push(makeError("images", "Images must be an array"));
    } else {
      for (let i = 0; i < data.images.length; i++) {
        const img = data.images[i];
        if (!img || typeof img !== "object" || !img.url || typeof img.url !== "string") {
          errors.push(makeError("images", `Image at index ${i} must have a url string`));
          break;
        }
      }
      images = data.images;
    }
  }

  // sku (optional)
  let sku = undefined;
  if (data.sku !== undefined && data.sku !== null && data.sku !== "") {
    sku = trimString(data.sku);
  }

  // boolean flags
  const parseBool = (val, field, def) => {
    if (val === undefined) return def;
    if (typeof val !== "boolean") { errors.push(makeError(field, `${field} must be a boolean`)); return def; }
    return val;
  };
  const isActive      = parseBool(data.isActive,      "isActive",      true);
  const isFeatured    = parseBool(data.isFeatured,    "isFeatured",    false);
  const isBestSelling = parseBool(data.isBestSelling, "isBestSelling", false);

  if (errors.length > 0) return { errors, value: undefined };

  const value = { name, slug, description, categories, price, stock, brand, images, isActive, isFeatured, isBestSelling };
  if (compareAtPrice !== null) value.compareAtPrice = compareAtPrice;
  if (sku !== undefined)       value.sku = sku;

  return { errors: null, value };
};

// ─── updateProduct ────────────────────────────────────────────────────────────

const UPDATE_FIELDS = [...CREATE_FIELDS];

const updateProduct = (data = {}) => {
  const unexpectedErrors = rejectUnexpectedFields(data, UPDATE_FIELDS);
  if (unexpectedErrors.length > 0) return { errors: unexpectedErrors, value: undefined };

  const errors  = [];
  const sanitized = {};

  if (data.name !== undefined) {
    const name = trimString(data.name);
    if (!name)             errors.push(makeError("name", "Product name cannot be empty"));
    else if (name.length < 2)   errors.push(makeError("name", "Product name must be at least 2 characters"));
    else if (name.length > 150) errors.push(makeError("name", "Product name cannot exceed 150 characters"));
    else sanitized.name = name;
  }

  if (data.slug !== undefined) {
    const slug = typeof data.slug === "string" ? data.slug.trim().toLowerCase() : "";
    if (!slug)               errors.push(makeError("slug", "Slug cannot be empty"));
    else if (!SLUG_REGEX.test(slug)) errors.push(makeError("slug", "Slug can only contain lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen"));
    else sanitized.slug = slug;
  }

  if (data.description !== undefined) {
    const description = trimString(data.description) ?? "";
    if (!description)             errors.push(makeError("description", "Product description cannot be empty"));
    else if (description.length > 5000) errors.push(makeError("description", "Description cannot exceed 5000 characters"));
    else sanitized.description = description;
  }

  if (data.categories !== undefined) {
    if (!Array.isArray(data.categories) || data.categories.length === 0) {
      errors.push(makeError("categories", "At least one category is required"));
    } else {
      let valid = true;
      for (const catId of data.categories) {
        if (!mongoose.Types.ObjectId.isValid(catId)) {
          errors.push(makeError("categories", `Invalid category ID: ${catId}`)); valid = false; break;
        }
      }
      if (valid) sanitized.categories = data.categories;
    }
  }

  if (data.price !== undefined) {
    const price = Number(data.price);
    if (isNaN(price) || price < 0) errors.push(makeError("price", "Price must be a non-negative number"));
    else sanitized.price = price;
  }

  if (data.compareAtPrice !== undefined) {
    if (data.compareAtPrice === null || data.compareAtPrice === "") {
      sanitized.compareAtPrice = null;
    } else {
      const cap = Number(data.compareAtPrice);
      if (isNaN(cap) || cap < 0) errors.push(makeError("compareAtPrice", "Compare-at price must be a non-negative number"));
      else sanitized.compareAtPrice = cap;
    }
  }

  if (data.stock !== undefined) {
    const s = Number(data.stock);
    if (isNaN(s) || s < 0 || !Number.isInteger(s)) errors.push(makeError("stock", "Stock must be a non-negative integer"));
    else sanitized.stock = s;
  }

  if (data.brand !== undefined) {
    const brand = trimString(data.brand) ?? "";
    if (brand.length > 100) errors.push(makeError("brand", "Brand cannot exceed 100 characters"));
    else sanitized.brand = brand;
  }

  if (data.images !== undefined) {
    if (!Array.isArray(data.images)) {
      errors.push(makeError("images", "Images must be an array"));
    } else {
      let valid = true;
      for (let i = 0; i < data.images.length; i++) {
        const img = data.images[i];
        if (!img || typeof img !== "object" || !img.url || typeof img.url !== "string") {
          errors.push(makeError("images", `Image at index ${i} must have a url string`)); valid = false; break;
        }
      }
      if (valid) sanitized.images = data.images;
    }
  }

  if (data.sku !== undefined) {
    sanitized.sku = (data.sku === null || data.sku === "") ? undefined : trimString(data.sku);
  }

  const parseBool = (val, field) => {
    if (typeof val !== "boolean") { errors.push(makeError(field, `${field} must be a boolean`)); return undefined; }
    return val;
  };
  if (data.isActive      !== undefined) { const v = parseBool(data.isActive,      "isActive");      if (v !== undefined) sanitized.isActive      = v; }
  if (data.isFeatured    !== undefined) { const v = parseBool(data.isFeatured,    "isFeatured");    if (v !== undefined) sanitized.isFeatured    = v; }
  if (data.isBestSelling !== undefined) { const v = parseBool(data.isBestSelling, "isBestSelling"); if (v !== undefined) sanitized.isBestSelling = v; }

  if (errors.length === 0 && Object.keys(sanitized).length === 0) {
    errors.push(makeError("body", "At least one field must be provided to update"));
  }

  if (errors.length > 0) return { errors, value: undefined };
  return { errors: null, value: sanitized };
};

// ─── productIdParam ───────────────────────────────────────────────────────────

const productIdParam = (data = {}) => {
  const { id } = data;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return { errors: [makeError("id", "Invalid product ID")], value: undefined };
  }
  return { errors: null, value: { id } };
};

export { createProduct, updateProduct, productIdParam };
