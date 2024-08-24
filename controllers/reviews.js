const Review = require("../models/review");
const Campground = require("../models/campground");

module.exports.createReview = async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const newReview = await new Review(req.body.review);
    newReview.author = req.user._id;
    campground.reviews.push(newReview);
    await campground.save();
    await newReview.save();
    req.flash('success', 'Successfully added your review!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId }});

    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Successfully deleted your review!');
    res.redirect(`/campgrounds/${req.params.id}`);
}