const express = require('express');
const ensureAuth = require('../middleware/ensureAuth');

const router = express.Router();

router.get('/me', ensureAuth, (req, res) => {
  const { displayName, email, currency, _id } = req.user;
  res.json({ displayName, email, currency, userId: _id });
});

router.post('/currency/add', ensureAuth, async (req, res) => {
  const amount = Number(req.body.amount) || 0;
  req.user.currency += amount;
  await req.user.save();
  res.json({ currency: req.user.currency });
});

module.exports = router;
