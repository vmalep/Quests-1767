const authRouter = require('express').Router();
const User = require('../models/user');

authRouter.post('/checkCredentials', (req, res) => {
  const { email, password } = req.body;
  console.log(`Check credentials for ${email} with password: ${password}...`);
  User.findByEmail(email)
    .then((results) => {
      User.verifyPassword(password, results.hashedPassword)
        .then((authenticated) => {
          console.log('authenticated: ' + authenticated);
          if(authenticated) res.status(200).json('authenticated')
          else res.status(400).json('rejected');
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(401).send('Error retrieving users from database');
    });
});

module.exports = authRouter;
