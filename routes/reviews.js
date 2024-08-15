const express = require('express');
const router = express.Router({mergeParams: true});

const { reviewValidationSchema } = require('../schemas');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const Review = require("../models/review");
const Campground = require("../models/campground");


const validateReview = (req, res, next) => {

    const { error, value } = reviewValidationSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }else{
        next();
    }
}

//delete a review
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const {id, reviewId} = req.params;
    // const campground = await Campground.findById(req.params.id);
    // campground.reviews.filter(review => review.toString() != req.params.reviewId);
    // await campground.save();

    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId }});

    await Review.findByIdAndDelete(req.params.reviewId);
    res.redirect(`/campgrounds/${req.params.id}`);
}));



//saving new reviews
router.post('/', validateReview, catchAsync(async(req, res) => {
    const newReview = await new Review(req.body.review);
    const campground = await Campground.findById(req.params.id);
    campground.reviews.push(newReview);
    await campground.save();
    await newReview.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

module.exports = router;