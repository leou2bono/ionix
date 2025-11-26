const Joi = require('joi');
exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).required(),
  role: Joi.string().valid('Ejecutor', 'Auditor').required(),
});

exports.updatePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

exports.createTaskSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().min(3).required(),
  dueDate: Joi.date().iso().required(),
  assigneeId: Joi.string().hex().length(24).required(),
});

exports.updateTaskStatusSchema = Joi.object({
  status: Joi.string().valid('Asignado', 'En_Progreso', 'Completada').required(),
});

exports.commentSchema = Joi.object({
  text: Joi.string().min(2).required(),
});
