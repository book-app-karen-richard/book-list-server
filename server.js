'use strict';

const express = require('express');
const cors = require('cors');
const pg = require('pg');
const bodyParser = require('body-parser').urlencoded({extended: true});
const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

const client = new pg.Client(process.env.DATABASE_URL);

const API_KEY = process.env.API_KEY;

client.connect();
client.on('error', err => console.error(err));

app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));
// app.use(express.static('./book-list-server'));


app.get('/api/v1/books', (req, res) => {
  client.query(`SELECT book_id, title, author, image_url, isbn FROM books;`)
  .then(results => res.send(results.rows))
  .catch(console.error);
});

app.get('/api/v1/books/:book_id', (req, res) => {

  client.query(`SELECT * FROM books WHERE book_id=${req.params.book_id}`)
  .then(results => res.send(results.rows))
  .catch(console.error);
});

app.post('/api/v1/books', bodyParser, (req, res) => {
  console.log('create query');
  let {title, author, isbn, image_url, description} = req.body;
  client.query(`
    INSERT INTO books(title, author, isbn, image_url, description) VALUES($1, $2, $3, $4, $5)`,
  [ title, author, isbn, image_url, description]
)
  .then(() => res.sendStatus(201))
  .catch(console.error);
});


app.get('/api/v1/books/find', (req, res) => {
  let url = 'https://www.googleapis.com/books/v1/volumes';
  let query = '';
  if (req.query.title) query += `+intitle${req.query.title}`;
  if (req.query.author) query += `+intitle${req.query.author}`;
  if (req.query.isbn) query += `+intitle${req.query.isbn}`;

  superagent.get(url)
    .query({'q': query})
    .query({'key': API_KEY})
    .then (response => response.body.items.map((book, idx) => {
      let {title, authors, industryIdentifiers, imageLinks, description} = book.volumeInfo;
      let placeholderImage = 'http://www.newyorkpaddy.com/images/covers/NoCoverAvailable.jpg';

      return {
      title: title ? title : 'No title available',
      author: authors ? authors[0] : 'No authors available',
      isbn: industryIdentifiers ? `ISBN 13 ${industryIdentifiers[0].identifier}` : 'No ISBN available.',
      image_url: imageLinks ? imageLinks.smallThumbnail : placeholderImage,
      description: description ? description : 'No description available.',
      book_id: industryIdentifiers ? `${industryIdentifiers[0].identifier}` : '',
      }
    }))
    .then (arr => res.send(arr))
    .catch(console.error)
    })

app.get('/api/v1/books/find/:isbn', (req, res) =>> {
  // This is where the search for one book would go.
}

app.get('*', (req, res) => res.redirect(CLIENT_URL));
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

export PORT=3000
export CLIENT_URL=http://localhost:8080
export DATABASE_URL=postgres://localhost:5432/books_app
export GOOGLE_API_KEY = AIzaSyBups3RAVhoUkeFYOjU0yVWaI-Dl9RxFVE
// export DATABASE_URL=postgres://postgres:plokij09@localhost:5432/books_app
