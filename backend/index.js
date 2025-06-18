const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('./auth/passport');
require('dotenv').config();

const app = express();

const cors = require('cors');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser:    true,
  useUnifiedTopology: true,
});

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { sameSite: 'lax', secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'online'
  })
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (_req, res) => {
    res.redirect('http://localhost:5173/casino');
  }
);

app.post('/auth/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(err => {
      res.clearCookie('connect.sid');
      res.sendStatus(err ? 500 : 200);
    });
  });
});

function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Not authenticated' });
}

app.get('/api/me', ensureAuth, (req, res) => {
  const { displayName, email, currency } = req.user;
  res.json({ displayName, email, currency });
});

app.post('/api/currency/add', ensureAuth, async (req, res) => {
  const amount = Number(req.body.amount) || 0;
  req.user.currency += amount;
  await req.user.save();
  res.json({ currency: req.user.currency });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on :${PORT}`));
