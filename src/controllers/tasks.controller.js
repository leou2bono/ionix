const Task = require('../models/Task');
const User = require('../models/User');
const { TASK_STATUS } = require('../utils/constants');
const { createTaskSchema, updateTaskStatusSchema, commentSchema } = require('../utils/validators');

const isExpired = (task) => new Date(task.dueDate) < new Date();

exports.createTask = async (req, res) => {
  const { error, value } = createTaskSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const assignee = await User.findById(value.assigneeId);
  if (!assignee) return res.status(404).json({ message: 'Ejecutor no encontrado' });
  if (assignee.role !== 'Ejecutor') {
    return res.status(400).json({ message: 'La tarea solo puede asignarse a un Ejecutor' });
  }

  const task = await Task.create({
    title: value.title,
    description: value.description,
    dueDate: value.dueDate,
    status: TASK_STATUS.ASSIGNED,
    assignee: assignee.id,
  });

  return res.status(201).json(task);
};

exports.updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });

  // Admin solo puede actualizar si estado es Asignado
  if (task.status !== TASK_STATUS.ASSIGNED) {
    return res.status(403).json({ message: 'Solo se puede actualizar tareas en estado Asignado' });
  }

  const { title, description, dueDate, assigneeId } = req.body;
  if (assigneeId) {
    const assignee = await User.findById(assigneeId);
    if (!assignee || assignee.role !== 'Ejecutor') {
      return res.status(400).json({ message: 'Nuevo asignado debe ser Ejecutor válido' });
    }
    task.assignee = assigneeId;
  }

  if (title) task.title = title;
  if (description) task.description = description;
  if (dueDate) task.dueDate = dueDate;

  await task.save();
  return res.json(task);
};

exports.deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });

  if (task.status !== TASK_STATUS.ASSIGNED) {
    return res.status(403).json({ message: 'Solo se puede eliminar tareas en estado Asignado' });
  }

  await task.deleteOne();
  return res.json({ message: 'Tarea eliminada' });
};

exports.listMyTasks = async (req, res) => {
  const tasks = await Task.find({ assignee: req.user.id }).select('title status dueDate');
  return res.json(tasks);
};

exports.getMyTaskDetail = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, assignee: req.user.id })
    .populate('assignee', 'name email');
  if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });

  // Si está vencida pero no marcado, opcionalmente marcar como Vencida
  if (isExpired(task) && task.status !== TASK_STATUS.EXPIRED) {
    task.status = TASK_STATUS.EXPIRED;
    await task.save();
  }

  return res.json(task);
};

exports.updateMyTaskStatus = async (req, res) => {
  const { error, value } = updateTaskStatusSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const task = await Task.findOne({ _id: req.params.id, assignee: req.user.id });
  if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });

  // No permitir si vencida
  const expired = isExpired(task) || task.status === TASK_STATUS.EXPIRED;
  if (expired) return res.status(403).json({ message: 'No se puede actualizar una tarea vencida' });

  // Transiciones permitidas (simplificado): Asignado -> En_Progreso -> Completada
  const allowed = new Set([TASK_STATUS.ASSIGNED, TASK_STATUS.IN_PROGRESS, TASK_STATUS.COMPLETED]);
  if (!allowed.has(value.status)) return res.status(400).json({ message: 'Estado no permitido' });

  // Validar orden mínimo
  if (task.status === TASK_STATUS.ASSIGNED && value.status === TASK_STATUS.COMPLETED) {
    return res.status(400).json({ message: 'Debe pasar por En_Progreso antes de Completada' });
  }

  task.status = value.status;
  await task.save();
  return res.json(task);
};

exports.addCommentToExpired = async (req, res) => {
  const { error, value } = commentSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const task = await Task.findOne({ _id: req.params.id, assignee: req.user.id });
  if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });

  // Solo comentar si vencida
  const expired = isExpired(task) || task.status === TASK_STATUS.EXPIRED;
  if (!expired) return res.status(403).json({ message: 'Solo se puede comentar tareas vencidas' });

  // Asegurar estado Vencida
  if (task.status !== TASK_STATUS.EXPIRED) {
    task.status = TASK_STATUS.EXPIRED;
  }

  task.comments.push({ author: req.user.id, text: value.text });
  await task.save();
  return res.status(201).json({ message: 'Comentario agregado', taskId: task.id });
};

exports.auditListAllTasks = async (_req, res) => {
  const tasks = await Task.find().select('title status dueDate assignee').populate('assignee', 'name email');
  return res.json(tasks);
};

exports.auditGetTask = async (req, res) => {
  const task = await Task.findById(req.params.id).populate('assignee', 'name email');
  if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
  return res.json(task);
};
