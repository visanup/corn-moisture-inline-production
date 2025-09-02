// src/components/InterfaceResults.jsx
import React from 'react';

const InterfaceResults = ({ data, onInterface }) => {
  if (!data?.length) return null;

  // เลือก record ล่าสุด
  const latest = [...data]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];

  const stats = latest.statistics || {};

  // กำหนดคอลัมน์ตามลำดับและชื่อที่ต้องการ
  const columns = [
    { label: 'INSPECT LOT',   value: latest.ins_lot },
    { label: 'MATERIAL',      value: latest.material },
    { label: 'BATCH',         value: latest.batch },
    { label: 'PLANT',         value: latest.plant },
    { label: 'N',             value: stats.N },
    { label: 'MIN',           value: stats.minimum?.toFixed(3) ?? '–' },
    { label: 'MAX',           value: stats.maximum?.toFixed(3) ?? '–' },
    { label: 'RANGE',         value: stats.range?.toFixed(3) ?? '–' },
    { label: 'AVERAGE',       value: stats.average?.toFixed(3) ?? '–' },
    { label: 'SD',            value: stats.sd?.toFixed(3) ?? '–' },
    { label: 'CV',            value: stats.cv?.toFixed(3) ?? '–' },
    { label: 'MEDIAN',        value: stats.median?.toFixed(3) ?? '–' },
    { label: 'KURTOSIS',      value: stats.kurtosis?.toFixed(3) ?? '–' },
    { label: 'SKEWNESS',      value: stats.skewness?.toFixed(3) ?? '–' },
    { label: 'VARIANCE',      value: stats.variance?.toFixed(3) ?? '–' },
  ];

  return (
    <section className="mt-4">
      <h3 className="text-purple-600 font-bold mb-2">Latest Interface Results</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-300 text-xs">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th
                  key={col.label}
                  className="px-2 py-1 border-b border-gray-300 text-left font-medium text-gray-600 uppercase"
                >
                  {col.label}
                </th>
              ))}
              {/* ช่องว่างเสริมสำหรับปุ่ม */}
              <th className="px-2 py-1 border-b border-gray-300" />
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              {columns.map(col => (
                <td
                  key={col.label}
                  className="px-2 py-1 border-b border-gray-200 text-left text-black"
                >
                  {col.value}
                </td>
              ))}
              <td className="px-2 py-1 border-b border-gray-200 text-center align-middle">
                <button
                  onClick={onInterface}
                  className="px-8 py-3 bg-green-400 hover:bg-green-500 text-white text-lg font-semibold rounded whitespace-nowrap shadow-md transition"
                >
                  Interface
                </button>
                <div className="text-xs text-gray-700 mt-1">
                  Status: <span className="font-medium">{latest.interface_status}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default InterfaceResults;
