const express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path');
  mongoose = require('mongoose');
  Models = require('./models.js');
  cors = require('cors');

const { check, validationResult } = require('express-validator');


const Movies = Models.Movie;
const Users = Models.User;

//mongoose.connect('mongodb://localhost:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234', 'https://narekflixapp.netlify.app'];
app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

app.use(morgan('combined', {stream: accessLogStream}));

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Movie API');
});

// Gets the list of data about ALL movies

app.get('/movies',passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
// Gets the data about a single movie, by title

app.get('/movies/:MovieID',passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.find({'id': req.params.MovieID})
    .then((movie_id) => {
      res.status(201).json(movie_id);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Gets info regarding a genre
app.get('/genre/:genre',passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.findOne({ 'Genre.Name': req.params.genre },{Genre: 1})
    .then((genre) => {
      res.status(200).json(genre);
    })
    .catch((err) => {
      res.status(500).send('Error: ' + err);
    });
}
);

// Gets info regarding director
app.get('/director/:director',passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.findOne({ 'Director.Name': req.params.director },{Director: 1})
    .then((director) => {
      res.status(200).json(director);
    })
    .catch((err) => {
      res.status(500).send('Error: ' + err);
    });
}
);



// Adds register user using username, date of birth, email and password
app.post('/users',
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], async (req, res) => {

  // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

  let hashedPassword = Users.hashPassword(req.body.Password);
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});


// Get a user by username
app.get('/users/:username',passport.authenticate('jwt', { session: false }), async (req, res) => {
  if(req.user.Username !== req.params.username){
    return res.status(400).send('Permission denied');
}
// CONDITION ENDS
  await Users.findOne({ Username: req.params.username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Update the user info by the username
app.put('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if(req.user.Username !== req.params.username){
    return res.status(400).send('Permission denied');
}
  await Users.findOneAndUpdate({ Username: req.params.username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  })

});

// Allow users to add a movie to their list of favorites.
app.post('/users/:username/movies/:MovieID',passport.authenticate('jwt', { session: false }),  async (req, res) => {
  if(req.user.Username !== req.params.username){
    return res.status(400).send('Permission denied');
}
  await Users.findOneAndUpdate({ Username: req.params.username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

// Deletes a movie from list favorites of user.
app.delete('/:username/favorites/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if(req.user.Username !== req.params.username){
    return res.status(400).send('Permission denied');
}
  await Users.findOneAndUpdate({ Username: req.params.username }, {
    $pull: { FavoriteMovies: req.params.MovieID }
  },
  { new: true }) // This line makes sure that the updated document is returned

  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  })

});

//Allow existing users to deregister
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if(req.user.Username !== req.params.username){
    return res.status(400).send('Permission denied');
}
  await Users.findOneAndRemove({ Username: req.params.username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.username + ' was not found');
      } else {
        res.status(200).send(req.params.username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});