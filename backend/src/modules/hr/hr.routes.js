const express = require('express');
const router = express.Router();
const hrController = require('./hr.controller');
const validate = require('../../middleware/validate.middleware');
const {
  protect,
  adminOnly,
  managerOnly
} = require('../../middleware/auth.middleware');
const {
  createEmployeeSchema,
  updateEmployeeSchema
} = require('./hr.validation');

// All HR routes protected
router.use(protect);

/**
 * @swagger
 * /hr/employees:
 *   get:
 *     summary: Get all employees
 *     tags: [HR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employees fetched
 *       401:
 *         description: Not authorized
 */
router.get('/employees', managerOnly, hrController.getEmployees);

/**
 * @swagger
 * /hr/employees/{id}:
 *   get:
 *     summary: Get single employee
 *     tags: [HR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee fetched
 *       404:
 *         description: Employee not found
 */
router.get('/employees/:id', managerOnly, hrController.getEmployee);

/**
 * @swagger
 * /hr/employees:
 *   post:
 *     summary: Create employee
 *     tags: [HR]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone, department, designation, salary, joiningDate]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jayesh
 *               email:
 *                 type: string
 *                 example: jayesh@company.com
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               department:
 *                 type: string
 *                 example: Engineering
 *               designation:
 *                 type: string
 *                 example: Developer
 *               salary:
 *                 type: integer
 *                 example: 50000
 *               joiningDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *               role:
 *                 type: string
 *                 example: employee
 *     responses:
 *       201:
 *         description: Employee created
 *       409:
 *         description: Email already exists
 */
router.post('/employees', adminOnly, validate(createEmployeeSchema), hrController.createEmployee);

/**
 * @swagger
 * /hr/employees/{id}:
 *   patch:
 *     summary: Update employee
 *     tags: [HR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               department:
 *                 type: string
 *               salary:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Employee updated
 *       404:
 *         description: Employee not found
 */
router.patch('/employees/:id', adminOnly, validate(updateEmployeeSchema), hrController.updateEmployee);

/**
 * @swagger
 * /hr/employees/{id}:
 *   delete:
 *     summary: Delete employee (soft)
 *     tags: [HR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee deleted
 *       404:
 *         description: Employee not found
 */
router.delete('/employees/:id', adminOnly, hrController.deleteEmployee);

/**
 * @swagger
 * /hr/employees/{id}/restore:
 *   patch:
 *     summary: Restore deleted employee
 *     tags: [HR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee restored
 *       404:
 *         description: Employee not found
 */
router.patch('/employees/:id/restore', adminOnly, hrController.restoreEmployee);

module.exports = router;