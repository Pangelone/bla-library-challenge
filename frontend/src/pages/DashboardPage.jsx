import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

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
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const payload = isLibrarian ? await api.librarianDashboard() : await api.memberDashboard();
        setData(payload);
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, [isLibrarian]);

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!data) {
    return <p className="muted">Loading dashboard...</p>;
  }

  if (isLibrarian) {
    return (
      <section>
        <div className="section-head">
          <h2>Librarian dashboard</h2>
          <p className="muted">Quick snapshot for daily operations.</p>
        </div>

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
                <article key={item.id} className="card loan-card">
                  <strong>{item.book.title}</strong>
                  <p className="small">{item.user.name}</p>
                </article>
              ))}
              {!data.due_today.length && <p className="muted">Nothing due today.</p>}
            </div>
          </div>

          <div>
            <h3>Overdue members</h3>
            <div className="stack">
              {data.overdue_members.map((entry) => (
                <article key={entry.user.id} className="card loan-card">
                  <strong>{entry.user.name}</strong>
                  <p className="small">{entry.overdue_count} overdue book(s)</p>
                </article>
              ))}
              {!data.overdue_members.length && <p className="muted">No overdue members.</p>}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="section-head">
        <h2>My dashboard</h2>
        <p className="muted">What you have out and what's late.</p>
      </div>

      <div className="stats-grid">
        <StatCard label="Active loans" value={data.borrowed_books.length} />
        <StatCard label="Overdue" value={data.overdue_books.length} />
      </div>

      <h3>Current loans</h3>
      <div className="stack">
        {data.borrowed_books.map((loan) => (
          <article key={loan.id} className="card loan-card">
            <strong>{loan.book.title}</strong>
            <p className="small">
              Due {new Date(loan.due_at).toLocaleDateString()}
              {loan.overdue && <span className="badge warn"> overdue</span>}
            </p>
          </article>
        ))}
        {!data.borrowed_books.length && <p className="muted">You have no active loans.</p>}
      </div>
    </section>
  );
}
