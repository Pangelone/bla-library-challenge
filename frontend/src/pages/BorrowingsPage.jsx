import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import DataTable from "../components/DataTable";
import SectionHint from "../components/SectionHint";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function loanStatus(loan) {
  if (loan.returned_at) return { label: "Returned", variant: "neutral" };
  if (loan.overdue) return { label: "Overdue", variant: "danger" };
  return { label: "Active", variant: "success" };
}

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

  const columns = [
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
  ];

  if (isLibrarian) {
    columns.push({
      key: "member",
      label: "Member",
      render: (loan) => loan.user.name,
    });
  }

  columns.push(
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
      render: (loan) => {
        const status = loanStatus(loan);
        return <StatusBadge variant={status.variant}>{status.label}</StatusBadge>;
      },
    }
  );

  if (isLibrarian) {
    columns.push({
      key: "actions",
      label: "Actions",
      className: "col-actions",
      render: (loan) => {
        const busy = actionId === loan.id;
        const isReturned = Boolean(loan.returned_at);

        if (isReturned) {
          return <StatusBadge variant="neutral">Closed</StatusBadge>;
        }

        return (
          <div className="table-actions">
            <button
              type="button"
              className="btn btn-sm primary"
              disabled={busy}
              onClick={() => handleReturn(loan.id)}
            >
              {busy ? "Saving..." : "Return"}
            </button>
            <button
              type="button"
              className="btn btn-sm danger"
              disabled={busy}
              onClick={() => handleDelete(loan.id)}
            >
              Delete
            </button>
          </div>
        );
      },
    });
  }

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>Borrowings</h2>
          <p className="muted">
            {isLibrarian ? "Manage returns from the actions column." : "Your loan history."}
          </p>
        </div>
      </div>

      <SectionHint tone={isLibrarian ? "action" : "info"}>
        {isLibrarian
          ? "Librarian: Return and Delete are enabled on active rows only."
          : "Member: read-only table. Borrow new titles from Books."}
      </SectionHint>

      {!isLibrarian && (
        <p className="small">
          Need a new book? <Link to="/books">Browse the catalog</Link>
        </p>
      )}

      {loading ? (
        <Spinner label="Loading borrowings..." />
      ) : (
        <DataTable columns={columns} rows={borrowings} emptyMessage="No borrowings yet" />
      )}
    </section>
  );
}
