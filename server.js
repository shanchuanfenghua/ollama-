import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;
const OLLAMA_URL = 'http://localhost:11434';

app.use(cors());
app.use(express.json());

// Proxy endpoint for chat
app.post('/api/chat', async (req, res) => {
  try {
    console.log('Received chat request via backend');
    
    // Forward request to Ollama
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      throw new Error(`Ollama API Error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error('Backend Error:', error);
    res.status(500).json({ 
      error: 'Failed to connect to Ollama via backend.',
      details: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', ollama_url: OLLAMA_URL });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Point your app settings to this URL to avoid CORS issues.`);
});