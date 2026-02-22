import HealthRiskCase from '../models/HealthRiskCase.js';
import { computeHealthRisk } from '../services/healthRiskService.js';

export const calc = async (req, res) => {
  try {
    const result = computeHealthRisk(req.body);


    let doc = await HealthRiskCase.findOne({ hash: result.hash });
    if (doc) {
      return res.json({ success: true, data: doc, cached: true });
    }

    doc = new HealthRiskCase({
      ...req.body,
      ...result
    });
    await doc.save();

    res.json({ success: true, data: doc });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};