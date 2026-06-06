import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import EmptyState from "../components/EmptyState";
import SectionHint from "../components/SectionHint";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function StatCard({ label, value }) {
  return (
    <div className="card stat-card">
      <p className="muted">{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

export default function DashboardPage() {
  const { isLibrarian } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const payload = isLibrarian ? await api.librarianDashboard() : await api.memberDashboard();
        setData(payload);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isLibrarian]);

  if (loading) {
    return <Spinner label="Loading dashboard..." />;
  }

  if (!data) {
    return <EmptyState title="Dashboard unavailable" detail="Try refreshing the page." />;
  }

  if (isLibrarian) {
    return (
      <section>
        <div className="section-head">
          <h2>Librarian dashboard</h2>
          <p className="muted">Summary only — actions live under Borrowings.</p>
        </div>

        <SectionHint tone="info">
          Read-only overview. To return a book, open Borrowings and use Mark returned.
        </SectionHint>

        <div className="stats-grid">
          <StatCard label="Total books" value={data.total_books} />
          <StatCard label="Currently borrowed" value={data.total_borrowed} />
          <StatCard label="Due today" value={data.due_today.length} />
          <StatCard label="Members overdue" value={data.overdue_members.length} />
        </div>

        <div className="split">
          <div>
            <h3>Due today</h3>
            <div className="stack">
              {data.due_today.map((item) => (
                <article key={item.id} className="card loan-card loan-card--readonly">
                  <strong>{item.book.title}</strong>
                  <p className="small">{item.user.name}</p>
                  <span className="pill pill--readonly">Info only</span>
                </article>
              ))}
              {!data.due_today.length && <EmptyState title="Nothing due today" />}
            </div>
          </div>

          <div>
            <h3>Overdue members</h3>
            <div className="stack">
              {data.overdue_members.map((entry) => (
                <article key={entry.user.id} className="card loan-card loan-card--readonly">
                  <strong>{entry.user.name}</strong>
                  <p className="small">{entry.overdue_count} overdue book(s)</p>
                  <span className="pill pill--readonly">Info only</span>
                </article>
              ))}
              {!data.overdue_members.length && <EmptyState title="No overdue members" />}
            </div>
          </div>
        </div>

        <Link className="btn primary inline-link" to="/borrowings">
          Go to Borrowings
        </Link>
      </section>
    );
  }

  return (
    <section>
      <div className="section-head">
        <h2>My dashboard</h2>
        <p className="muted">Read-only snapshot of your loans.</p>
      </div>

      <SectionHint tone="info">
        This page is informational. To borrow more books, go to Books. You cannot return from here.
      </SectionHint>

      <div className="stats-grid">
        <StatCard label="Active loans" value={data.borrowed_books.length} />
        <StatCard label="Overdue" value={data.overdue_books.length} />
      </div>

      <h3>Current loans</h3>
      <div className="stack">
        {data.borrowed_books.map((loan) => (
          <article key={loan.id} className="card loan-card loan-card--readonly">
            <strong>{loan.book.title}</strong>
            <p className="small">
              Due {new Date(loan.due_at).toLocaleDateString()}
              {loan.overdue && <span className="badge warn"> overdue</span>}
            </p>
            <span className="pill pill--readonly">View only</span>
          </article>
        ))}
        {!data.borrowed_books.length && (
          <EmptyState title="No active loans" detail="Browse the catalog to borrow your first book." />
        )}
      </div>

      <Link className="btn primary inline-link" to="/books">
        Browse books
      </Link>
    </section>
  );
}
