export default function DataTable({
  columns,
  data,
  startIndex = 0,
}) {
  const updatedColumns = [
    { header: "Sr No", accessor: "srNo", width: "80px" },
    ...columns,
  ];

  const gridColumns = updatedColumns
    .map((col) => col.width || "1fr")
    .join(" ");

  return (
    <div className="w-full bg-white shadow-md rounded-xl border border-gray-200 ">
      <table className="w-full border-separate border-spacing-0">
        <thead className="bg-purple-400 border-b">
          <tr
            className="border-b grid"
            style={{ gridTemplateColumns: gridColumns }}
          >
            {updatedColumns.map((col, i) => (
              <th key={i} className="px-2 py-2 text-xs font-semibold">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              className="hover:bg-gray-50 border-b border-gray-200 grid"
              style={{ gridTemplateColumns: gridColumns }}
            >
              {updatedColumns.map((col, i) => (
                <td key={i} className="px-1 py-2 text-xs text-center">
                  {col.accessor === "srNo"
                    ? startIndex + rowIndex + 1
                    : col.render
                    ? col.render(row)
                    : row[col.accessor] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}