const { cloudinary } = require("../cloudinary");
const Campground = require("../models/campground");

module.exports.index = async (req, res) =>{
    const campgrounds = await Campground.find({});
    // console.log(campgrounds);
    // for(let camp of campgrounds){
    //     console.log(camp.images[0].url);
    // }
    res.render('campgrounds/index', { campgrounds } );
    res.send("hello");
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) =>{ 

    
    const { campground } = req.body;
    const newCampground = new Campground(campground);
    newCampground.images = req.files.map(file => ({url: file.path, filename: file.filename}));
    //using joi to validate the data, also used bootstrap to validate the client data form

    newCampground.author = req.user._id;
    await newCampground.save();
    console.log(newCampground);
    req.flash("success", 'successfully made the campground');
    res.redirect(`/campgrounds/${newCampground._id}`);
}

module.exports.showCampground = async (req, res, next) =>{
    const {id} = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author',
        }
    }).populate('author');
    if(!campground){
        req.flash('error', 'Cannot find the campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground } );
}

module.exports.renderEditForm = async (req, res) =>{
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error', 'Cannot find the campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground);
    // console.log(campground);
    const imagesArray = req.files.map(file => ({url: file.path, filename: file.filename}));
    campground.images.push(...imagesArray);
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            //removing images from cloudinary
            await cloudinary.uploader.destroy(filename);
        }
        //removing images from mongoDB
        await campground.updateOne({ $pull: { images: { filename : { $in: req.body.deleteImages }}}});
        // console.log(campground);
    }
    req.flash('success', 'successfully updated the campground');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted the campground!');
    res.redirect('/campgrounds');
}