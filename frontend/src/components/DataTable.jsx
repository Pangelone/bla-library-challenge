export default function DataTable({ columns, rows, emptyMessage = "No data" }) {
  if (!rows.length) {
    return <p className="muted table-empty">{emptyMessage}</p>;
  }

  return (
    <div className="table-wrap card card--flat">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.className || ""}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={row.rowClassName || ""}>
              {columns.map((column) => (
                <td key={column.key} className={column.className || ""}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
