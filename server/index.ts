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

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  // Initialize Telegram Bot
  initBot();
});
