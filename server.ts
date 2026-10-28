import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Local data file path
const DATA_DIR = path.join(__dirname, 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// API Routes
app.get('/api/sessions', (_req, res) => {
  try {
    if (!fs.existsSync(SESSIONS_FILE)) {
      return res.json({ sessions: null, fileExists: false, path: 'data/sessions.json' });
    }
    const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return res.json({ sessions: parsed, fileExists: true, path: 'data/sessions.json' });
  } catch (err: any) {
    console.error('Error reading sessions file:', err);
    return res.status(500).json({ error: 'Failed to read data file' });
  }
});

app.post('/api/sessions', (req, res) => {
  try {
    const { sessions } = req.body;
    if (!Array.isArray(sessions)) {
      return res.status(400).json({ error: 'sessions must be an array' });
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
    return res.json({ success: true, count: sessions.length, path: 'data/sessions.json' });
  } catch (err: any) {
    console.error('Error writing sessions file:', err);
    return res.status(500).json({ error: 'Failed to write data file' });
  }
});

app.post('/api/sessions/clear', (_req, res) => {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
    return res.json({ success: true, count: 0 });
  } catch (err: any) {
    console.error('Error clearing sessions file:', err);
    return res.status(500).json({ error: 'Failed to clear data file' });
  }
});

// Mount Vite or static server
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    const url = `http://localhost:${PORT}`;
    console.log(`Cronotask server listening on port ${PORT}`);
    console.log(`Accede a la aplicacion en: ${url}`);
  });
}

startServer();
