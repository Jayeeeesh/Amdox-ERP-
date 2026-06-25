const mongoose = require('mongoose');
const PurchaseOrder = require('../../models/purchaseOrder.model');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

// Helper - validate ObjectId
const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

// Get All Purchase Orders
const getPurchaseOrders = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    status,
    vendor,
    search,
    startDate,
    endDate,
  } = req.query;

  page = Number(page);
  limit = Number(limit);

  if (page < 1 || limit < 1) {
    throw new ApiError('Invalid pagination', 400);
  }

  const query = {};

  if (status) query.status = status;
  if (vendor) query.vendor = new RegExp(vendor, 'i');
  if (search) query.$text = { $search: search };

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const [orders, total, summary] = await Promise.all([
    PurchaseOrder
      .find(query)
      .active()
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),

    PurchaseOrder.countDocuments({
      ...query,
      isDeleted: false,
    }),

    PurchaseOrder.aggregate([
      { $match: { ...query, isDeleted: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      'Purchase orders fetched',
      { orders, summary },
      {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    )
  );
});

// Get Single Purchase Order
const getPurchaseOrder = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    throw new ApiError('Invalid order id', 400);
  }

  const order = await PurchaseOrder
    .findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('approvedBy', 'name email')
    .lean();

  if (!order || order.isDeleted) {
    throw new ApiError('Purchase order not found', 404);
  }

  res.status(200).json(
    new ApiResponse(200, 'Purchase order fetched', order)
  );
});

// Create Purchase Order
const createPurchaseOrder = asyncHandler(async (req, res) => {
  const order = await PurchaseOrder.create({
    ...req.body,
    createdBy: req.user._id,
  });

  await order.populate('createdBy', 'name email');

  res.status(201).json(
    new ApiResponse(201, 'Purchase order created', order)
  );
});

// Update Purchase Order
const updatePurchaseOrder = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    throw new ApiError('Invalid order id', 400);
  }

  const order = await PurchaseOrder.findById(req.params.id);

  if (!order || order.isDeleted) {
    throw new ApiError('Purchase order not found', 404);
  }

  // Cannot update received or cancelled orders
  if (['received', 'cancelled'].includes(order.status)) {
    throw new ApiError(
      `Cannot update order with status: ${order.status}`,
      400
    );
  }

  Object.assign(order, req.body);
  await order.save();

  res.status(200).json(
    new ApiResponse(200, 'Purchase order updated', order)
  );
});

// Approve Purchase Order
const approvePurchaseOrder = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    throw new ApiError('Invalid order id', 400);
  }

  const order = await PurchaseOrder.findById(req.params.id);

  if (!order || order.isDeleted) {
    throw new ApiError('Purchase order not found', 404);
  }

  if (order.status !== 'pending') {
    throw new ApiError(
      `Cannot approve order with status: ${order.status}`,
      400
    );
  }

  await order.approve(req.user._id);

  res.status(200).json(
    new ApiResponse(200, 'Purchase order approved', order)
  );
});

// Mark as Received
const receivePurchaseOrder = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    throw new ApiError('Invalid order id', 400);
  }

  const order = await PurchaseOrder.findById(req.params.id);

  if (!order || order.isDeleted) {
    throw new ApiError('Purchase order not found', 404);
  }

  if (order.status !== 'ordered') {
    throw new ApiError(
      `Cannot receive order with status: ${order.status}`,
      400
    );
  }

  await order.markReceived();

  res.status(200).json(
    new ApiResponse(200, 'Purchase order marked as received', order)
  );
});

// ======================
// Cancel Purchase Order
// ======================
const cancelPurchaseOrder = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    throw new ApiError('Invalid order id', 400);
  }

  const order = await PurchaseOrder.findById(req.params.id);

  if (!order || order.isDeleted) {
    throw new ApiError('Purchase order not found', 404);
  }

  if (['received', 'cancelled'].includes(order.status)) {
    throw new ApiError(
      `Cannot cancel order with status: ${order.status}`,
      400
    );
  }

  order.status = 'cancelled';
  await order.save();

  res.status(200).json(
    new ApiResponse(200, 'Purchase order cancelled', order)
  );
});

// Delete Purchase Order
const deletePurchaseOrder = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    throw new ApiError('Invalid order id', 400);
  }

  const order = await PurchaseOrder.findById(req.params.id);

  if (!order || order.isDeleted) {
    throw new ApiError('Purchase order not found', 404);
  }

  await order.softDelete();

  res.status(200).json(
    new ApiResponse(200, 'Purchase order deleted')
  );
});

// ======================
// Restore Purchase Order
// ======================
const restorePurchaseOrder = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    throw new ApiError('Invalid order id', 400);
  }

  const order = await PurchaseOrder.findById(req.params.id);

  if (!order || !order.isDeleted) {
    throw new ApiError('Purchase order not found', 404);
  }

  await order.restore();

  res.status(200).json(
    new ApiResponse(200, 'Purchase order restored', order)
  );
});

module.exports = {
  getPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrder,
  approvePurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder,
  deletePurchaseOrder,
  restorePurchaseOrder,
};