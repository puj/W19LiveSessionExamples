import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'

import booksData from './data/books.json'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-mongo"
mongoose.connect(mongoUrl, {useNewUrlParser: true, useUnifiedTopology: true})
mongoose.Promise = Promise

const Book = mongoose.model('Book', {
  bookID: {
    type: Number
  },
  title: {
    type: String
  },
  authors: {
    type: String
  },
  average_rating: {
    type: Number
  },
  isbn: {
    unique: true,
    type: String
  },
  isbn13: {
    type: String
  },
  language_code: {
    type: String
  },
  num_pages: {
    type: Number
  },
  ratings_count: {
    type: Number
  },
  text_reviews_count: {
    type: Number
  },
  read: {
    type: Boolean,
    default: false
  }
});

// booksData.forEach(book=> {
//     new Book(book).save();
// });


const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(bodyParser.json())

app.post('/books/:isbn/review', async (req, res) => {
  const {isbn} = req.params;
  console.log(`POST /books/${isbn}/review`);
  await Book.updateOne({'isbn': isbn}, {'$inc': {'text_reviews_count': 1}});
  res.status(201).json();
});

app.put('/books/:isbn/read', async (req, res) => {
  const {isbn} = req.params;
  console.log(`PUT /books/${isbn}/read`);
  await Book.updateOne({'isbn': isbn}, {'read': true});
  res.status(201).json();
});

app.get('/books/unread', (req, res) => {
  console.log("GET /books/unread");

  Book.find({'read': false})
    .sort({'num_pages': -1})
    .limit(20)
    .then((results) => {
      // Succesfull
      res.json(results);
    }).catch((err) => {
      // Error/Failure
      console.log('Error ' + err);
      res.json(null);
    });
});

app.get('/books/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  console.log(`GET /books/${isbn}`);
  Book.findOne({'isbn': isbn})
    .then((results) => {
      res.json(results);
    }).catch((err) => {
      res.json({message: 'Cannot find this book', err: err});
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})


async function printNumber(num) {
  console.log(num);
};

const test = async () => {
  printNumber(1);
  printNumber(2);
  printNumber(3);
  printNumber(4);
  printNumber(5);
  printNumber(6);
  printNumber(7);
};

test();

