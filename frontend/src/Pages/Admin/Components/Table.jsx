// src/Admin/Components/Table.jsx

import React from "react";

export default function Table({ columns, data, renderActions }) {
  return (
    <div className="overflow-x-auto bg-white border rounded-lg">
      <table className="min-w-full">
        <thead className="bg-yellow-200">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-2 text-left font-semibold text-gray-700"
              >
                {col.title}
              </th>
            ))}

            {renderActions && <th className="px-4 py-2">Actions</th>}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + (renderActions ? 1 : 0)}
                className="px-4 py-4 text-center text-gray-500"
              >
                No data found
              </td>
            </tr>
          )}

          {data.map((row) => (
            <tr key={row.id} className="border-b hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-2">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}

              {renderActions && (
                <td className="px-4 py-2">{renderActions(row)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
