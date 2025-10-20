require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Server } = require('socket.io');

const User = require('./models/User');
const FriendRequest = require('./models/FriendRequest');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

// ✅ Use CLIENT_URL from .env (important for deployment)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ["GET", "POST"],
  },
});

app.use(express.json());

// ✅ Use dynamic CORS instead of always '*'
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

// ✅ Environment vars
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this';

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/socialgram', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch((err) => console.error('❌ MongoDB Error:', err));

// 🔐 Auth Middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// 🧾 Routes (Auth, Friends, Users, Messages)
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'Missing fields' });

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) return res.status(400).json({ error: 'User exists' });

  const pw = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, passwordHash: pw });
  const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET);
  res.json({
    token,
    user: { id: user._id, username: user.username, email: user.email },
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'Invalid' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ error: 'Invalid' });

  const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET);
  res.json({ token, user: { id: user._id, username: user.username } });
});

app.get('/api/users/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('-passwordHash')
    .populate('friends', 'username avatarUrl');
  res.json(user);
});

app.get('/api/users/search', auth, async (req, res) => {
  const q = req.query.q || '';
  const users = await User.find({
    username: { $regex: q, $options: 'i' },
  })
    .limit(20)
    .select('username avatarUrl bio');
  res.json(users);
});

app.post('/api/requests/send', auth, async (req, res) => {
  const { toUserId } = req.body;
  if (req.user.id === toUserId)
    return res.status(400).json({ error: 'Cannot send to yourself' });

  try {
    const fr = await FriendRequest.create({ from: req.user.id, to: toUserId });
    res.json(fr);
  } catch (e) {
    res.status(400).json({ error: 'Request exists or bad' });
  }
});

app.post('/api/requests/:id/accept', auth, async (req, res) => {
  const fr = await FriendRequest.findById(req.params.id);
  if (!fr) return res.status(404).json({ error: 'Not found' });
  if (String(fr.to) !== req.user.id)
    return res.status(403).json({ error: 'Not allowed' });

  fr.status = 'accepted';
  await fr.save();
  await User.findByIdAndUpdate(fr.from, { $addToSet: { friends: fr.to } });
  await User.findByIdAndUpdate(fr.to, { $addToSet: { friends: fr.from } });
  res.json({ ok: true });
});

app.post('/api/requests/:id/decline', auth, async (req, res) => {
  const fr = await FriendRequest.findById(req.params.id);
  if (!fr) return res.status(404).json({ error: 'Not found' });
  if (String(fr.to) !== req.user.id)
    return res.status(403).json({ error: 'Not allowed' });

  fr.status = 'declined';
  await fr.save();
  res.json({ ok: true });
});

app.get('/api/requests', auth, async (req, res) => {
  const incoming = await FriendRequest.find({
    to: req.user.id,
    status: 'pending',
  }).populate('from', 'username avatarUrl');
  const outgoing = await FriendRequest.find({
    from: req.user.id,
    status: 'pending',
  }).populate('to', 'username avatarUrl');
  res.json({ incoming, outgoing });
});

app.get('/api/messages/:conversationId', auth, async (req, res) => {
  const msgs = await Message.find({
    conversationId: req.params.conversationId,
  })
    .sort('createdAt')
    .limit(200);
  res.json(msgs);
});

// 🧠 Socket.io logic
const online = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('No token'));
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    socket.user = payload;
    next();
  } catch (e) {
    next(new Error('Auth error'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.user.id;
  online.set(userId, socket.id);

  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
  });

  socket.on('sendMessage', async (data) => {
    const message = await Message.create({
      conversationId: data.conversationId,
      from: userId,
      to: data.to,
      text: data.text,
    });
    io.to(data.conversationId).emit('message', message);

    const toSocket = online.get(String(data.to));
    if (toSocket)
      io.to(toSocket).emit('new_message_notification', {
        from: userId,
        conversationId: data.conversationId,
      });
  });

  socket.on('disconnect', () => {
    online.delete(userId);
  });
});

// ✅ Start server
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
