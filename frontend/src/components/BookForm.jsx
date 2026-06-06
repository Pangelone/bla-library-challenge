import { useState } from "react";

const emptyBook = {
  title: "",
  author: "",
  genre: "",
  isbn: "",
  total_copies: 1,
};

// Reused for create + edit. Not fancy, but easy to defend in a code review.
export default function BookForm({ initial = emptyBook, onSubmit, onCancel, submitLabel = "Save" }) {
  const [book, setBook] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setBook((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSubmit({
        ...book,
        total_copies: Number(book.total_copies),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      <label>
        Title
        <input value={book.title} onChange={(e) => updateField("title", e.target.value)} required />
      </label>
      <label>
        Author
        <input value={book.author} onChange={(e) => updateField("author", e.target.value)} required />
      </label>
      <label>
        Genre
        <input value={book.genre} onChange={(e) => updateField("genre", e.target.value)} required />
      </label>
      <label>
        ISBN
        <input value={book.isbn} onChange={(e) => updateField("isbn", e.target.value)} required />
      </label>
      <label>
        Total copies
        <input
          type="number"
          min="1"
          value={book.total_copies}
          onChange={(e) => updateField("total_copies", e.target.value)}
          required
        />
      </label>

      {error && <p className="error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="btn primary" disabled={saving}>
          {saving ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
