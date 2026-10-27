const router = require('express').Router();
const c = require('../controllers/project.controller');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);
router.get('/', c.list);
router.post('/', requireRole('manager'), c.create);
router.patch('/:id', requireRole('manager'), c.update);
router.delete('/:id', requireRole('manager'), c.remove);

module.exports = router;
