const express = require("express");
const path = require('path');
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
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

app.use('/campgrounds', campgrounds); //prefixing the campgrounds router with /campgrounds
app.use('/campgrounds/:id/reviews', reviews);

app.get('/', (req, res) =>{
    res.render('home');
});

app.all('*', (req, res, next) => {
    next(new ExpressError("Page not found", 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500} = err;
    if(!err.message) err.message = "Something went wrong";
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () =>{
    console.log("Listening on port 3000");
})