const Users = require('../models/users')
const Exercises = require('../models/exercises')

const router = require('express').Router()

//if url ends wih new-user, then post new user object to the database
// then post a json object showing the username and id for that username
router.post('/new-user', (req, res, next) => { // get input from body form and assign to schema for new user
  const user = new Users(req.body);
  user.save((error, newUser) => {
    if(error) {
      if(error.code == 11000) { // unique error code with no custom message
        return next({
          status: 400,
          message: 'That username is already in use. Please choose another.'
        })
      } else {
        return next(error);
      }
    }
    res.json({
      username: newUser.username,
      _id: newUser._id
    })
  })
});

//if url ends in /add, find the corresponding user id in database and add that username
// to the new exercise object added to the database
router.post('/add', (req, res, next) => {
  Users.findById(req.body.userId, (error, user) => {
    if(error) throw error;
    if(!user) {
      return next({
        status: 400,
        message: 'There is no matching ID on record'
      })
    };
    const exercise = new Exercises(req.body); // get input from body form and assign to schema for excercise
    exercise.username = user.username;
    exercise.save((error, newExercise) => {
      if(error) throw error;
      newExercise = newExercise.toObject();
      newExercise._id = newExercise.userId;
      delete newExercise.__v; // delete unnecessary parameters from the overall output
      delete newExercise.userId;
      newExercise.date = (new Date(newExercise.date)).toDateString();
      res.json(newExercise);
    })
  })
});

//finds and posts users database information
router.get('/users', (req, res, next) => {
  Users.find({}, (error, data) => {res.json(data)})
});

//finds and posts exercises database information
router.get('/exercises', (req, res, next) => {
  Exercises.find({}, (error, data) => {res.json(data)})
});

// full exercise log of any user by getting /api/exercise/log with a parameter of userId(_id). 
router.get('/log', (req, res, next) => {
  let userId = req.query.userId;
  const from = new Date(req.query.from)
  const to = new Date(req.query.to)
  
  Users.findById(userId, (error, user) => {
    if(error) throw error;
    if(!user) {
      return next({
        status:400, 
        message: 'No matching userId on record.'
      })
    };
    Exercises.find({
      userId: userId,
        date: {
          // 'less than' for the format of date
          $lt: to != 'Invalid Date' ? to.getTime() : Date.now() ,
          // 'greater than' for the format of date
          $gt: from != 'Invalid Date' ? from.getTime() : 0
        }
      }, {
        __v: 0, //set v and _id to zero
        _id: 0
      })
    .sort('-date') //Sorting the results by date
    .limit(parseInt(req.query.limit)) // make limit into integer and set that as the limit
    .exec((error, exercises) => {
      if (error) throw error;
      const output = { // formatting of output object
          _id: userId,
          username: user.username,
          from : from != 'Invalid Date' ? from.toDateString() : undefined,
          to : to != 'Invalid Date' ? to.toDateString(): undefined,
          count: exercises.length,
          log: exercises.map(item => ({
            description : item.description,
            duration : item.duration,
            date: item.date.toDateString()
          })
        )
      }
      res.json(output); //return json output
    });
  })
});

//Export it so that our main module can use this 
module.exports = router;
