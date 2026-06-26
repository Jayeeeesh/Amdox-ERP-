const Joi = require("joi");

const orderStatuses = [
  "pending",
  "approved",
  "ordered",
  "received",
  "cancelled",
];

// Reusable item schema
const purchaseItemSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Item name is required",
    "string.min": "Item name must be at least 2 characters",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.min": "Quantity must be at least 1",
    "number.integer": "Quantity must be a whole number",
  }),
  unitPrice: Joi.number().positive().precision(2).required().messages({
    "number.positive": "Unit price must be greater than zero",
  }),
  description: Joi.string().trim().max(200).allow("", null),
});

// Create Purchase Order
const createPurchaseOrderSchema = Joi.object({
  vendor: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Vendor name is required",
  }),
  items: Joi.array().items(purchaseItemSchema).min(1).required().messages({
    "array.min": "At least one item is required",
  }),
  expectedDelivery: Joi.alternatives()
    .try(Joi.date(), Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/))
    .required()
    .messages({
      "alternatives.match": "Expected delivery must be a valid date",
      "date.greater": "Expected delivery must be a future date",
    }),
  notes: Joi.string().trim().max(500).allow("", null),
})
  .required()
  .strict();

// Update Purchase Order
const updatePurchaseOrderSchema = Joi.object({
  vendor: Joi.string().trim().min(2).max(100),
  status: Joi.string()
    .valid(...orderStatuses)
    .messages({
      "any.only": `Status must be one of: ${orderStatuses.join(", ")}`,
    }),
  expectedDelivery: Joi.date().greater("now"),
  notes: Joi.string().trim().max(500).allow("", null),
})
  .min(1)
  .strict();

module.exports = {
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
};
