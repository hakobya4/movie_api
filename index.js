const express = require('express'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path');
  mongoose = require('mongoose');
  Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(bodyParser.json());

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

app.use(morgan('combined', {stream: accessLogStream}));

app.use(express.static('public'));


// Gets the list of data about ALL movies

app.get('/movies', async (req, res) => {
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

app.get('/movies/:title', async (req, res) => {
  await Movies.find({Title: req.params.title})
    .then((movie_title) => {
      res.status(201).json(movie_title);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Gets movies by their genre
app.get('/movies/genre/:genre', async (req, res) => {
    await Movies.find({ 'Genre.Name': req.params.genre })
      .then((movies_genre) => {
        res.status(200).json(movies_genre);
      })
      .catch((err) => {
        res.status(500).send('Error: ' + err);
      });
  }
);

// Gets info regarding a genre
app.get('/genre/:genre', async (req, res) => {
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
app.get('/director/:director', async (req, res) => {
  await Movies.findOne({ 'Director.Name': req.params.director },{Director: 1})
    .then((director) => {
      res.status(200).json(director);
    })
    .catch((err) => {
      res.status(500).send('Error: ' + err);
    });
}
);


// Gets information regarding the director of a movie by title
app.get('/movies/:title/director', async (req, res) => {
  await Movies.findOne({ Title : req.params.title },{Director: 1})
    .then((movie_director) => {
      res.status(200).json(movie_director);
    })
    .catch((err) => {
      res.status(500).send('Error: ' + err);
    });
}
);

// Adds register user using username, date of birth, email and password
app.post('/users', async (req, res) => {
  await Users.findOne({ Name: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.username + 'already exists');
      } else {
        Users
          .create({
            Name: req.body.Username,
            Password: req.body.Password,
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
// Get all users
app.get('/users', async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
// Get a user by username
app.get('/users/:username', async (req, res) => {
  await Users.findOne({ Name: req.params.username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Update the user info by the username
app.put('/users/:username/update', async (req, res) => {
  await Users.findOneAndUpdate({ Name: req.params.username }, { $set:
    {
      Name: req.body.Name,
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
app.post('/users/:username/movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate({ Name: req.params.username }, {
     $push: { Favorites: req.params.MovieID }
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

//all favorites of a user

app.get('/users/:username/favorites', async (req, res) => {
  await Users.findOne({ Name: req.params.username })
    .then((user) => {
      if (user) {
        res.json(user.Favorites);
      }else {
        const message = 'Missing username in request body';
        res.status(400).send(message);
      }
})});

// Deletes a movie from list favorites of user.
app.delete('/:username/favorites/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate({ Name: req.params.username }, {
    $pull: { Favorites: req.params.MovieID }
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
app.delete('/users/:username', async (req, res) => {
  await Users.findOneAndRemove({ Name: req.params.username })
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

app.listen(8080, () => {
  console.log('Your app is listening on port 8080');
});