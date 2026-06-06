import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function RegisterPage() {
  const { register, user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "member",
  });
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await register(form);
      toast.success("Account created");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h2>Create account</h2>
        <label>
          Name
          <input value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            required
          />
        </label>
        <label>
          Confirm password
          <input
            type="password"
            value={form.password_confirmation}
            onChange={(e) => updateField("password_confirmation", e.target.value)}
            required
          />
        </label>
        <label>
          Role
          <select value={form.role} onChange={(e) => updateField("role", e.target.value)}>
            <option value="member">Member</option>
            <option value="librarian">Librarian</option>
          </select>
        </label>
        <button type="submit" className="btn primary full" disabled={submitting}>
          {submitting ? "Creating..." : "Register"}
        </button>
        <p className="small">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
