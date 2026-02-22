import mongoose from 'mongoose';

const HealthRiskCaseSchema = new mongoose.Schema({
  pollutant: { type: String, required: true },
  medium: { type: String, enum: ['повітря', 'вода'], required: true },
  C: { type: Number, min: 0, required: true },
  IR: { type: Number, min: 0.001, required: true },
  EF: { type: Number, min: 1, max: 365, required: true },
  ED: { type: Number, min: 1, max: 80, required: true },
  BW: { type: Number, min: 1, required: true },
  AT: { type: Number, min: 365, required: true },
  CDI: { type: Number },
  HQ: { type: Number },
  HI: { type: Number },
  CR: { type: Number },
  hash: { type: String, unique: true, index: true },
  units: { type: Object },
  referenceUsed: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('HealthRiskCase', HealthRiskCaseSchema);