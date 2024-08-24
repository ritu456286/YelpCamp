const User = require('../models/user');

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register');
}

module.exports.register = async(req, res) =>{
    try{
        const { email, username, password } = req.body;
        const user = new User({email, username});
        const newUser = await User.register(user, password);
        req.login(newUser, err => {
            if(err){
                return next(err);
            }
            req.flash('success', 'Welcome to Yelpcamp!');
            res.redirect('/campgrounds');
        })
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', `Welcome Back ${req.user.username}!`);
    const redirectUrl = res.locals.returnTo || '/campgrounds'; // update this line to use res.locals.returnTo now
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout(function(err){
        if(err){
            return next(err);
        }
        req.flash("success", "Goodbye!");
        res.redirect('/campgrounds');
    })
}