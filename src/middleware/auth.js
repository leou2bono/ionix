const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Token requerido' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user || !user.active) return res.status(401).json({ message: 'Usuario inválido' });
    req.user = { id: user.id, role: user.role, mustChangePassword: user.mustChangePassword };
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido' });
  }
};
