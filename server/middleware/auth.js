import jwt from 'jsonwebtoken';
import User from '../models/User.js'; 
const sendError = (res, statusCode, message) => res.status(statusCode).json({ message });

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return sendError(res, 401, 'Access denied. No token provided.');
    }
    
    if (!process.env.JWT_SECRET) {
      console.error('FATAL ERROR: JWT_SECRET is not defined.');
      return sendError(res, 500, 'Internal Server Error: Missing server configuration.');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return sendError(res, 401, 'Authorization failed. User not found or is inactive.');
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Invalid or expired token.');
    }
    console.error('Authentication Error:', error);
    return sendError(res, 500, 'An internal error occurred during authentication.');
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required to check authorization.');
    }

    if (req.user.role === 'admin') {
      return next();
    }
    
    const hasPermission = allowedRoles.includes(req.user.role);
    
    if (!hasPermission) {
      return sendError(res, 403, 'Forbidden. You do not have the required permissions.');
    }
    
    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token && process.env.JWT_SECRET) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
    }
  }
  
  next();
};
