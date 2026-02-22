import mongoose from 'mongoose';
import dotenv from 'dotenv';
import HealthRiskCase from '../models/HealthRiskCase.js';
import seedData from './healthRiskSeed.json' with { type: 'json' };
import { computeHealthRisk } from '../services/healthRiskService.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const importData = async () => {
  try {
    await HealthRiskCase.deleteMany({});
    for (const item of seedData) {
      const result = computeHealthRisk(item);
      await HealthRiskCase.create({ ...item, ...result });
    }
    console.log('Seed data imported (30 records)');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

importData();