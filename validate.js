const HttpError = require('./httpError');

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Returns a trimmed string, or undefined if optional and empty. Throws 400 on bad input.
function str(value, field, { min = 0, max = 500, required = false } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) throw new HttpError(400, `${field} is required`);
    return undefined;
  }
  if (typeof value !== 'string') throw new HttpError(400, `${field} must be text`);
  const v = value.trim();
  if (required && !v) throw new HttpError(400, `${field} is required`);
  if (v.length < min) throw new HttpError(400, `${field} must be at least ${min} characters`);
  if (v.length > max) throw new HttpError(400, `${field} must be at most ${max} characters`);
  return v;
}

function oneOf(value, field, allowed, { required = false } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) throw new HttpError(400, `${field} is required`);
    return undefined;
  }
  if (typeof value !== 'string' || !allowed.includes(value)) {
    throw new HttpError(400, `${field} must be one of: ${allowed.join(', ')}`);
  }
  return value;
}

function objectId(value, field, { required = false } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) throw new HttpError(400, `${field} is required`);
    return undefined;
  }
  if (typeof value !== 'string' || !OBJECT_ID.test(value)) throw new HttpError(400, `${field} is invalid`);
  return value;
}

function date(value, field) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') throw new HttpError(400, `${field} must be a date`);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new HttpError(400, `${field} must be a valid date`);
  return d;
}

function email(value) {
  const v = str(value, 'Email', { required: true, max: 120 }).toLowerCase();
  if (!EMAIL.test(v)) throw new HttpError(400, 'Enter a valid email address');
  return v;
}

module.exports = { str, oneOf, objectId, date, email, OBJECT_ID };
