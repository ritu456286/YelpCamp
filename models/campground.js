const mongoose = require("mongoose");
const Review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
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

