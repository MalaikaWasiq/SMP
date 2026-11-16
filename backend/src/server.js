require('dotenv').config();

const app = require('./app');
const { connectDb, initDbAutoReconnect } = require('./config/db');

const { seedDestinationsIfEmpty } = require('./services/destinationService');

const PORT = process.env.PORT || 5000;

async function start() {
  initDbAutoReconnect(app);
  const dbReady = await connectDb(app);
  app.locals.dbReady = dbReady;
  if (dbReady) {
    await seedDestinationsIfEmpty();
  }

  app.listen(PORT, () => {
    console.log(`Smart Travel Planner API listening on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start API', error);
  process.exit(1);
});
