const HttpError = require('../utils/httpError');

function notFound(req, res, next) {
  next(new HttpError(404, 'Route not found'));
}

// One central handler: consistent JSON shape, no internal details leaked.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.expose ? err.message : 'Something went wrong on the server';

  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON in request body';
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join('. ') || 'Invalid input';
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier';
  } else if (err.code === 11000) {
    status = 409;
    message = 'That value is already in use';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Session expired. Please sign in again';
  }

  if (status >= 500) console.error(err); // details stay in server logs only
  res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };
