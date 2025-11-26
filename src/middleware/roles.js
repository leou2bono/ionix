const { ROLES } = require('../utils/constants');

exports.requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Permiso denegado' });
  }
  next();
};

// Opcional: bloquear acceso si debe cambiar contraseña (excepto endpoints de cambio)
exports.blockIfMustChange = (req, res, next) => {
  const isPasswordChangeEndpoint =
    req.method === 'POST' && req.originalUrl.startsWith('/auth/change-password');
  if (req.user.mustChangePassword && !isPasswordChangeEndpoint) {
    return res.status(428).json({ message: 'Debe actualizar la contraseña antes de continuar' });
  }
  next();
};
