const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Managers need the list of team members to assign tasks.
exports.listMembers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'member' }).select('name email').sort({ name: 1 }).limit(200);
  res.json({ users });
});
