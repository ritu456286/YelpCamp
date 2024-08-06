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
    await Campground.deleteMany({});
    const randomTitle = (array) => array[Math.floor(Math.random() * array.length)];

    for(let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            title: `${randomTitle(descriptors)} ${randomTitle(places)}`,
            location : `${cities[random1000].city}, ${cities[random1000].state}`
        });
        await camp.save();
    }    
}

seedDB().then(() => mongoose.connection.close());