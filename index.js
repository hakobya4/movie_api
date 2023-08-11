const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path');

const app = express();
let top10Movies = [
  {
    title: '1. The Godfather'
  },
  {
    title: '2. The Dark Knight'
  },
  {
    title: '3. Forrest Gump'
  },
  {
    title: '4. The Shawshank Redemption'
  },
  {
    title: '5. Titanic'
  },
  {
    title: '6. Pulp Fiction'
  },
  {
    title: '7. Schindler\'s List'
  },
  {
    title: '8. The Godfather Part II'
  },
  {
    title: '9. 12 Angry Men'
  },
  {
    title: '10. Citizen Kane'
  },
];

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

app.use(morgan('combined', {stream: accessLogStream}));

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to my book club!');
});

app.get('/movies', (req, res) => {
  res.json(top10Movies);
});


// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
