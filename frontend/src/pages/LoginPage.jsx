import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const DEMO_ACCOUNTS = [
  { label: "Member demo", email: "member@library.test", password: "password123" },
  { label: "Librarian demo", email: "librarian@library.test", password: "password123" },
];

export default function LoginPage() {
  const { login, user } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("member@library.test");
  const [password, setPassword] = useState("password123");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  function fillAccount(account) {
    setEmail(account.email);
    setPassword(account.password);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const loggedIn = await login(email, password);
      toast.success(`Signed in as ${loggedIn.role}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h2>Sign in</h2>
        <p className="muted">Use the quick buttons to test both roles and permissions.</p>

        <div className="demo-buttons">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              className="btn ghost btn-sm"
              onClick={() => fillAccount(account)}
            >
              {account.label}
            </button>
          ))}
        </div>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="btn primary full" disabled={submitting}>
          {submitting ? "Signing in..." : "Log in"}
        </button>
        <p className="small">
          Need an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
