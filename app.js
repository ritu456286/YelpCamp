const express = require("express");
const path = require('path');
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const campgroundsRouter = require('./routes/campgrounds');
const reviewsRouter = require('./routes/reviews');
const usersRouter = require('./routes/users');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error"));
db.once('open', () =>{
    console.log('database connected!');
})

const app = express();

// use ejs-locals for all ejs templates: allows for boilerplates
app.engine('ejs', ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
const sessionConfig = {
    secret: 'thisissecret', 
    saveUninitialized: true, 
    resave: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 6* 60 * 24 *7,
        maxAge:  1000 * 6* 60 * 24 *7,
    }
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())) //use Local strategy and apply the method on user model i.e. authenticate - provide by passport-local-mongoose

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/campgrounds', campgroundsRouter); //prefixing the campgrounds router with /campgrounds
app.use('/campgrounds/:id/reviews', reviewsRouter);
app.use('/', usersRouter);

app.get('/', (req, res) =>{
    res.render('home');
});


app.all('*', (req, res, next) => {
    next(new ExpressError("Page not found", 404));
})

//error handling middleware
app.use((err, req, res, next) => {
    const { statusCode = 500} = err;
    if(!err.message) err.message = "Something went wrong";
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () =>{
    console.log("Listening on port 3000");
})