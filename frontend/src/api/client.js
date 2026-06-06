// Thin fetch wrapper around the Rails API.
// Single file so headers, errors, and token handling stay in one place.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

function getToken() {
  return localStorage.getItem("library_token");
}

export function setToken(token) {
  if (token) {
    localStorage.setItem("library_token", token);
  } else {
    localStorage.removeItem("library_token");
  }
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.error || data.errors?.join(", ") || "Request failed";
    throw new Error(message);
  }

  return data;
}

export const api = {
  register: (user) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ user }) }),

  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  me: () => request("/auth/me"),

  logout: () => request("/auth/logout", { method: "DELETE" }),

  listBooks: (q = "") => {
    const query = q ? `?q=${encodeURIComponent(q)}` : "";
    return request(`/books${query}`);
  },

  createBook: (book) =>
    request("/books", { method: "POST", body: JSON.stringify({ book }) }),

  updateBook: (id, book) =>
    request(`/books/${id}`, { method: "PATCH", body: JSON.stringify({ book }) }),

  deleteBook: (id) => request(`/books/${id}`, { method: "DELETE" }),

  listBorrowings: () => request("/borrowings"),

  borrowBook: (bookId) =>
    request("/borrowings", { method: "POST", body: JSON.stringify({ book_id: bookId }) }),

  returnBook: (borrowingId) =>
    request(`/borrowings/${borrowingId}/return`, { method: "PATCH" }),

  librarianDashboard: () => request("/dashboard/librarian"),

  memberDashboard: () => request("/dashboard/member"),
};
