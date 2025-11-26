const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { loginSchema, updatePasswordSchema } = require('../utils/validators');

exports.login = async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const user = await User.findOne({ email: value.email });
  if (!user || !user.active) return res.status(401).json({ message: 'Credenciales inválidas' });

  const ok = await bcrypt.compare(value.password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

  const token = jwt.sign(
    { sub: user.id, role: user.role, mustChangePassword: user.mustChangePassword },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return res.json({
    token,
    profile: user.role,
    mustChangePassword: user.mustChangePassword,
    name: user.name,
  });
};

exports.changePassword = async (req, res) => {
  const { error, value } = updatePasswordSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const user = await User.findById(req.user.id);
  const ok = await bcrypt.compare(value.oldPassword, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Contraseña actual incorrecta' });

  const hash = await bcrypt.hash(value.newPassword, 10);
  user.passwordHash = hash;
  user.mustChangePassword = false;
  await user.save();

  return res.json({ message: 'Contraseña actualizada' });
};
