const router = require('express').Router();
const { listMembers } = require('../controllers/user.controller');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', protect, requireRole('manager'), listMembers);

module.exports = router;
