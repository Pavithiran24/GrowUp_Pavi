import app from './app';
import { config } from './config';
import { prisma } from './utils/db';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`🚀 TaskFlow Backend API server running on port ${PORT} [${config.nodeEnv}]`);
});

const gracefulShutdown = async () => {
  console.log('Shutting down server gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database connections closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
