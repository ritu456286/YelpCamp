const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const campgrounds = require('../controllers/campground');
// console.log(campgrounds);
const multer  = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    //all campgrounds - index
    .get(catchAsync(campgrounds.index))
    //create new campground
    .post(isLoggedIn, upload.array('images'), validateCampground, catchAsync(campgrounds.createCampground))
//new form
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    //SHOW page
    .get(catchAsync(campgrounds.showCampground))
    //update campground
    .put(isLoggedIn, isAuthor, upload.array('images'), validateCampground, catchAsync(campgrounds.updateCampground))
    //delete campground
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))


//edit form
router.get('/:id/edit', 
    isLoggedIn, 
    isAuthor, 
    catchAsync(campgrounds.renderEditForm));


module.exports = router;