import { useAuth } from "../context/AuthContext";

export default function BookList({
  books,
  onBorrow,
  onEdit,
  onDelete,
  borrowing,
}) {
  const { isLibrarian, user } = useAuth();

  if (!books.length) {
    return <p className="muted">No books found.</p>;
  }

  return (
    <div className="book-grid">
      {books.map((book) => {
        const canBorrow =
          user?.role === "member" && book.available && borrowing !== book.id;

        return (
          <article key={book.id} className="card book-card">
            <div className="book-card-head">
              <h3>{book.title}</h3>
              <span className={`badge ${book.available ? "ok" : "warn"}`}>
                {book.available_copies}/{book.total_copies} free
              </span>
            </div>
            <p className="muted">{book.author}</p>
            <p>{book.genre}</p>
            <p className="small">ISBN {book.isbn}</p>

            <div className="card-actions">
              {canBorrow && (
                <button type="button" className="btn primary" onClick={() => onBorrow(book.id)}>
                  Borrow
                </button>
              )}
              {isLibrarian && (
                <>
                  <button type="button" className="btn ghost" onClick={() => onEdit(book)}>
                    Edit
                  </button>
                  <button type="button" className="btn danger" onClick={() => onDelete(book.id)}>
                    Delete
                  </button>
                </>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
