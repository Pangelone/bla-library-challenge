export default function Spinner({ label = "Loading..." }) {
  return (
    <div className="loading-block" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p className="muted">{label}</p>
    </div>
  );
}
