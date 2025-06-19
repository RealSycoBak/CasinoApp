const express = require('express');
const session = require('express-session');
const cors = require('cors');
const passport = require('./config/passport');
require('dotenv').config();
require('./config/db');

const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { sameSite: 'lax', secure: false },
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`API running on :${PORT}`));
const { setupSocket } = require('./socket');
setupSocket(server);