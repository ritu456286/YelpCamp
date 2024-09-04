const cloudinary = require('cloudinary').v2;
// const { closeDelimiter } = require('ejs');
// const { model } = require('mongoose');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Return "https" URLs by setting secure: true
cloudinary.config({
    secure: true, 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY ,
    api_secret: process.env.CLOUDINARY_SECRET
  });

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'YelpCamp',
      allowedFormats: ['jpeg', 'png', 'jpg']
    //   format: async (req, file) => 'png', // supports promises as well
    //   public_id: (req, file) => 'computed-filename-using-request',
    },
  });

  module.exports = {
    cloudinary, 
    storage
  }