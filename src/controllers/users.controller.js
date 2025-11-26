const bcrypt = require('bcrypt');
const User = require('../models/User');
const { ROLES } = require('../utils/constants');
const { createUserSchema } = require('../utils/validators');

exports.createUser = async (req, res) => {
  const { error, value } = createUserSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  // Admin NO puede crear Admin
  if (value.role === ROLES.ADMIN) {
    return res.status(403).json({ message: 'No se puede crear usuario Administrador' });
  }

  const exists = await User.findOne({ email: value.email });
  if (exists) return res.status(409).json({ message: 'Email ya registrado' });

  const tempPassword = 'TempUser123!'; // podrías generar aleatoria y enviar por canal seguro
  const hash = await bcrypt.hash(tempPassword, 10);

  const user = await User.create({
    email: value.email,
    name: value.name,
    role: value.role,
    passwordHash: hash,
    mustChangePassword: true,
    active: true,
  });

  return res.status(201).json({ id: user.id, tempPassword });
};

exports.listUsers = async (req, res) => {
  const users = await User.find().select('email name role active createdAt');
  return res.json(users);
};

exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id).select('email name role active createdAt');
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  return res.json(user);
};

exports.updateUser = async (req, res) => {
  const { name, role, active } = req.body;

  // Admin NO puede ascender a Administrador
  if (role && role === ROLES.ADMIN) {
    return res.status(403).json({ message: 'No se puede asignar rol Administrador' });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { ...(name && { name }), ...(role && { role }), ...(active !== undefined && { active }) } },
    { new: true }
  ).select('email name role active');
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  return res.json(user);
};

exports.deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  return res.json({ message: 'Usuario eliminado' });
};
