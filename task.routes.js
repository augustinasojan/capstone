const router = require('express').Router();
const c = require('../controllers/task.controller');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);
router.get('/', c.list);
router.post('/', requireRole('manager'), c.create);
router.patch('/:id', c.update); // managers: any field; assigned members: status only (checked in controller)
router.delete('/:id', requireRole('manager'), c.remove);

module.exports = router;
