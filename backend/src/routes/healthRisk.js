import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calc } from '../controllers/healthRiskController.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const refsPath = path.join(__dirname, '../config/references.json');

const router = express.Router();


router.get('/references', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(refsPath, 'utf-8'));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Не вдалося прочитати довідник' });
  }
});


router.post('/references', (req, res) => {
  try {
    fs.writeFileSync(refsPath, JSON.stringify(req.body, null, 2));
    res.json({ success: true, message: 'Довідник успішно оновлено!' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Помилка збереження' });
  }
});


router.post('/calc', calc);

export default router;