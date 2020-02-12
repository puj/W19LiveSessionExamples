import React, {useEffect, useState} from 'react'
import 'index.css'


export const App = () => {
  const [books, setBooks] = useState([])

  // Get all the unread books from the API
  const fetchUnreadBooks = () => {
    console.log("Fetching unread books");
    fetch("http://localhost:8080/books/unread")
      .then(res => res.json())
      .then(json => setBooks(json))
  }

  const readBook = async (isbn) => {
    console.log(`Reading book : ${isbn}`);
    await fetch(`http://localhost:8080/books/${isbn}/read`, {method: "PUT"})
    console.log("Finished reading book");
    fetchUnreadBooks();
  };

  const reviewBook = async (isbn) => {
    console.log(`Reviewing book : ${isbn}`);
    await fetch(`http://localhost:8080/books/${isbn}/review`, {method: "POST"})
    console.log("Finished reviewing book");
    fetchUnreadBooks();
  };


  useEffect(() => {
    fetchUnreadBooks();
  }, [])

  return (
    <div>
      <main>
        <div>
          {books.map(book => {
            return (
              <div>
                <p>{book.title} : {book.text_reviews_count}</p>
                <button type="button" id={book.isbn} onClick={e => {readBook(book.isbn)}} >Read</button>
                <button type="button" id={book.isbn} onClick={e => {reviewBook(book.isbn)}} >Review</button>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}