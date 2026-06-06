import { useAuth } from "../context/AuthContext";
import EmptyState from "./EmptyState";

function borrowStatus(book, borrowingId) {
  if (borrowingId === book.id) {
    return { label: "Requesting...", disabled: true, tone: "info" };
  }
  if (book.user_has_active_loan) {
    return { label: "Already on loan", disabled: true, tone: "warn" };
  }
  if (!book.available) {
    return { label: "No copies left", disabled: true, tone: "warn" };
  }
  return { label: "Borrow", disabled: false, tone: "action" };
}

export default function BookList({ books, onBorrow, onEdit, onDelete, borrowing }) {
  const { isLibrarian, user } = useAuth();

  if (!books.length) {
    return <EmptyState title="No books found" detail="Try another search or ask a librarian to add titles." />;
  }

  return (
    <div className="book-grid">
      {books.map((book) => {
        const memberBorrow = user?.role === "member" ? borrowStatus(book, borrowing) : null;

        return (
          <article
            key={book.id}
            className={`card book-card ${isLibrarian ? "book-card--actionable" : ""}`}
          >
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
              {memberBorrow && (
                <button
                  type="button"
                  className={`btn ${memberBorrow.disabled ? "btn-disabled" : "primary"}`}
                  disabled={memberBorrow.disabled}
                  onClick={() => onBorrow(book.id)}
                >
                  {memberBorrow.label}
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
