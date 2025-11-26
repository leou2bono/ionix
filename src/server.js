require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const { ROLES } = require('./utils/constants');

(async () => {
  await connectDB(process.env.MONGODB_URI);

  // Seed de administrador si no existe
  const adminEmail = 'leonardo.pavez@gmail.com';
  const exists = await User.findOne({ email: adminEmail });
  if (!exists) {
    const hash = await bcrypt.hash('TempAdmin123!', 10);
    await User.create({
      email: adminEmail,
      name: 'Administrador',
      role: ROLES.ADMIN,
      passwordHash: hash,
      mustChangePassword: true,
      active: true,
    });
    console.log('Admin seed creado: leonardo.pavez@gmail.com / TempAdmin123!');
  }

  app.listen(process.env.PORT, () => {
    console.log(`Servidor en puerto ${process.env.PORT}`);
  });
})();
