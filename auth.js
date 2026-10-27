const jwt = require('jsonwebtoken');
const User = require('../models/User');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');

// Authentication: who are you?
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'Please sign in to continue');

  const payload = jwt.verify(token, process.env.JWT_SECRET); // throws on bad/expired token
  const user = await User.findById(payload.id);
  if (!user) throw new HttpError(401, 'Account no longer exists');
  req.user = user;
  next();
});

// Authorization: what may you do?
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new HttpError(403, 'You do not have permission to do that'));
  }
  next();
};

module.exports = { protect, requireRole };
