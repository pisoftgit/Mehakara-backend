const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .trim()
    .required()
    .messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 3 characters"
    }),

  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .messages({
      "string.email": "Enter a valid email"
    }),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters"
    }),

  role: Joi.string()
    .valid('user', 'artist')
    .optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

module.exports = { registerSchema, loginSchema };