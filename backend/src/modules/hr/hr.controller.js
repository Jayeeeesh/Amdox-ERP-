const mongoose = require('mongoose');

const Employee = require('../../models/employee.model');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');



// Get all employees
const getEmployees = asyncHandler(async (req,res)=>{

  let {
    page = 1,
    limit = 10,
    department,
    search
  } = req.query;


  page = Number(page);
  limit = Number(limit);


  if(page < 1 || limit < 1){
    throw new ApiError(
      'Invalid pagination',
      400
    );
  }


  const query = {};


  if(department){
    query.department = department;
  }


  if(search){
    query.$text = {
      $search: search
    };
  }


  const employees = await Employee
    .find(query)
    .active()
    .select('-deletedAt')
    .skip((page-1)*limit)
    .limit(limit)
    .sort({
      createdAt:-1
    })
    .lean();



  const total = await Employee
    .countDocuments(query);



  res.status(200).json(
    new ApiResponse(
      200,
      'Employees fetched',
      employees,
      {
        page,
        limit,
        total,
        pages:Math.ceil(total/limit)
      }
    )
  );

});





// Get single employee
const getEmployee = asyncHandler(async(req,res)=>{


  if(!mongoose.Types.ObjectId.isValid(req.params.id)){
    throw new ApiError(
      'Invalid employee id',
      400
    );
  }



  const employee = await Employee
    .findById(req.params.id)
    .lean();



  if(
    !employee ||
    employee.deletedAt
  ){
    throw new ApiError(
      'Employee not found',
      404
    );
  }



  res.status(200).json(
    new ApiResponse(
      200,
      'Employee fetched',
      employee
    )
  );


});






// Create employee
const createEmployee = asyncHandler(async(req,res)=>{


  const exists =
    await Employee.findOne({
      email:req.body.email
    });



  if(exists){
    throw new ApiError(
      'Email already exists',
      409
    );
  }



  const employee =
    await Employee.create(req.body);



  res.status(201).json(
    new ApiResponse(
      201,
      'Employee created',
      employee
    )
  );

});







// Update employee
const updateEmployee = asyncHandler(async(req,res)=>{


  const employee =
    await Employee.findById(
      req.params.id
    );


  if(!employee){
    throw new ApiError(
      'Employee not found',
      404
    );
  }




  if(
    req.body.email &&
    req.body.email !== employee.email
  ){

    const exists =
      await Employee.findOne({
        email:req.body.email
      });


    if(exists){
      throw new ApiError(
        'Email already exists',
        409
      );
    }

  }



  Object.assign(
    employee,
    req.body
  );


  await employee.save();



  res.status(200).json(
    new ApiResponse(
      200,
      'Employee updated',
      employee
    )
  );


});







// Soft delete
const deleteEmployee = asyncHandler(async(req,res)=>{


  const employee =
    await Employee.findById(
      req.params.id
    );


  if(
    !employee ||
    employee.deletedAt
  ){

    throw new ApiError(
      'Employee not found',
      404
    );

  }



  await employee.softDelete();



  res.status(200).json(
    new ApiResponse(
      200,
      'Employee deleted'
    )
  );

});







// Restore employee
const restoreEmployee = asyncHandler(async(req,res)=>{


  const employee =
    await Employee.findById(
      req.params.id
    );


  if(!employee){
    throw new ApiError(
      'Employee not found',
      404
    );
  }



  await employee.restore();



  res.status(200).json(
    new ApiResponse(
      200,
      'Employee restored',
      employee
    )
  );


});




module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  restoreEmployee
};