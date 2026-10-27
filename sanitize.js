const HttpError = require('../utils/httpError');

// Rejects keys that could be used for NoSQL operator injection ("$gt", "a.b").
function hasBadKey(value, depth = 0) {
  if (depth > 6 || value === null || typeof value !== 'object') return false;
  return Object.keys(value).some((k) => k.startsWith('$') || k.includes('.') || hasBadKey(value[k], depth + 1));
}

module.exports = (req, res, next) => {
  if (hasBadKey(req.body) || hasBadKey(req.query) || hasBadKey(req.params)) {
    return next(new HttpError(400, 'Invalid characters in request'));
  }
  next();
};
