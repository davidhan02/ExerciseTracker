'use strict'

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//Schema/model for each Excercise input
const Exercises = new Schema({
  username: String,
  userId: {
    type: String,
    ref: 'Users',
    index: true // Defining indexes at the schema level is necessary when creating compound indexes.
  },
  description: {
    type: String,
    required: true,
    maxLength: [20, 'Description is too long.']
  },
  duration: {
    type: Number,
    required: true,
    min: [1, 'Duration is too short.']
  },
  date: {
    type: Date,
    default: Date.now
  }
});

//before the save, validate the user's ID and add username to exercise instances
Exercises.pre('save', function(next) {
  mongoose.model('Users').findById(this.userId, (error, data) => {
    if (error) return next(error);
    if (!data) {
      const error = new Error('No matching ID on record');
      error.status = 400;
      return next(error);
    }
    this.username = data.username;
    if (!this.date) {
      this.date = Date.now();
    }
    next();
  })
});
//Export it so that our main module can use this model
module.exports = mongoose.model('Exercises', Exercises);