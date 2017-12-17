'use strict';

const express = require('express');
const cors = require('cors');
const pg = require('pg');
const page = require('page');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./book-list-server'));

//Querying the database for books
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
  [title, author, isbn, image_url, description]
)
  .then(() => res.sendStatus(201))
  .catch(console.error);
});

app.get('*', (req, res) => res.redirect(CLIENT_URL));
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// export PORT=3000
// export CLIENT_URL=http://localhost:8080
// export DATABASE_URL=postgres://localhost:5432/books_app
// export DATABASE_URL=postgres://postgres:plokij09@localhost:5432/books_app
