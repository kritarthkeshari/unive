import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET || 'univenture-dev-secret-change-me',
  tokenExpiry: '7d',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/univenture',
  dbName: process.env.MONGODB_DB || 'univenture',
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),
};
