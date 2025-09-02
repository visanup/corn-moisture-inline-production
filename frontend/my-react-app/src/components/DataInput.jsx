// src/components/DataInput.jsx
import React from 'react';

const DataInput = ({ rawInput, setRawInput, onStart, loading }) => (
  <div className="flex justify-center items-center mb-8">
    <input
      type="text"
      placeholder="กรอกข้อมูลบรรทัดเดียวตามรูปแบบ"
      value={rawInput}
      onChange={e => setRawInput(e.target.value)}
      className="flex-1 p-3 rounded-l-lg border border-gray-300 bg-white placeholder-black placeholder-opacity-50 focus:outline-none shadow-md"
    />
    <button
      onClick={onStart}
      disabled={loading}
      className="px-6 py-3 bg-yellow-500 text-white rounded-r-lg hover:bg-yellow-600 focus:outline-none shadow-md transition disabled:opacity-100"
    >
      {loading ? 'Loading...' : 'Start Data Collection'}
    </button>
  </div>
);

export default DataInput;
