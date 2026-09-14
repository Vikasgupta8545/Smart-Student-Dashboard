import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleGeminiChat, handleGenerateQuiz, handleGenerateNotes } from './src/api/gemini.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Smart Student Management System' });
});

// Gemini Chat endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const result = await handleGeminiChat(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Gemini Quiz generation endpoint
app.post('/api/gemini/quiz', async (req, res) => {
  try {
    const result = await handleGenerateQuiz(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Gemini Notes generation endpoint
app.post('/api/gemini/notes', async (req, res) => {
  try {
    const result = await handleGenerateNotes(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Serve static build assets
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
