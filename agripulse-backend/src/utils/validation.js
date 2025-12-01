// src/utils/validation.js
import mongoose from "mongoose";

/**
 * Validate MongoDB ObjectId
 */
export function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Validate ObjectId and return error if invalid
 */
export function validateObjectId(id, fieldName = "ID") {
  if (!id) {
    return { valid: false, error: `${fieldName} is required` };
  }
  if (!isValidObjectId(id)) {
    return { valid: false, error: `Invalid ${fieldName} format` };
  }
  return { valid: true };
}

/**
 * Validate multiple ObjectIds
 */
export function validateObjectIds(ids, fieldName = "IDs") {
  if (!Array.isArray(ids)) {
    return { valid: false, error: `${fieldName} must be an array` };
  }
  for (const id of ids) {
    const result = validateObjectId(id, fieldName);
    if (!result.valid) return result;
  }
  return { valid: true };
}

/**
 * Middleware to validate ObjectId in request params
 */
export function validateParamObjectId(paramName = "id") {
  return (req, res, next) => {
    const id = req.params[paramName];
    const result = validateObjectId(id, paramName);
    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }
    next();
  };
}

/**
 * Middleware to validate ObjectId in request body
 */
export function validateBodyObjectId(fieldName) {
  return (req, res, next) => {
    const id = req.body[fieldName];
    const result = validateObjectId(id, fieldName);
    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }
    next();
  };
}

/**
 * Validate required fields
 */
export function validateRequired(fields) {
  return (req, res, next) => {
    const missing = [];
    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === "") {
        missing.push(field);
      }
    }
    if (missing.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missing.join(", ")}` 
      });
    }
    next();
  };
}

/**
 * Validate enum values
 */
export function validateEnum(field, allowedValues) {
  return (req, res, next) => {
    const value = req.body[field];
    if (value && !allowedValues.includes(value)) {
      return res.status(400).json({ 
        error: `${field} must be one of: ${allowedValues.join(", ")}` 
      });
    }
    next();
  };
}

/**
 * Validate number range
 */
export function validateNumberRange(field, min, max) {
  return (req, res, next) => {
    const value = req.body[field];
    if (value !== undefined) {
      const num = Number(value);
      if (isNaN(num)) {
        return res.status(400).json({ error: `${field} must be a number` });
      }
      if (min !== undefined && num < min) {
        return res.status(400).json({ error: `${field} must be at least ${min}` });
      }
      if (max !== undefined && num > max) {
        return res.status(400).json({ error: `${field} must be at most ${max}` });
      }
    }
    next();
  };
}

