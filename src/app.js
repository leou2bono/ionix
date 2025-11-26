const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const taskRoutes = require('./routes/tasks.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);

module.exports = app;
