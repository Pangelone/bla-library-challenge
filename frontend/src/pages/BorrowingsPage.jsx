import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function BorrowingsPage() {
  const { isLibrarian } = useAuth();
  const [borrowings, setBorrowings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadBorrowings() {
    setLoading(true);
    setError("");
    try {
      const data = await api.listBorrowings();
      setBorrowings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBorrowings();
  }, []);

  async function handleReturn(id) {
    try {
      await api.returnBook(id);
      await loadBorrowings();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <div className="section-head">
        <h2>Borrowings</h2>
        <p className="muted">
          {isLibrarian ? "Mark books as returned from here." : "Your active and past loans."}
        </p>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Loading borrowings...</p>}

      <div className="stack">
        {borrowings.map((loan) => (
          <article key={loan.id} className="card loan-card">
            <div>
              <h3>{loan.book.title}</h3>
              <p className="muted">{loan.book.author}</p>
              {isLibrarian && <p className="small">Member: {loan.user.name}</p>}
              <p className="small">
                Due {new Date(loan.due_at).toLocaleDateString()}
                {loan.overdue && <span className="badge warn"> overdue</span>}
                {loan.returned_at && <span className="badge ok"> returned</span>}
              </p>
            </div>
            {isLibrarian && !loan.returned_at && (
              <button type="button" className="btn primary" onClick={() => handleReturn(loan.id)}>
                Mark returned
              </button>
            )}
          </article>
        ))}
        {!loading && !borrowings.length && <p className="muted">No borrowings yet.</p>}
      </div>
    </section>
  );
}
