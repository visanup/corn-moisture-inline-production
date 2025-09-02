// src/components/StatisticsTable.jsx
import React from 'react';

const fields = [
  { label: "ID", key: "id" },
  { label: "N", key: "N" },
  { label: "Min", key: "Min" },
  { label: "Max", key: "Max" },
  { label: "Range", key: "Range" },
  { label: "Average", key: "Average" },
  { label: "SD", key: "SD" },
  { label: "CV", key: "CV" },
  { label: "Median", key: "Median" },
  { label: "Skewness", key: "Skewness" },
  { label: "Kurtosis", key: "Kurtosis" },
  { label: "Variance", key: "Variance" }
];

const StatisticsTable = ({ rows, onDelete }) => (
  <section className="mt-4">
    <h3 className="text-lg font-semibold mb-2 text-purple-600">Latest Results</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border border-gray-300 text-xs">
        <thead className="bg-gray-50">
          <tr>
            {fields.map(field => (
              <th
                key={field.key}
                className="px-2 py-1 border-b border-gray-300 uppercase text-gray-600 text-left"
              >
                {field.label}
              </th>
            ))}
            <th className="px-2 py-1 border-b border-gray-300 uppercase text-gray-600 text-center">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rows.map((row, idx) => (
            <tr key={row.id} className={idx % 2 === 0 ? '' : 'bg-gray-50'}>
              {fields.map(field => {
                const value = row[field.key];
                return (
                  <td
                    key={field.key}
                    className="px-2 py-1 border-b border-gray-200 text-right text-black"
                  >
                    {typeof value === 'number'
                      ? value.toFixed(2)
                      : value ?? '-'}
                  </td>
                );
              })}
              <td className="px-2 py-1 border-b border-gray-200 text-center align-middle">
                <button
                  onClick={() => onDelete(row.id)}
                  className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default StatisticsTable;
