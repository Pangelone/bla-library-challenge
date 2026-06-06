import { useEffect, useState } from "react";
import { api } from "../api/client";
import BookForm from "../components/BookForm";
import BookList from "../components/BookList";
import SectionHint from "../components/SectionHint";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function BooksPage() {
  const { isLibrarian } = useAuth();
  const toast = useToast();
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [borrowingId, setBorrowingId] = useState(null);

  async function loadBooks(search = query, withSearchSpinner = false) {
    if (withSearchSpinner) {
      setSearching(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await api.listBooks(search);
      setBooks(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  async function handleSearch(event) {
    event.preventDefault();
    await loadBooks(query, true);
  }

  async function handleCreate(book) {
    await api.createBook(book);
    setShowForm(false);
    toast.success("Book added to the catalog");
    await loadBooks();
  }

  async function handleUpdate(book) {
    await api.updateBook(editingBook.id, book);
    setEditingBook(null);
    toast.success("Book updated");
    await loadBooks();
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this book?")) return;
    try {
      await api.deleteBook(id);
      toast.success("Book removed");
      await loadBooks();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleBorrow(bookId) {
    setBorrowingId(bookId);
    try {
      await api.borrowBook(bookId);
      toast.success("Book borrowed — check your dashboard for the due date");
      await loadBooks();
    } catch (err) {
      toast.error(err.message);
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

      <SectionHint tone={isLibrarian ? "action" : "info"}>
        {isLibrarian
          ? "Actionable: use Edit / Delete on each card. Members borrow from the blue button."
          : "Actionable: only the Borrow button. Gray labels mean you already have the book or it is out of stock."}
      </SectionHint>

      <form className="search-bar card card--flat" onSubmit={handleSearch}>
        <input
          placeholder="Search catalog..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn ghost" disabled={searching}>
          {searching ? "Searching..." : "Search"}
        </button>
      </form>

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

      {loading ? (
        <Spinner label="Loading catalog..." />
      ) : (
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
