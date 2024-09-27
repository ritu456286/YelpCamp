if(process.env.NODE_ENV !== "production")
{
    require("dotenv").config();
}

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
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const dbConnUrl =  process.env.DB_CONN_URL || 'mongodb://127.0.0.1:27017/yelp-camp';

mongoose.connect(dbConnUrl);

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

const secret = process.env.SECRET || 'thisshouldbeabettersecret';

const store = MongoStore.create({
    mongoUrl: dbConnUrl,
    touchAfter: 24*60*60, //in seconds
    crypto: {
        secret,
    }
});

const sessionConfig = {
    store,
    name: 'session',
    secret, 
    // secure: true
    saveUninitialized: true, 
    resave: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 6* 60 * 24 *7, //in ms
        maxAge:  1000 * 6* 60 * 24 *7, //in ms
    }
};
app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet());
//configuring allowed urls in HELMET
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
    "https://api.maptiler.com/", // add this
];
const fontSrcUrls = [];
app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'self'", "'unsafe-inline'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          objectSrc: ["'none'"],
          imgSrc: [
            "'self'",
            "blob:",
            "data:",
            "https://res.cloudinary.com/dmax6xlqb/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
            "https://images.unsplash.com/",
        ],
          upgradeInsecureRequests: [],
          fontSrc: ["'self'", ...fontSrcUrls],
        },
      },
    })
  );

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())) //use Local strategy and apply the method on user model i.e. authenticate - provide by passport-local-mongoose


// To prevent noSQL injection
app.use(mongoSanitize());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    // console.log(req.query);
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

const port = process.env.PORT || 3000;

app.listen(port, () =>{
    console.log(`Listening on port ${port}`);
})