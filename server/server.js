import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";

import booksData from "./data/books.json";

const ERR_CANNOT_FIND_ISBN = "Cannot find book";

const mongoUrl =
  process.env.MONGO_URL || "mongodb://localhost/WK19PostRequests";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Today's agenda
// - Endpoint order
// - Increments, operators
// - Multiple query parameters for sort *
// - Models vs. Schemas *
// - Deploy current project

const Book = mongoose.model("Book", {
  bookID: {
    type: Number,
  },
  title: {
    type: String,
  },
  authors: {
    type: String,
  },
  average_rating: {
    type: Number,
  },
  isbn: {
    unique: true,
    type: String,
  },
  isbn13: {
    type: String,
  },
  language_code: {
    type: String,
  },
  num_pages: {
    type: Number,
  },
  ratings_count: {
    type: Number,
  },
  text_reviews_count: {
    type: Number,
  },
  read: {
    type: Boolean,
    default: false,
  },
});

const reviewSchema = {
  review: {
    type: String,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
  },
  likes: {
    type: Number,
    default: 0,
  },
};
const Review = mongoose.model("Review", reviewSchema);

// Create the review model

if (process.env.RESET_DATABASE) {
  const seedDatabase = async () => {
    await Book.deleteMany();
    // Review.deleteMany()

    await booksData.forEach((book) => {
      new Book(book).save();
    });
  };
  seedDatabase();
}

const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(bodyParser.json());

app.get("/books", async (req, res) => {
  const sortField = req.query.sortField;
  const sortOrder = req.query.sortOrder || "asc";
  const limit = req.query.limit;

  console.log(
    `GET /books?sortField=${sortField}&sortOrder=${sortOrder}&limit=${limit}`
  );

  // Create the initial query
  let query = Book.find();

  if (sortField) {
    query = query.sort({ [sortField]: sortOrder === "asc" ? 1 : -1 });
  }

  if (limit) {
    query = query.limit(+limit);
  }

  // Actually executes the sort
  const results = await query;

  res.status(200).json(results);
});

app.put("/books/:isbn", async (req, res) => {
  const { isbn } = req.params;
  const field = req.query.field;
  const value = req.query.value;

  console.log(`PUT /books/${isbn}/review?field=${field}&value=${value}`);
  const updatedBook = await Book.updateOne(
    { isbn: isbn },
    { $set: { [field]: value } }
  );
  res.status(201).json(updatedBook);
});

app.post("/books/:isbn/review", async (req, res) => {
  const { isbn } = req.params;
  const review = req.body;

  console.log(`POST /books/${isbn}/review`);
  await Book.updateOne({ isbn: isbn }, { $inc: { text_reviews_count: 1 } });
  await new Review({ review: review.review, book: review.book }).save();
  // await new Review(review).save();
  res.status(201).json();
});

app.get("/books/unread", async (req, res) => {
  console.log("GET /books/unread");

  const unreadBooks = await Book.find({ read: false })
    .sort({ num_pages: -1 })
    .limit(20);

  res.status(200).json(unreadBooks);
});

app.put("/books/:isbn/read", async (req, res) => {
  const { isbn } = req.params;
  console.log(`PUT /books/${isbn}/read`);
  await Book.updateOne({ isbn: isbn }, { read: true });
  res.status(201).json();
});

app.get("/books/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  console.log(`GET /books/${isbn}`);
  console.log(`ISBN: ${isbn}`);
  const book = await Book.findOne({ isbn });
  if (book) {
    res.status(200).json(book);
  } else {
    res.status(404).json({ message: ERR_CANNOT_FIND_ISBN });
  }
});

// PUT marks a book as read
app.put("/books/:isbn/read", async (req, res) => {
  const { isbn } = req.params;
  console.log(`PUT /books/${isbn}/read`);
  await Book.updateOne({ isbn: isbn }, { read: true });
  res.status(201).json();
});

// POST posts a review for a certain book
app.post("/books/:isbn/review", async (req, res) => {
  const { isbn } = req.params;
  // "{ review: 'Great', book: '5ec237b2fb7dbe3b80ad04dc', likes: 1000 }"
  const { review, book } = req.body; // JSON data

  console.log(`POST /books/${isbn}/review`);
  await Book.updateOne({ isbn: isbn }, { $inc: { text_reviews_count: 1 } });
  await new Review({ review, book }).save();
  // await new Review(review).save();

  res.status(201).json();
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
