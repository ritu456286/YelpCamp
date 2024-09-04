const ExpressError = require('./utils/ExpressError');
const { campgroundValidationSchema, reviewValidationSchema } = require('./schemas');
const Campground = require("./models/campground");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        //store the current url to the session
        req.session.returnTo = req.originalUrl; 
        req.flash('error', 'You must be Logged in!');
        return res.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if(req.session.returnTo){
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

//defining custom middleware[a function that u want to apply before res and after req]
module.exports.validateCampground = (req, res, next) => {
    
    const { error, value } = campgroundValidationSchema.validate(req.body);
    console.log(req.body);
    // console.log(msg);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);      
    }else{
        //if everything is fine, call the next middleware, absolutely necessary, else this will keep us stuck here in this middleware only
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error', "You are not allowed to do that!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error', "You are not allowed to do that!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {

    const { error, value } = reviewValidationSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }else{
        next();
    }
}