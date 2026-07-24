import express from 'express';
import cors from 'cors';
import { initBot } from './bot';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', bot: 'running' });
});

import { NlpService } from './nlp';
app.post('/api/health-checkup', async (req, res) => {
  try {
    const snapshot = req.body.snapshot;
    if (!snapshot) {
      return res.status(400).json({ error: 'Snapshot is required' });
    }
    const report = await NlpService.generateHealthReport(snapshot);
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  // Initialize Telegram Bot
  initBot();
});
