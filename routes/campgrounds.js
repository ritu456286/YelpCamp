const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require("../models/campground");
const { campgroundValidationSchema} = require('../schemas');

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

router.get('/', async (req, res) =>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds } );
})

router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})

//SHOW
router.get('/:id', catchAsync(async (req, res, next) =>{
    const {id} = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show', { campground } );
}));

router.get('/:id/edit', catchAsync(async (req, res) =>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}));

router.post('/', validateCampground, catchAsync(async (req, res, next) =>{ 
    const { campground } = req.body;

    //using joi to validate the data, also used bootstrap to validate the client data form

    const newCampground = new Campground(campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
}));

router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, req.body.campground);
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id', catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds');
}));

module.exports = router;