const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require('./cities');
const {places, descriptors} = require('./seedsHelper');
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error"));
db.once('open', () =>{
    console.log('database connected!');
})

const seedDB = async () =>{
    await Campground.deleteMany({}); //delete previous campgrounds data
    const randomTitle = (array) => array[Math.floor(Math.random() * array.length)];

    for(let i = 0; i < 200; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '66bf8e5e7329175c35808317', //meena is the author
            title: `${randomTitle(descriptors)} ${randomTitle(places)}`,
            
            location : `${cities[random1000].city}, ${cities[random1000].state}`,
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            price,
            geometry: {
              type: "Point",
              coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude,
              ]
            },
            images:  [
                {
                  url: 'https://res.cloudinary.com/dmax6xlqb/image/upload/v1725720353/YelpCamp/mgkserve1z4eqbjpcw5f.jpg',

                  filename: 'YelpCamp/gcqsoqm3jwz4qbmyau4d',
                  
                }
              ],
        });
        await camp.save();
    }    
}

seedDB().then(() => mongoose.connection.close());