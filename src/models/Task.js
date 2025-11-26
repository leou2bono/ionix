const { Schema, model, Types } = require('mongoose');
const { TASK_STATUS } = require('../utils/constants');

const commentSchema = new Schema({
  author: { type: Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const taskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: Object.values(TASK_STATUS), default: TASK_STATUS.ASSIGNED },
  assignee: { type: Types.ObjectId, ref: 'User', required: true },
  comments: [commentSchema],
}, { timestamps: true });

module.exports = model('Task', taskSchema);
