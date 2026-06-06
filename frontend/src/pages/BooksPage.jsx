import { useEffect, useState } from "react";
import { api } from "../api/client";
import BookForm from "../components/BookForm";
import BookList from "../components/BookList";
import { useAuth } from "../context/AuthContext";

export default function BooksPage() {
  const { isLibrarian } = useAuth();
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [borrowingId, setBorrowingId] = useState(null);

  async function loadBooks(search = query) {
    setLoading(true);
    setError("");
    try {
      const data = await api.listBooks(search);
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  async function handleSearch(event) {
    event.preventDefault();
    await loadBooks(query);
  }

  async function handleCreate(book) {
    await api.createBook(book);
    setShowForm(false);
    await loadBooks();
  }

  async function handleUpdate(book) {
    await api.updateBook(editingBook.id, book);
    setEditingBook(null);
    await loadBooks();
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this book?")) return;
    await api.deleteBook(id);
    await loadBooks();
  }

  async function handleBorrow(bookId) {
    setBorrowingId(bookId);
    setError("");
    try {
      await api.borrowBook(bookId);
      await loadBooks();
    } catch (err) {
      setError(err.message);
    } finally {
      setBorrowingId(null);
    }
  }

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>Books</h2>
          <p className="muted">Search by title, author or genre.</p>
        </div>
        {isLibrarian && (
          <button type="button" className="btn primary" onClick={() => setShowForm(true)}>
            Add book
          </button>
        )}
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          placeholder="Search catalog..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn ghost">
          Search
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Loading books...</p>}

      {showForm && (
        <BookForm submitLabel="Create book" onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {editingBook && (
        <BookForm
          initial={editingBook}
          submitLabel="Update book"
          onSubmit={handleUpdate}
          onCancel={() => setEditingBook(null)}
        />
      )}

      {!loading && (
        <BookList
          books={books}
          onBorrow={handleBorrow}
          onEdit={setEditingBook}
          onDelete={handleDelete}
          borrowing={borrowingId}
        />
      )}
    </section>
  );
}
