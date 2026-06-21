const ApiError = require('../utils/ApiError');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return next(
        new ApiError(
          'Validation failed',
          400,
          error.details.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message,
          }))
        )
      );
    }

    req[property] = value;
    next();
  };
};

module.exports = validate;