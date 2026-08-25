const ApiError = require("../utils/apiError");

/**
 * A "validator" accepted by this middleware can be either:
 *
 *  1. A Joi-style schema — anything with a `.validate(data, options)` method
 *     that returns `{ error, value }` (this is what Joi, and most schema
 *     libraries modeled after it, already return).
 *
 *  2. A plain function — `(data) => { errors: [...] | null, value: any }`.
 *     Useful if validators/authValidator.js (or any future validator file)
 *     is written as hand-rolled functions instead of a schema library.
 *
 * Either way, this file never assumes a specific validation library is
 * installed — it only relies on one of these two calling conventions.
 */
const isJoiLikeSchema = (candidate) =>
  Boolean(candidate) && typeof candidate.validate === "function";

const isValidatorFunction = (candidate) => typeof candidate === "function";

/**
 * Runs a single validator against a single piece of request data
 * (req.body, req.params, or req.query) and normalizes the result to
 * { errors, value }.
 */
const runValidator = (validator, data) => {
  if (isJoiLikeSchema(validator)) {
    const { error, value } = validator.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = (error.details || []).map((detail) => ({
        field: Array.isArray(detail.path) ? detail.path.join(".") : String(detail.path),
        message: String(detail.message || "Invalid value").replace(/"/g, ""),
      }));
      return { errors, value: undefined };
    }

    return { errors: null, value };
  }

  if (isValidatorFunction(validator)) {
    const result = validator(data) || {};
    const errors = Array.isArray(result.errors) && result.errors.length > 0
      ? result.errors
      : null;

    return {
      errors,
      value: errors ? undefined : result.value,
    };
  }

  throw new Error(
    "validateMiddleware: supplied validator must be a Joi-style schema (with a .validate method) or a function"
  );
};

/**
 * validate(schema)
 *
 * Generic, reusable request-validation middleware.
 *
 * Usage A — validate req.body only (schema is a single Joi schema or function):
 *   router.post("/register", validate(authValidator.registerSchema), authController.register);
 *
 * Usage B — validate multiple parts of the request:
 *   router.get(
 *     "/products/:id",
 *     validate({ params: productValidator.idParamSchema }),
 *     productController.getById
 *   );
 *
 *   router.get(
 *     "/products",
 *     validate({ query: productValidator.listQuerySchema }),
 *     productController.list
 *   );
 *
 * `schema` may be:
 *   - a single Joi schema or validator function -> validates req.body only
 *   - an object like { body, params, query } -> validates whichever of
 *     those keys are supplied against the matching part of the request
 *
 * On failure: responds with 400 and a structured, safe error list.
 * On success: request continues; req.body/params/query are only
 * overwritten with the validator's own sanitized output (e.g. Joi's
 * stripped/coerced `value`), never modified in any other way.
 */
const validate = (schema) => {
  const targets =
    isJoiLikeSchema(schema) || isValidatorFunction(schema)
      ? { body: schema }
      : schema || {};

  return (req, res, next) => {
    try {
      const validationErrors = [];
      const sanitized = {};

      for (const key of ["params", "query", "body"]) {
        const validator = targets[key];
        if (!validator) continue;

        const { errors, value } = runValidator(validator, req[key]);

        if (errors) {
          errors.forEach((err) => validationErrors.push({ ...err, location: key }));
        } else if (value !== undefined) {
          sanitized[key] = value;
        }
      }

      if (validationErrors.length > 0) {
        const validationError = new ApiError(400, "Validation failed");
        validationError.errors = validationErrors;
        return next(validationError);
      }

      // Only assign back what the validator explicitly returned as sanitized
      // output — request data is otherwise left completely untouched.
      Object.keys(sanitized).forEach((key) => {
        req[key] = sanitized[key];
      });

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

module.exports = validate;