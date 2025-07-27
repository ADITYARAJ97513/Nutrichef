export const errorHandler = (err, req, res, next) => {
  console.error(err);

  let error = { ...err };
  error.message = err.message;
  
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}. Invalid format.`;
    return res.status(404).json({ message });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ message: 'Validation Failed', errors: messages });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value entered for '${field}'. Please use another value.`;
    return res.status(400).json({ message });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token. Please log in again.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
  }

  res.status(error.statusCode || 500).json({
    message: error.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
