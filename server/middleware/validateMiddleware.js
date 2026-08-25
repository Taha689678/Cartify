const ApiError = require("../utils/apiError");


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