import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

// Handle all possible token locations
const getTokenFromRequest = (req) => {
  // First check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  // Then check cookie
  if (req.cookies?.jwt) {
    return req.cookies.jwt;
  }
  return null;
};

// Protect routes that require authentication
export const protect = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists in petitioners table
    const { data: petitioner, error: petitionerError } = await supabase
      .from('petitioners')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (petitioner) {
      req.user = {
        ...petitioner,
        role: 'petitioner'
      };
      return next();
    }

    // If not found in petitioners, check admins table
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (admin) {
      req.user = {
        ...admin,
        role: 'admin'
      };
      return next();
    }

    // If user not found in either table
    throw new Error('User not found');

  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(401).json({ error: 'Not authorized' });
  }
};

// Protect admin-only routes
export const adminOnly = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized as admin' });
    }
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(403).json({ error: 'Not authorized as admin' });
  }
};

// Optional auth middleware - doesn't require auth but adds user to req if token exists
export const optionalAuth = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check petitioners table
    const { data: petitioner } = await supabase
      .from('petitioners')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (petitioner) {
      req.user = {
        ...petitioner,
        role: 'petitioner'
      };
      return next();
    }

    // Check admins table
    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (admin) {
      req.user = {
        ...admin,
        role: 'admin'
      };
    }

    next();
  } catch (error) {
    // On any error, just continue without setting user
    next();
  }
};