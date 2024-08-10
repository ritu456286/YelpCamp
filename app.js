const express = require("express");
const path = require('path');
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
// const Joi = require('joi');
const { campgroundValidationSchema } = require('./schemas');
const Campground = require("./models/campground");

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error"));
db.once('open', () =>{
    console.log('database connected!');
})

const app = express();

// use ejs-locals for all ejs templates:
app.engine('ejs', engine);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));


//defining custom middleware[a function that u want to apply before res and after req]
const validateCampground = (req, res, next) => {
    
    const { error, value } = campgroundValidationSchema.validate(req.body);
    // console.log(msg);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);      
    }else{
        //if everything is fine, call the next middleware, absolutely necessary, else this will keep us stuck here in this middleware only
        next();

    }
}


app.get('/', (req, res) =>{
    res.render('home');
});

app.get('/campgrounds', async (req, res) =>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds } );
})

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

//SHOW
app.get('/campgrounds/:id', catchAsync(async (req, res, next) =>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', { campground } );
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) =>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}));

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) =>{ 
    const { campground } = req.body;

    //using joi to validate the data, also used bootstrap to validate the client data form

    const newCampground = new Campground(campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, req.body.campground);
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds');
}));

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