const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users')

router.route("/register")
    //register Form
    .get(users.renderRegisterForm)
    //register new user
    .post(catchAsync(users.register))

router.route('/login')
    //login form
    .get(users.renderLoginForm)
    //login user
    .post(
    // use the storeReturnTo middleware to save the returnTo value from session to res.locals
    storeReturnTo,
    // passport.authenticate logs the user in and clears req.session
    passport.authenticate('local', { failureFlash: true, failureRedirect: '/login'}),
    users.login
);


//logout
router.get('/logout', users.logout)

module.exports = router;