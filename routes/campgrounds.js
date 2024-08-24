const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const campgrounds = require('../controllers/campground');


router.route('/')
    //all campgrounds - index
    .get(catchAsync(campgrounds.index))
    //create new campground
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

//new form
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    //SHOW page
    .get(catchAsync(campgrounds.showCampground))
    //update campground
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.upateCampground))
    //delete campground
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))


//edit form
router.get('/:id/edit', 
    isLoggedIn, 
    isAuthor, 
    catchAsync(campgrounds.renderEditForm));


module.exports = router;