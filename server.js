require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-me') {
    console.error('JWT_SECRET is missing or still "change-me". Set a long random value in server/.env');
    process.exit(1);
  }
  await connectDB();
  app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
