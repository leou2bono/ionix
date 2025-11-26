const router = require('express').Router();
const auth = require('../middleware/auth');
const { requireRole, blockIfMustChange } = require('../middleware/roles');
const { ROLES } = require('../utils/constants');
const ctrl = require('../controllers/users.controller');

router.use(auth, blockIfMustChange, requireRole(ROLES.ADMIN));

router.post('/', ctrl.createUser);
router.get('/', ctrl.listUsers);
router.get('/:id', ctrl.getUser);
router.patch('/:id', ctrl.updateUser);
router.delete('/:id', ctrl.deleteUser);

module.exports = router;
