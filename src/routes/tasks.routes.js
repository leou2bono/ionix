const router = require('express').Router();
const auth = require('../middleware/auth');
const { requireRole, blockIfMustChange } = require('../middleware/roles');
const { ROLES } = require('../utils/constants');
const ctrl = require('../controllers/tasks.controller');

// Admin - CRUD tareas con restricciones
router.post('/', auth, blockIfMustChange, requireRole(ROLES.ADMIN), ctrl.createTask);
router.patch('/:id', auth, blockIfMustChange, requireRole(ROLES.ADMIN), ctrl.updateTask);
router.delete('/:id', auth, blockIfMustChange, requireRole(ROLES.ADMIN), ctrl.deleteTask);

// Ejecutor - sus tareas
router.get('/my', auth, blockIfMustChange, requireRole(ROLES.EXECUTOR), ctrl.listMyTasks);
router.get('/my/:id', auth, blockIfMustChange, requireRole(ROLES.EXECUTOR), ctrl.getMyTaskDetail);
router.post('/my/:id/status', auth, blockIfMustChange, requireRole(ROLES.EXECUTOR), ctrl.updateMyTaskStatus);
router.post('/my/:id/comment', auth, blockIfMustChange, requireRole(ROLES.EXECUTOR), ctrl.addCommentToExpired);

// Auditor - visualizar todas
router.get('/', auth, blockIfMustChange, requireRole(ROLES.AUDITOR, ROLES.ADMIN), ctrl.auditListAllTasks);
router.get('/:id', auth, blockIfMustChange, requireRole(ROLES.AUDITOR, ROLES.ADMIN), ctrl.auditGetTask);

module.exports = router;
