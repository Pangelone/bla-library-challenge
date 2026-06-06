// Small banner to explain if a block is clickable or just informational.
export default function SectionHint({ tone = "info", children }) {
  return <p className={`section-hint section-hint--${tone}`}>{children}</p>;
}
