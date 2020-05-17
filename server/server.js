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

const Review = mongoose.model("Review", {
  review: {
    type: String,
  },
  book: {
    type: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
  },
  likes: {
    type: Number,
    default: 0,
  },
});

if (process.env.RESET_DATABASE) {
  const seedDatabase = async () => {
    await Book.deleteMany();
    await Review.deleteMany();

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

app.post("/books/:isbn/review", async (req, res) => {
  const { isbn } = req.params;
  const review = req.body;

  console.log(`POST /books/${isbn}/review`);
  await Book.updateOne({ isbn: isbn }, { $inc: { text_reviews_count: 1 } });
  await new Review({ review: review.review, book: review.book }).save();
  // await new Review(review).save();
  res.status(201).json();
});

app.put("/books/:isbn/read", async (req, res) => {
  const { isbn } = req.params;
  console.log(`PUT /books/${isbn}/read`);
  await Book.updateOne({ isbn: isbn }, { read: true });
  res.status(201).json();
});

app.get("/books/unread", async (req, res) => {
  console.log("GET /books/unread");

  const unreadBooks = await Book.find({ read: false })
    .sort({ num_pages: -1 })
    .limit(20);

  // Should there be an error here?
  res.status(200).json(unreadBooks);
});

app.get("/books/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  console.log(`GET /books/${isbn}`);
  const book = await Book.findOne({ isbn: isbn });
  if (book) {
    res.status(200).json(results);
  } else {
    res.status(404).json({ message: ERR_CANNOT_FIND_ISBN, err: err });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
