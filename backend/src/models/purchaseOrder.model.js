const mongoose = require('mongoose');

// Item Sub-Schema
const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be a whole number',
      },
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0.01, 'Unit price must be greater than 0'],
      set: (value) => Number(value.toFixed(2)),
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

// Purchase Order Schema
const purchaseOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
    vendor: {
      type: String,
      required: [true, 'Vendor is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
      index: true,
    },
    items: {
      type: [itemSchema],
      validate: {
        validator: (items) => items.length > 0,
        message: 'At least one item is required',
      },
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: {
        values: [
          'pending',
          'approved',
          'ordered',
          'received',
          'cancelled',
        ],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
      index: true,
    },
    expectedDelivery: {
      type: Date,
      required: [true, 'Expected delivery date is required'],
      index: true,
    },
    receivedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Pre Save - Calculate totals
purchaseOrderSchema.pre('save', function () {
  // Calculate item total prices
  this.items.forEach((item) => {
    item.totalPrice = Number(
      (item.quantity * item.unitPrice).toFixed(2)
    );
  });

  // Calculate order total
  this.totalAmount = Number(
    this.items
      .reduce((sum, item) => sum + item.totalPrice, 0)
      .toFixed(2)
  );

  // Auto generate order number
  if (!this.orderNumber) {
    const timestamp = Date.now();
    this.orderNumber = `PO-${timestamp}`;
  }
});

// Query Helperss
purchaseOrderSchema.query.active = function () {
  return this.where({ isDeleted: false });
};


// Soft delete
purchaseOrderSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Restore
purchaseOrderSchema.methods.restore = function () {
  this.isDeleted = false;
  this.deletedAt = null;
  return this.save();
};

// Approve order
purchaseOrderSchema.methods.approve = function (userId) {
  this.status = 'approved';
  this.approvedBy = userId;
  return this.save();
};

// Mark as received
purchaseOrderSchema.methods.markReceived = function () {
  this.status = 'received';
  this.receivedAt = new Date();
  return this.save();
};


// Indexes
purchaseOrderSchema.index({ vendor: 'text', notes: 'text' });
purchaseOrderSchema.index({ createdBy: 1, createdAt: -1 });
purchaseOrderSchema.index({ status: 1, expectedDelivery: 1 });

const PurchaseOrder = mongoose.model(
  'PurchaseOrder',
  purchaseOrderSchema
);

module.exports = PurchaseOrder;