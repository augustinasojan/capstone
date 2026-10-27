const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { register, login, me } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

// Slow down brute-force attempts on sign-in and registration.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in a few minutes.' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, me);

module.exports = router;
