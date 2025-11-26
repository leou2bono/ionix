const router = require('express').Router();
const auth = require('../middleware/auth');
const { login, changePassword } = require('../controllers/auth.controller');

router.post('/login', login);
router.post('/change-password', auth, changePassword);

module.exports = router;
