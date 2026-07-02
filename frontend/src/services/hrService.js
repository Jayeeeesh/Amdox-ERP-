import api from "./api";

const hrService = Object.freeze({
  /**
   * Get all employees
   * @param {Object} params - { page, limit, department, search }
   */
  getEmployees: (params) => api.get("/hr/employees", { params }),

  /**
   * Get single employee
   * @param {string} id - Employee ID
   */
  getEmployee: (id) => api.get(`/hr/employees/${id}`),

  /**
   * Create employee
   * @param {Object} payload - Employee data
   */
  createEmployee: (payload) => api.post("/hr/employees", payload),

  /**
   * Update employee
   * @param {string} id - Employee ID
   * @param {Object} payload - Updated data
   */
  updateEmployee: (id, payload) =>
    api.patch(`/hr/employees/${id}`, payload),

  /**
   * Delete employee (soft)
   * @param {string} id - Employee ID
   */
  deleteEmployee: (id) => api.delete(`/hr/employees/${id}`),

  /**
   * Restore employee
   * @param {string} id - Employee ID
   */
  restoreEmployee: (id) =>
    api.patch(`/hr/employees/${id}/restore`),
});

export default hrService;