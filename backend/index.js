const express = require('express');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json'); // <-- weka faili hii
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper: authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Hakuna token' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token si sahihi' });
    req.user = user;
    next();
  });
};

// REGISTER
app.post('/api/register', async (req, res) => {
  const { fullName, email, password, phone, location } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Jaza jina, barua pepe na nywila' });
  }
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: fullName,
      phoneNumber: phone || undefined
    });
    // Optional: save location to Firestore (skip for now)
    res.status(201).json({ message: 'Usajili umefanikiwa!', uid: userRecord.uid });
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'Barua pepe tayari imesajiliwa' });
    }
    if (error.code === 'auth/invalid-password') {
      return res.status(400).json({ error: 'Nywila iwe angalau herufi 6' });
    }
    res.status(500).json({ error: 'Tatizo la server. Jaribu tena' });
  }
});

// LOGIN with password verification via Firebase REST API
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Barua pepe na nywila zinahitajika' });
  }
  try {
    const firebaseApiKey = process.env.FIREBASE_API_KEY;
    if (!firebaseApiKey) {
      return res.status(500).json({ error: 'Server configuration error' });
    }
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(401).json({ error: 'Email au nywila si sahihi' });
    }

    const userRecord = await admin.auth().getUser(data.localId);
    const token = jwt.sign(
      { userId: userRecord.uid, email: userRecord.email, name: userRecord.displayName },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({
      token,
      user: {
        id: userRecord.uid,
        name: userRecord.displayName,
        email: userRecord.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Tatizo la server. Jaribu tena' });
  }
});

// PROTECTED PROFILE
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

app.get('/', (req, res) => {
  res.send('GSM Fashion API iko tayari!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});