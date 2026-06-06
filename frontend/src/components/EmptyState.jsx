export default function EmptyState({ title, detail }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      {detail && <p className="muted">{detail}</p>}
    </div>
  );
}
