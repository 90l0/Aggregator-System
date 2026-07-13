const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log('[mock] ', req.method, req.path);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', source: 'mock-backend' });
});

app.post('/auth/login', (req, res) => {
  const { email } = req.body || {};
  res.json({ access_token: 'mock-token', token_type: 'bearer', email: email || 'user@example.com' });
});

app.post('/auth/register', (req, res) => {
  const { email } = req.body || {};
  res.status(201).json({ message: 'mock registered', email: email || 'user@example.com' });
});

app.get('/api/example', (req, res) => {
  res.json({ data: 'example' });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Mock client connected', socket.id);
  socket.emit('connected', { msg: 'hello from mock backend' });
  socket.on('message', (m) => {
    console.log('mock received message', m);
    socket.emit('message', { echo: m });
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Mock backend listening on http://localhost:${PORT}`);
});
