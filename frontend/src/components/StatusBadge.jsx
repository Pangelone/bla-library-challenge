export default function StatusBadge({ variant = "neutral", children }) {
  return <span className={`status-badge status-badge--${variant}`}>{children}</span>;
}
