import React, { useEffect, useState } from "react";
import prompt from "prompt-sync";
import "index.css";

export const App = () => {
  const [books, setBooks] = useState([]);

  // Get all the unread books from the API
  const fetchUnreadBooks = () => {
    console.log("Fetching unread books");
    fetch("http://localhost:8080/books/unread")
      .then((res) => res.json())
      .then((json) => setBooks(json));
  };

  const readBook = async (isbn) => {
    console.log(`Reading book : ${isbn}`);
    await fetch(`http://localhost:8080/books/${isbn}/read`, { method: "PUT" });
    console.log("Finished reading book");
    fetchUnreadBooks();
  };

  const reviewBook = async (review, book) => {
    console.log(`Reviewing book : ${book.title}`);
    await fetch(`http://localhost:8080/books/${book.isbn}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ review, book, likes: 1000 }),
      // body: JSON.stringify({ review, book }),
    });
    console.log("Finished reviewing book");
    fetchUnreadBooks();
  };

  useEffect(() => {
    fetchUnreadBooks();
  }, []);

  return (
    <div>
      <main>
        <div>
          {books.map((book) => {
            return (
              <div>
                <p>
                  {book.title} : {book.text_reviews_count}
                </p>
                <button
                  type="button"
                  id={book.isbn}
                  onClick={(e) => {
                    readBook(book.isbn);
                  }}
                >
                  Read
                </button>
                <button
                  type="button"
                  id={book.isbn}
                  onClick={(e) => {
                    const review = window.prompt(`Review: ${book.title}`);
                    reviewBook(review, book);
                  }}
                >
                  Review
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
