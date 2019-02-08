const mongoose = require('mongoose');
const shortid = require('shortid');

const Schema = mongoose.Schema;

//Creating the template for each User input
var Users = new Schema({
  username: {
    type: String,
    required: true,
    unique: true, //Can't be the same user as existing
    maxLength: [15, 'Username is too long.'] // setting length parameter
  },
  _id: {
    type: String,
    index: true, // Defining indexes at the schema level is necessary when creating compound indexes.
    default: shortid.generate
  }
});
//Export it so that our main module can use this model
module.exports = mongoose.model('Users', Users);