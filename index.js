const express = require('express'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path');

const app = express();

app.use(bodyParser.json());

let movies = [
  {
    id: 1,
    title: 'The Shawshank Redemption',
    descrition: 'Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.',
    genre:'Drama',
    director: {
      title: 'Frank Darabont',
      bio: 'Frank Árpád Darabont is a French-born American film director, screenwriter and producer.',
      birth_year: 1959,
      death_year:'N/A',
    },
    image_URL: 'https://m.media-amazon.com/images/I/51zUbui+gbL._AC_UF894,1000_QL80_.jpg',
  },
  {
    id: 2,
    title: 'The Dark Knight',
    descrition: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    genre:'Action, Crime, Drama',
    director: {
      title: 'Christopher Nolan',
      bio: 'Christopher Edward Nolan CBE is a British and American filmmaker.',
      birth_year: 1970,
      death_year:'N/A',
    },
    image_URL: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg',
  },
];

let users = []

let user_favorites =[]

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

app.use(morgan('combined', {stream: accessLogStream}));

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Gets the list of data about ALL movies

app.get('/movies', (req, res) => {
  res.json(movies);
});
// Gets the data about a single movie, by title

app.get('/movies/:title', (req, res) => {
  res.json(movies.find((movie) =>
    { return movie.title === req.params.title }));
});

// Gets the genre of movie by the title
app.get('/movies/:title/genre', (req, res) => {
  let movie = movies.find((movie) => { return movie.title === req.params.title });

  if (movie) {
    res.json(movie.genre)
  } else {
    res.status(404).send('movie with the title ' + req.params.title + ' was not found.');
  }
});

// Gets information regarding the director of a movie
app.get('/movies/:title/director', (req, res) => {
  let movie = movies.find((movie) => { return movie.title === req.params.title });

  if (movie) {
    res.json(movie.director)
  } else {
    res.status(404).send('movie with the title ' + req.params.title + ' was not found.');
  }
});

// Adds register user using username, date of birth, email and password
app.post('/register', (req, res) => {
  let newuser = req.body;

  if (!newuser.username) {
    const message = 'Missing username in request body';
    res.status(400).send(message);
  } else {
    newuser.id = uuid.v4();
    users.push(newuser);
    res.status(201).send(users);
  }
});
//shows user information

app.get('/users', (req, res) => {
  res.json(users);
});

// Update the user info by the username
app.put('/:username', (req, res) => {
  let user = users.find((user) => { return user.username === req.params.username });
  let update = req.body

  if (user) {
    user.username = update.username
    user.password=update.password
    user.email=update.email
    res.status(201).send('New user information:' + '\n Username: ' + user.username + '\n Password: ' + user.password + '\n Email: ' + user.email);
  } else {
    res.status(404).send('Username: ' + req.params.username + ' was not found.');
  }
});

// Allow users to add a movie to their list of favorites.
app.post('/:username/favorites', (req, res) => {
  let user = users.find((user) => { return user.username === req.params.username });
  let favorite = req.body;

  if (!user) {
    const message = 'Missing username in request body';
    res.status(400).send(message);
  } else {
    user_favorites.push(favorite);
    res.status(201).send(res.json(user_favorites));
  }
});

//all favorites of a user

app.get('/:username/favorites', (req, res) => {
  let user = users.find((user) => { return user.username === req.params.username });

  if (user) {
    res.json(user_favorites);
  }else {
    const message = 'Missing username in request body';
    res.status(400).send(message);
  }
});

// Deletes a movie from our list favourites of user by title.
app.delete('/:username/favorites', (req, res) => {
  let user = users.find((user) => { return user.username === req.params.username });

  if (user) {
    user_favorites = user_favorites.filter((obj) => { return obj.title !== req.params.title });
    res.status(201).send('movie was deleted.');
  }
});

//Allow existing users to deregister
app.delete('/users', (req, res) => {
  let delete_user = req.body;

  if (!delete_user.username) {
    const message = 'Missing username in request body';
    res.status(400).send(message);
  } else {
    users.pop(delete_user);
    res.status(201).send("User deleted");
  }
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080');
});