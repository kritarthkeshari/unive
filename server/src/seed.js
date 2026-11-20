import mongoose from 'mongoose';
import { config } from './config.js';
import { clearAll, runSeed, seedIfEmpty } from './db.js';

const force = process.argv.includes('--force');

await mongoose.connect(config.mongoUri, { dbName: config.dbName });

if (force) {
  await clearAll();
  await runSeed();
  console.log('Database wiped and reseeded.');
} else {
  const seeded = await seedIfEmpty();
  console.log(seeded ? 'Database seeded.' : 'Database already had data — nothing to do.');
}

await mongoose.disconnect();
