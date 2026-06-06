import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import EmptyState from "../components/EmptyState";
import SectionHint from "../components/SectionHint";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function BorrowingsPage() {
  const { isLibrarian } = useAuth();
  const toast = useToast();
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  async function loadBorrowings() {
    setLoading(true);
    try {
      const data = await api.listBorrowings();
      setBorrowings(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBorrowings();
  }, []);

  async function handleReturn(id) {
    setActionId(id);
    try {
      await api.returnBook(id);
      toast.success("Book marked as returned");
      await loadBorrowings();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this loan record?")) return;
    setActionId(id);
    try {
      await api.deleteBorrowing(id);
      toast.success("Loan record deleted");
      await loadBorrowings();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionId(null);
    }
  }

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>Borrowings</h2>
          <p className="muted">
            {isLibrarian ? "Operational list with return actions." : "Read-only history of your loans."}
          </p>
        </div>
      </div>

      <SectionHint tone={isLibrarian ? "action" : "info"}>
        {isLibrarian
          ? "Actionable rows: Mark returned / Delete record on the right. Returned loans are read-only."
          : "Read-only list. To borrow, go to Books. Returns are handled by a librarian."}
      </SectionHint>

      {!isLibrarian && (
        <p className="small">
          Need a new book? <Link to="/books">Browse the catalog</Link>
        </p>
      )}

      {loading ? (
        <Spinner label="Loading borrowings..." />
      ) : (
        <div className="stack">
          {borrowings.map((loan) => {
            const isReturned = Boolean(loan.returned_at);
            const busy = actionId === loan.id;

            return (
              <article
                key={loan.id}
                className={`card loan-card ${isLibrarian && !isReturned ? "loan-card--actionable" : "loan-card--readonly"}`}
              >
                <div>
                  <h3>{loan.book.title}</h3>
                  <p className="muted">{loan.book.author}</p>
                  {isLibrarian && <p className="small">Member: {loan.user.name}</p>}
                  <p className="small">
                    Due {new Date(loan.due_at).toLocaleDateString()}
                    {loan.overdue && !isReturned && <span className="badge warn"> overdue</span>}
                    {isReturned && <span className="badge ok"> returned</span>}
                  </p>
                </div>

                {isLibrarian && !isReturned && (
                  <div className="loan-card-actions">
                    <button
                      type="button"
                      className="btn primary"
                      disabled={busy}
                      onClick={() => handleReturn(loan.id)}
                    >
                      {busy ? "Saving..." : "Mark returned"}
                    </button>
                    <button
                      type="button"
                      className="btn danger"
                      disabled={busy}
                      onClick={() => handleDelete(loan.id)}
                    >
                      Delete record
                    </button>
                  </div>
                )}

                {!isLibrarian && <span className="pill pill--readonly">View only</span>}
              </article>
            );
          })}

          {!borrowings.length && (
            <EmptyState title="No borrowings yet" detail="When you borrow a book, it will show up here." />
          )}
        </div>
      )}
    </section>
  );
}
