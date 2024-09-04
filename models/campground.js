const mongoose = require("mongoose");
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({

    url: String,
    filename: String,

});

// https://res.cloudinary.com/dmax6xlqb/image/upload/w_200/v1725463741/YelpCamp/rnl0xlycorl6tcjlj1lz.png
ImageSchema.virtual("thumbnail").get(function() {
    return this.url.replace('/upload', '/upload/w_200/');
})
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

//delete all the reviews associated with the campground after it has been deleted (could do before also)
//findOneAndDelete is a deletion middleware triggered when the findByIdAndDelete is used
CampgroundSchema.post('findOneAndDelete', async function(doc){
    // console.log(doc);
    if(doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);

