const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'online',
  })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (_req, res) => {
    res.redirect('http://localhost:5173/casino');
  }
);

router.post('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(err => {
      res.clearCookie('connect.sid');
      res.sendStatus(err ? 500 : 200);
    });
  });
});

module.exports = router;