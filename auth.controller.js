const jwt = require('jsonwebtoken');
const User = require('../models/User');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const v = require('../utils/validate');

const sign = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = asyncHandler(async (req, res) => {
  const name = v.str(req.body.name, 'Name', { required: true, min: 2, max: 60 });
  const email = v.email(req.body.email);
  const password = req.body.password;
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    throw new HttpError(400, 'Password must be 8 to 72 characters');
  }
  const role = v.oneOf(req.body.role, 'Role', ['manager', 'member']) || 'member';

  if (await User.findOne({ email })) {
    throw new HttpError(409, 'An account with this email already exists');
  }
  const user = await User.create({ name, email, password, role });
  res.status(201).json({ token: sign(user), user });
});

exports.login = asyncHandler(async (req, res) => {
  const email = v.email(req.body.email);
  const password = req.body.password;
  if (typeof password !== 'string' || !password) throw new HttpError(400, 'Password is required');

  const user = await User.findOne({ email }).select('+password');
  // Same message for unknown email and wrong password, so accounts cannot be probed.
  if (!user || !(await user.matchPassword(password))) {
    throw new HttpError(401, 'Invalid email or password');
  }
  res.json({ token: sign(user), user });
});

exports.me = (req, res) => res.json({ user: req.user });
