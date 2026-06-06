import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import DataTable from "../components/DataTable";
import EmptyState from "../components/EmptyState";
import SectionHint from "../components/SectionHint";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function StatCard({ label, value, tone = "neutral" }) {
  return (
    <div className={`card stat-card stat-card--${tone}`}>
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
          <p className="muted">Overview tables — actions are in Borrowings.</p>
        </div>

        <SectionHint tone="info">
          Librarian view: metrics + read-only tables. Use Borrowings to mark returns.
        </SectionHint>

        <div className="stats-grid">
          <StatCard label="Total books" value={data.total_books} tone="info" />
          <StatCard label="Currently borrowed" value={data.total_borrowed} tone="warning" />
          <StatCard label="Due today" value={data.due_today.length} tone="success" />
          <StatCard label="Members overdue" value={data.overdue_members.length} tone="danger" />
        </div>

        <h3 className="table-section-title">Due today</h3>
        <DataTable
          columns={[
            { key: "book", label: "Book", render: (item) => item.book.title },
            { key: "member", label: "Member", render: (item) => item.user.name },
            {
              key: "due",
              label: "Due",
              className: "col-compact",
              render: (item) => new Date(item.due_at).toLocaleDateString(),
            },
            {
              key: "status",
              label: "Status",
              className: "col-compact",
              render: () => <StatusBadge variant="warning">Due today</StatusBadge>,
            },
          ]}
          rows={data.due_today}
          emptyMessage="Nothing due today"
        />

        <h3 className="table-section-title">Overdue members</h3>
        <DataTable
          columns={[
            { key: "member", label: "Member", render: (entry) => entry.user.name },
            {
              key: "count",
              label: "Overdue books",
              className: "col-compact",
              render: (entry) => entry.overdue_count,
            },
            {
              key: "status",
              label: "Status",
              className: "col-compact",
              render: () => <StatusBadge variant="danger">Overdue</StatusBadge>,
            },
          ]}
          rows={data.overdue_members.map((entry) => ({ ...entry, id: entry.user.id }))}
          emptyMessage="No overdue members"
        />

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
        <p className="muted">Summary of your active loans.</p>
      </div>

      <SectionHint tone="info">
        Member view: read-only. Borrow from Books, returns via librarian.
      </SectionHint>

      <div className="stats-grid">
        <StatCard label="Active loans" value={data.borrowed_books.length} tone="info" />
        <StatCard label="Overdue" value={data.overdue_books.length} tone="danger" />
      </div>

      <h3 className="table-section-title">Current loans</h3>
      <DataTable
        columns={[
          {
            key: "book",
            label: "Book",
            render: (loan) => (
              <div>
                <strong>{loan.book.title}</strong>
                <div className="small muted">{loan.book.author}</div>
              </div>
            ),
          },
          {
            key: "due",
            label: "Due date",
            className: "col-compact",
            render: (loan) => new Date(loan.due_at).toLocaleDateString(),
          },
          {
            key: "status",
            label: "Status",
            className: "col-compact",
            render: (loan) =>
              loan.overdue ? (
                <StatusBadge variant="danger">Overdue</StatusBadge>
              ) : (
                <StatusBadge variant="success">On time</StatusBadge>
              ),
          },
        ]}
        rows={data.borrowed_books}
        emptyMessage="No active loans"
      />

      <Link className="btn primary inline-link" to="/books">
        Browse books
      </Link>
    </section>
  );
}
