import { useAuth } from "../context/AuthContext";
import DataTable from "./DataTable";
import EmptyState from "./EmptyState";
import StatusBadge from "./StatusBadge";

function borrowStatus(book, borrowingId) {
  if (borrowingId === book.id) {
    return { label: "Requesting...", disabled: true, variant: "info" };
  }
  if (book.user_has_active_loan) {
    return { label: "On loan", disabled: true, variant: "warning" };
  }
  if (!book.available) {
    return { label: "Unavailable", disabled: true, variant: "danger" };
  }
  return { label: "Borrow", disabled: false, variant: "success" };
}

function availabilityVariant(book) {
  if (book.available_copies === 0) return "danger";
  if (book.available_copies < book.total_copies) return "warning";
  return "success";
}

export default function BookList({ books, onBorrow, onEdit, onDelete, borrowing }) {
  const { isLibrarian, user } = useAuth();

  if (!books.length) {
    return <EmptyState title="No books found" detail="Try another search or ask a librarian to add titles." />;
  }

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (book) => <strong>{book.title}</strong>,
    },
    {
      key: "author",
      label: "Author",
      render: (book) => book.author,
    },
    {
      key: "genre",
      label: "Genre",
      render: (book) => book.genre,
    },
    {
      key: "isbn",
      label: "ISBN",
      render: (book) => <span className="mono">{book.isbn}</span>,
    },
    {
      key: "availability",
      label: "Copies",
      className: "col-compact",
      render: (book) => (
        <StatusBadge variant={availabilityVariant(book)}>
          {book.available_copies}/{book.total_copies} free
        </StatusBadge>
      ),
    },
  ];

  if (user?.role === "member") {
    columns.push({
      key: "status",
      label: "Your status",
      className: "col-compact",
      render: (book) => {
        const status = borrowStatus(book, borrowing);
        return <StatusBadge variant={status.variant}>{status.label}</StatusBadge>;
      },
    });
  }

  columns.push({
    key: "actions",
    label: "Actions",
    className: "col-actions",
    render: (book) => {
      const memberBorrow = user?.role === "member" ? borrowStatus(book, borrowing) : null;

      return (
        <div className="table-actions">
          {memberBorrow && (
            <button
              type="button"
              className={`btn btn-sm ${memberBorrow.disabled ? "btn-disabled" : "primary"}`}
              disabled={memberBorrow.disabled}
              onClick={() => onBorrow(book.id)}
            >
              {memberBorrow.label}
            </button>
          )}
          {isLibrarian && (
            <>
              <button type="button" className="btn btn-sm ghost" onClick={() => onEdit(book)}>
                Edit
              </button>
              <button type="button" className="btn btn-sm danger" onClick={() => onDelete(book.id)}>
                Delete
              </button>
            </>
          )}
        </div>
      );
    },
  });

  return <DataTable columns={columns} rows={books} emptyMessage="No books found" />;
}
